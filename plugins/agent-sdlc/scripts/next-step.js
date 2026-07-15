#!/usr/bin/env node

const { execFileSync } = require("node:child_process");
const fs = require("node:fs");

const STOP_STATUSES = new Set(["blocked", "needs_human", "needs-human"]);

function normalizeStatus(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/-/g, "_");
}

function normalizeText(value) {
  return String(value || "").trim();
}

function hasValue(value) {
  const text = normalizeText(value).toLowerCase();
  return Boolean(text) && !["none", "n/a", "not set", "missing", "pending"].includes(text);
}

function extractMarkdownSection(body, names) {
  if (!body || !String(body).trim()) return "";

  const wanted = names.map((name) => name.toLowerCase());
  const lines = String(body).split(/\r?\n/);
  let start = -1;
  let startLevel = 0;

  for (let index = 0; index < lines.length; index += 1) {
    const match = lines[index].match(/^(#{1,6})\s+(.+?)\s*$/);
    if (!match) continue;
    if (wanted.includes(match[2].trim().toLowerCase())) {
      start = index + 1;
      startLevel = match[1].length;
      break;
    }
  }

  if (start === -1) return "";

  const section = [];
  for (let index = start; index < lines.length; index += 1) {
    const match = lines[index].match(/^(#{1,6})\s+(.+?)\s*$/);
    if (match && match[1].length <= startLevel) break;
    section.push(lines[index]);
  }

  return section.join("\n").trim();
}

function parseAgentState(body) {
  const section = extractMarkdownSection(body, ["Agent State"]);
  const state = {};

  for (const line of section.split(/\r?\n/)) {
    const match = line.match(/^[-*]?\s*([^:]+):\s*(.*?)\s*$/);
    if (!match) continue;
    const key = match[1].trim().toLowerCase().replace(/\s+/g, "_");
    state[key] = match[2].trim();
  }

  return state;
}

function labelNames(labels) {
  if (!Array.isArray(labels)) return [];
  return labels.map((label) => label.name || label).filter(Boolean);
}

function readAgentState(input) {
  return {
    ...parseAgentState(input.issue?.body || input.body || ""),
    ...(input.agentState || {}),
  };
}

function prPresent(input, agentState) {
  return Boolean(input.pr) || hasValue(input.prUrl) || hasValue(agentState.pr);
}

function evidenceFresh(input, agentState) {
  if (typeof input.evidenceFresh === "boolean") return input.evidenceFresh;
  const prHead = normalizeText(input.pr?.headRefOid || input.pr?.headOid || input.headSha);
  const stateHead = normalizeText(agentState.head || agentState.head_sha || agentState.head_ref_oid);
  const headFresh = !prHead || !stateHead || prHead === stateHead;
  return headFresh && hasValue(agentState.checks) && hasValue(agentState.evidence);
}

function next(role, reason) {
  return { role, reason, stop: false };
}

function stop(reason) {
  return { role: "", reason, stop: true };
}

function resolveNextStep(input = {}) {
  const agentState = readAgentState(input);
  const labels = labelNames(input.issue?.labels || input.labels);
  const status = normalizeStatus(input.status || agentState.status);
  const hasPr = prPresent(input, agentState);
  const freshEvidence = evidenceFresh(input, agentState);

  if (STOP_STATUSES.has(status) || labels.includes("needs-human") || labels.includes("agent:blocked")) {
    return stop("Issue is blocked or needs human input.");
  }

  if (!status || status === "ready") {
    return next("sdlc-preflight", "Issue is ready and needs branch/worktree/dependency preflight.");
  }

  if (status === "preflight_passed") {
    return next("sdlc-dispatch-issue", "Preflight passed; dispatch or resume the worker.");
  }

  if (hasPr && !freshEvidence) {
    return next("sdlc-evidence", "PR exists but current-head evidence is missing or stale.");
  }

  if (status === "implementation_ready" || status === "active") {
    if (hasPr) return next("sdlc-evidence", "Implementation has a PR and needs evidence refresh.");
    return stop("Worker is active but no PR is recorded yet.");
  }

  if (status === "evidence_ready") {
    return next("sdlc-review-loop", "Evidence is ready; verify documentation and request independent review.");
  }

  if (status === "review_approved") {
    return next("sdlc-evidence", "Review is approved; refresh evidence before declaring merge readiness.");
  }

  if (status === "merge_ready") {
    return next("sdlc-merge-queue", "Issue is marked merge-ready.");
  }

  return stop(`No automatic next role for Agent State status "${status}".`);
}

function readJsonInput(args) {
  const inputIndex = args.indexOf("--input");
  if (inputIndex !== -1) return JSON.parse(fs.readFileSync(args[inputIndex + 1], "utf8"));
  if (args.includes("--stdin")) return JSON.parse(fs.readFileSync(0, "utf8"));
  return {};
}

function readGitHubIssue(issueNumber) {
  const raw = execFileSync(
    "gh",
    ["issue", "view", String(issueNumber), "--json", "number,title,body,labels,url,state"],
    { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"], maxBuffer: 1024 * 1024 * 4 }
  );
  return JSON.parse(raw);
}

function readGitHubPr(prNumber) {
  const raw = execFileSync(
    "gh",
    ["pr", "view", String(prNumber), "--json", "number,title,url,state,isDraft,headRefOid,files"],
    { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"], maxBuffer: 1024 * 1024 * 4 }
  );
  const pr = JSON.parse(raw);
  return {
    ...pr,
    files: Array.isArray(pr.files) ? pr.files.map((file) => file.path || file).filter(Boolean) : [],
  };
}

function parseArgs(argv) {
  const args = { input: readJsonInput(argv), issue: "", pr: "" };
  for (let index = 0; index < argv.length; index += 1) {
    if (argv[index] === "--issue") {
      index += 1;
      args.issue = argv[index] || "";
    } else if (argv[index] === "--pr") {
      index += 1;
      args.pr = argv[index] || "";
    }
  }
  return args;
}

function main() {
  try {
    const args = parseArgs(process.argv.slice(2));
    const input = { ...args.input };
    if (args.issue) input.issue = readGitHubIssue(args.issue);
    if (args.pr) {
      input.pr = readGitHubPr(args.pr);
      input.changedFiles = input.changedFiles || input.pr.files;
    }
    const result = resolveNextStep(input);
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  parseAgentState,
  resolveNextStep,
};
