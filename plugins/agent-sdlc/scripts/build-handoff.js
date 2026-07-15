#!/usr/bin/env node

const { execFileSync } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

const CI_TIERS = [
  "fast-check-only",
  "full-ci-required",
  "full-ci-before-merge",
  "human-decision",
];

function runGit(repoRoot, args) {
  try {
    return execFileSync("git", args, {
      cwd: repoRoot,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
      maxBuffer: 1024 * 1024 * 8,
    }).trim();
  } catch (error) {
    const stderr = error.stderr ? String(error.stderr).trim() : "";
    throw new Error(`git ${args.join(" ")} failed${stderr ? `: ${stderr}` : ""}`);
  }
}

function tryGit(repoRoot, args, fallback = "") {
  try {
    return runGit(repoRoot, args);
  } catch {
    return fallback;
  }
}

function readJsonIfPresent(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch {
    return null;
  }
}

function getProjectName(repoRoot) {
  const packageJson = readJsonIfPresent(path.join(repoRoot, "package.json"));
  return packageJson && packageJson.name ? packageJson.name : path.basename(repoRoot);
}

function getDefaultBranch(repoRoot) {
  const originHead = tryGit(repoRoot, ["symbolic-ref", "--quiet", "--short", "refs/remotes/origin/HEAD"]);
  if (originHead) return originHead.replace(/^origin\//, "");
  return "main";
}

function detectPackageManager(repoRoot) {
  if (fs.existsSync(path.join(repoRoot, "pnpm-lock.yaml"))) return "pnpm";
  if (fs.existsSync(path.join(repoRoot, "yarn.lock"))) return "yarn";
  if (fs.existsSync(path.join(repoRoot, "bun.lockb")) || fs.existsSync(path.join(repoRoot, "bun.lock"))) return "bun";
  if (fs.existsSync(path.join(repoRoot, "package-lock.json")) || fs.existsSync(path.join(repoRoot, "package.json"))) return "npm";
  return "";
}

function scriptCommand(packageManager, scriptName) {
  if (scriptName === "test") return packageManager === "npm" ? "npm test" : `${packageManager} test`;
  return `${packageManager} run ${scriptName}`;
}

function detectVerifyCommands(repoRoot) {
  const packageJson = readJsonIfPresent(path.join(repoRoot, "package.json"));
  const packageManager = detectPackageManager(repoRoot);
  if (!packageJson?.scripts || !packageManager) return [];
  if (packageJson.scripts.verify) return [scriptCommand(packageManager, "verify")];
  return ["typecheck", "lint", "test", "build"]
    .filter((scriptName) => packageJson.scripts[scriptName])
    .map((scriptName) => scriptCommand(packageManager, scriptName));
}

function readConfig(repoRoot) {
  const detectedVerifyCommands = detectVerifyCommands(repoRoot);
  return {
    projectName: getProjectName(repoRoot),
    defaultBase: getDefaultBranch(repoRoot),
    commands: { verify: detectedVerifyCommands },
  };
}

function normalizeRepoRoot(inputDir) {
  const resolved = path.resolve(inputDir || process.cwd());
  return runGit(resolved, ["rev-parse", "--show-toplevel"]);
}

function valueOrNone(value, noneText) {
  return value && value.trim() ? value.trim() : noneText;
}

function uniqueValues(values) {
  return values.filter((value, index) => value && values.indexOf(value) === index);
}

function resolveCommit(repoRoot, ref) {
  return tryGit(repoRoot, ["rev-parse", "--verify", `${ref}^{commit}`]);
}

function resolveBaseRef(repoRoot, defaultBase) {
  const requested = String(defaultBase || "main").trim();
  const candidates = requested.includes("/")
    ? [requested]
    : [`origin/${requested}`, `refs/remotes/origin/${requested}`, requested, `refs/heads/${requested}`];

  for (const candidate of uniqueValues(candidates)) {
    const sha = resolveCommit(repoRoot, candidate);
    if (sha) {
      return {
        requested,
        ref: candidate,
        sha,
      };
    }
  }

  return {
    requested,
    ref: "",
    sha: "",
  };
}

function getBranchDiff(repoRoot, defaultBase) {
  const base = resolveBaseRef(repoRoot, defaultBase);
  if (!base.sha) {
    return {
      baseRef: `unresolved: ${base.requested}`,
      compareRange: "unavailable",
      changedFiles: `Base ref "${base.requested}" was not found; committed branch diff unavailable.`,
      diffStat: `Base ref "${base.requested}" was not found; committed branch diff unavailable.`,
    };
  }

  const mergeBase = tryGit(repoRoot, ["merge-base", base.ref, "HEAD"]);
  if (!mergeBase) {
    return {
      baseRef: base.ref,
      compareRange: "unavailable",
      changedFiles: `Could not find a merge-base between ${base.ref} and HEAD.`,
      diffStat: `Could not find a merge-base between ${base.ref} and HEAD.`,
    };
  }

  const compareRange = `${mergeBase}..HEAD`;

  return {
    baseRef: base.ref,
    compareRange,
    changedFiles: valueOrNone(
      tryGit(repoRoot, ["diff", "--name-status", compareRange, "--"]),
      "No committed changes from base."
    ),
    diffStat: valueOrNone(
      tryGit(repoRoot, ["diff", "--stat", compareRange, "--"]),
      "No committed diff from base."
    ),
  };
}

function formatVerifyCommands(commands) {
  if (!commands.length) return "No verification commands configured.";
  return commands.map((command) => `not run by handoff helper: ${command}`).join("\n");
}

function extractMarkdownSection(body, names) {
  if (!body || !body.trim()) return "";

  const wanted = names.map((name) => name.toLowerCase());
  const lines = body.split(/\r?\n/);
  let start = -1;
  let startLevel = 0;

  for (let index = 0; index < lines.length; index += 1) {
    const match = lines[index].match(/^(#{1,6})\s+(.+?)\s*$/);
    if (!match) continue;

    const heading = match[2].trim().toLowerCase();
    if (wanted.includes(heading)) {
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

function truncateText(value, maxLength = 12000) {
  const text = value && value.trim() ? value.trim() : "";
  if (!text) return "";
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength).trimEnd()}\n\n[truncated by handoff helper]`;
}

function extractSectionField(section, names) {
  if (!section) return "";
  const wanted = names.map((name) => name.toLowerCase());

  for (const line of section.split(/\r?\n/)) {
    const match = line.match(/^[-*]?\s*([^:]+):\s*(.+?)\s*$/);
    if (!match) continue;
    if (wanted.includes(match[1].trim().toLowerCase())) return match[2].trim();
  }

  return "";
}

function normalizeCiTier(value) {
  const normalized = String(value || "").trim().toLowerCase();
  return CI_TIERS.includes(normalized) ? normalized : "";
}

function ciTierFromLabels(labelNames) {
  for (const label of labelNames) {
    const normalized = String(label || "")
      .trim()
      .toLowerCase()
      .replace(/^ci[:/]/, "")
      .replace(/^tier[:/]/, "");
    const tier = normalizeCiTier(normalized);
    if (tier) return tier;
  }

  return "";
}

function emptyIssueContext() {
  return {
    ref: "Not provided.",
    title: "Not provided.",
    state: "Not provided.",
    url: "Not provided.",
    labels: "Not provided.",
    acceptanceCriteria: "No issue context provided.",
    dependencies: "No issue context provided.",
    verification: "No issue context provided.",
    simulatorEvidence: "No issue context provided.",
    ciTier: "No CI tier declared.",
    ciEvidenceSource: "No CI evidence source declared.",
    ciStackPosition: "No stack position declared.",
    ciTierSection: "No CI tier context provided.",
  };
}

function issueContextFromPayload(payload) {
  const labelNames = Array.isArray(payload.labels)
    ? payload.labels.map((label) => label.name || label).filter(Boolean)
    : [];
  const labels = labelNames.join(", ");
  const body = truncateText(payload.body || "");
  const ciTierSection = extractMarkdownSection(body, ["CI Tier", "CI Tiers", "CI Policy"]);
  const ciTier =
    normalizeCiTier(extractSectionField(ciTierSection, ["Tier", "CI Tier"])) ||
    ciTierFromLabels(labelNames);
  const ciEvidenceSource = extractSectionField(ciTierSection, [
    "Evidence source",
    "Full integration evidence",
    "Integration evidence",
  ]);
  const ciStackPosition = extractSectionField(ciTierSection, [
    "Stack position",
    "Stack status",
    "Stack",
  ]);

  return {
    ref: payload.number ? `#${payload.number}` : "GitHub issue",
    title: payload.title || "Untitled issue",
    state: payload.state || "unknown",
    url: payload.url || "Not provided.",
    labels: labels || "none",
    acceptanceCriteria:
      extractMarkdownSection(body, ["Acceptance Criteria", "Acceptance"]) ||
      "No acceptance criteria section found.",
    dependencies:
      extractMarkdownSection(body, ["Dependencies", "Dependency", "Stacking"]) ||
      "No dependencies section found.",
    verification:
      extractMarkdownSection(body, ["Verification", "Checks", "Test Plan"]) ||
      "No verification section found.",
    simulatorEvidence:
      extractMarkdownSection(body, ["Simulator Evidence", "Device Evidence", "Visual Evidence"]) ||
      "No simulator evidence section found.",
    ciTier: ciTier || "No CI tier declared.",
    ciEvidenceSource: ciEvidenceSource || "No CI evidence source declared.",
    ciStackPosition: ciStackPosition || "No stack position declared.",
    ciTierSection: ciTierSection || "No CI tier section found.",
  };
}

function readIssueContext(repoRoot, issueRef) {
  if (!issueRef) return emptyIssueContext();

  try {
    const raw = execFileSync(
      "gh",
      ["issue", "view", String(issueRef), "--json", "number,title,body,labels,url,state"],
      {
        cwd: repoRoot,
        encoding: "utf8",
        stdio: ["ignore", "pipe", "pipe"],
        maxBuffer: 1024 * 1024 * 4,
      }
    );
    return issueContextFromPayload(JSON.parse(raw));
  } catch (error) {
    const stderr = error.stderr ? String(error.stderr).trim() : "";
    return {
      ...emptyIssueContext(),
      ref: String(issueRef),
      acceptanceCriteria: "Issue context unavailable from gh.",
      dependencies: "Issue context unavailable from gh.",
      verification: "Issue context unavailable from gh.",
      simulatorEvidence: "Issue context unavailable from gh.",
      ciTier: "Issue context unavailable from gh.",
      ciEvidenceSource: "Issue context unavailable from gh.",
      ciStackPosition: "Issue context unavailable from gh.",
      ciTierSection: "Issue context unavailable from gh.",
    };
  }
}

function fillTemplate(template, values) {
  return template.replace(/\{\{([A-Z_]+)\}\}/g, (_, key) => values[key] ?? "");
}

function buildHandoff(repoRoot, options = {}) {
  const config = readConfig(repoRoot);
  const templatePath = path.join(__dirname, "..", "assets", "handoff-template.md");
  const template = fs.readFileSync(templatePath, "utf8");
  const branch = valueOrNone(
    tryGit(repoRoot, ["branch", "--show-current"]),
    valueOrNone(tryGit(repoRoot, ["rev-parse", "--short", "HEAD"]), "unknown")
  );
  const status = tryGit(repoRoot, ["status", "--short", "--branch"]);
  const branchDiff = getBranchDiff(repoRoot, config.defaultBase);
  const issueContext = options.issueContext
    ? issueContextFromPayload(options.issueContext)
    : readIssueContext(repoRoot, options.issue);

  return fillTemplate(template, {
    PROJECT_NAME: String(config.projectName),
    PROJECT_DIR: repoRoot,
    BRANCH: branch,
    BASE_BRANCH: String(config.defaultBase),
    BASE_REF: branchDiff.baseRef,
    COMPARE_RANGE: branchDiff.compareRange,
    GENERATED_AT: new Date().toISOString(),
    STATUS_SUMMARY: valueOrNone(status, "No status output."),
    CHANGED_FILES: branchDiff.changedFiles,
    DIFF_STAT: branchDiff.diffStat,
    STAGED_SUMMARY: valueOrNone(tryGit(repoRoot, ["diff", "--cached", "--name-status"]), "No staged changes."),
    UNSTAGED_SUMMARY: valueOrNone(tryGit(repoRoot, ["diff", "--name-status"]), "No unstaged tracked changes."),
    VERIFY_COMMANDS: formatVerifyCommands(config.commands.verify),
    ISSUE_REF: issueContext.ref,
    ISSUE_TITLE: issueContext.title,
    ISSUE_STATE: issueContext.state,
    ISSUE_URL: issueContext.url,
    ISSUE_LABELS: issueContext.labels,
    ISSUE_ACCEPTANCE_CRITERIA: issueContext.acceptanceCriteria,
    ISSUE_DEPENDENCIES: issueContext.dependencies,
    ISSUE_VERIFICATION: issueContext.verification,
    ISSUE_SIMULATOR_EVIDENCE: issueContext.simulatorEvidence,
    ISSUE_CI_TIER: issueContext.ciTier,
    ISSUE_CI_EVIDENCE_SOURCE: issueContext.ciEvidenceSource,
    ISSUE_CI_STACK_POSITION: issueContext.ciStackPosition,
    ISSUE_CI_TIER_SECTION: issueContext.ciTierSection,
  });
}

function parseArgs(argv) {
  const args = {
    repoRoot: process.cwd(),
    issue: "",
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--issue") {
      index += 1;
      args.issue = argv[index] || "";
    } else if (arg.startsWith("--issue=")) {
      args.issue = arg.slice("--issue=".length);
    } else {
      args.repoRoot = arg;
    }
  }

  return args;
}

function main() {
  try {
    const args = parseArgs(process.argv.slice(2));
    const repoRoot = normalizeRepoRoot(args.repoRoot);
    process.stdout.write(buildHandoff(repoRoot, { issue: args.issue }));
    process.stdout.write("\n");
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  buildHandoff,
  detectVerifyCommands,
  getBranchDiff,
  issueContextFromPayload,
  readConfig,
  readIssueContext,
  resolveBaseRef,
};
