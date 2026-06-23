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

function stripQuotes(value) {
  return value.replace(/^["']|["']$/g, "");
}

function parseScalar(value) {
  const trimmed = stripQuotes(value.trim());
  if (trimmed === "true") return true;
  if (trimmed === "false") return false;
  if (/^\d+$/.test(trimmed)) return Number(trimmed);
  return trimmed;
}

function parseKnownConfig(raw) {
  const config = {};
  const stack = [];

  for (const originalLine of raw.split(/\r?\n/)) {
    const withoutComment = originalLine.replace(/\s+#.*$/, "");
    if (!withoutComment.trim()) continue;

    const indent = withoutComment.match(/^ */)[0].length;
    const line = withoutComment.trim();

    while (stack.length && stack[stack.length - 1].indent >= indent) {
      stack.pop();
    }

    if (line.startsWith("- ")) {
      const parent = stack.map((entry) => entry.key).join(".");
      if (parent === "commands.verify") {
        config.commands = config.commands || {};
        config.commands.verify = config.commands.verify || [];
        config.commands.verify.push(stripQuotes(line.slice(2).trim()));
      }
      if (parent === "ci.fastChecks") {
        config.ci = config.ci || {};
        config.ci.fastChecks = config.ci.fastChecks || [];
        config.ci.fastChecks.push(stripQuotes(line.slice(2).trim()));
      }
      if (parent === "ci.humanReviewRisks") {
        config.ci = config.ci || {};
        config.ci.humanReviewRisks = config.ci.humanReviewRisks || [];
        config.ci.humanReviewRisks.push(stripQuotes(line.slice(2).trim()));
      }
      if (parent.startsWith("ci.riskyPaths.")) {
        const category = parent.split(".").pop();
        config.ci = config.ci || {};
        config.ci.riskyPaths = config.ci.riskyPaths || {};
        config.ci.riskyPaths[category] = config.ci.riskyPaths[category] || [];
        config.ci.riskyPaths[category].push(stripQuotes(line.slice(2).trim()));
      }
      if (parent === "merge.requireHumanFor") {
        config.merge = config.merge || {};
        config.merge.requireHumanFor = config.merge.requireHumanFor || [];
        config.merge.requireHumanFor.push(stripQuotes(line.slice(2).trim()));
      }
      continue;
    }

    const match = line.match(/^([^:]+):(.*)$/);
    if (!match) continue;

    const key = match[1].trim();
    const value = match[2].trim();
    const pathKeys = stack.map((entry) => entry.key).concat(key);
    const pathName = pathKeys.join(".");

    if (!value) {
      stack.push({ key, indent });
      continue;
    }

    if (pathName === "projectName") config.projectName = parseScalar(value);
    if (pathName === "defaultBase") config.defaultBase = parseScalar(value);
    if (pathName === "commands.verify" && value === "[]") {
      config.commands = config.commands || {};
      config.commands.verify = [];
    }
    if (pathName === "ci.fastChecks" && value === "[]") {
      config.ci = config.ci || {};
      config.ci.fastChecks = [];
    }
    if (pathName === "ci.humanReviewRisks" && value === "[]") {
      config.ci = config.ci || {};
      config.ci.humanReviewRisks = [];
    }
    if (pathName === "github.issues") {
      config.github = config.github || {};
      config.github.issues = parseScalar(value);
    }
    if (pathName.startsWith("github.labels.")) {
      config.github = config.github || {};
      config.github.labels = config.github.labels || {};
      config.github.labels[key] = parseScalar(value);
    }
    if (pathName.startsWith("ci.integration.labels.")) {
      config.ci = config.ci || {};
      config.ci.integration = config.ci.integration || {};
      config.ci.integration.labels = config.ci.integration.labels || {};
      config.ci.integration.labels[key] = parseScalar(value);
    }
    if (pathName === "ci.integration.mergeQueue") {
      config.ci = config.ci || {};
      config.ci.integration = config.ci.integration || {};
      config.ci.integration.mergeQueue = parseScalar(value);
    }
    if (pathName === "ci.integration.mergeGroup") {
      config.ci = config.ci || {};
      config.ci.integration = config.ci.integration || {};
      config.ci.integration.mergeGroup = parseScalar(value);
    }
    if (pathName === "workflow.maxActiveIssues") {
      config.workflow = config.workflow || {};
      config.workflow.maxActiveIssues = parseScalar(value);
    }
    if (pathName === "workflow.requireIssueBeforeImplementation") {
      config.workflow = config.workflow || {};
      config.workflow.requireIssueBeforeImplementation = parseScalar(value);
    }
    if (pathName === "workflow.defaultBranchType") {
      config.workflow = config.workflow || {};
      config.workflow.defaultBranchType = parseScalar(value);
    }
    if (pathName === "workflow.allowSpeculativeBranches") {
      config.workflow = config.workflow || {};
      config.workflow.allowSpeculativeBranches = parseScalar(value);
    }
    if (pathName === "merge.mode") {
      config.merge = config.merge || {};
      config.merge.mode = parseScalar(value);
    }
    if (pathName === "threads.reviewer.mode") {
      config.threads = config.threads || {};
      config.threads.reviewer = config.threads.reviewer || {};
      config.threads.reviewer.mode = parseScalar(value);
    }
    if (pathName === "threads.reviewer.title") {
      config.threads = config.threads || {};
      config.threads.reviewer = config.threads.reviewer || {};
      config.threads.reviewer.title = parseScalar(value);
    }
    if (pathName === "threads.docs.mode") {
      config.threads = config.threads || {};
      config.threads.docs = config.threads.docs || {};
      config.threads.docs.mode = parseScalar(value);
    }
    if (pathName === "threads.docs.title") {
      config.threads = config.threads || {};
      config.threads.docs = config.threads.docs || {};
      config.threads.docs.title = parseScalar(value);
    }
    if (pathName === "review.maxCycles") {
      config.review = config.review || {};
      config.review.maxCycles = parseScalar(value);
    }
    if (pathName === "review.requireCleanWorkingTree") {
      config.review = config.review || {};
      config.review.requireCleanWorkingTree = parseScalar(value);
    }
    if (pathName === "review.requireInlineFindings") {
      config.review = config.review || {};
      config.review.requireInlineFindings = parseScalar(value);
    }
  }

  return config;
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

function readConfig(repoRoot) {
  const defaults = {
    projectName: getProjectName(repoRoot),
    defaultBase: getDefaultBranch(repoRoot),
    commands: { verify: [] },
    github: {
      issues: true,
      labels: {
        ready: "agent:ready",
        active: "agent:active",
        blocked: "agent:blocked",
        review: "agent:review",
        speculative: "agent:speculative",
        needsHuman: "needs-human",
        fullCi: "full-ci",
        readyToMerge: "ready-to-merge",
        stacked: "stacked",
      },
    },
    ci: {
      fastChecks: [],
      integration: {
        labels: {
          fullCi: "full-ci",
          readyToMerge: "ready-to-merge",
        },
        mergeQueue: false,
        mergeGroup: false,
      },
      humanReviewRisks: ["auth", "data", "migration", "security", "public-api", "billing"],
      riskyPaths: {},
    },
    workflow: {
      maxActiveIssues: 5,
      requireIssueBeforeImplementation: true,
      defaultBranchType: "short-lived",
      allowSpeculativeBranches: true,
    },
    merge: {
      mode: "auto",
      requireHumanFor: ["auth", "data", "migration", "security", "public-api", "billing"],
    },
    threads: {
      reviewer: {
        mode: "reuse-or-create",
        title: `Reviewer: ${getProjectName(repoRoot)}`,
      },
      docs: {
        mode: "reuse-or-create",
        title: `Docs: ${getProjectName(repoRoot)}`,
      },
    },
    review: {
      maxCycles: 2,
      requireCleanWorkingTree: false,
      requireInlineFindings: true,
    },
  };

  const configPath = path.join(repoRoot, ".agent-sdlc.yml");
  if (!fs.existsSync(configPath)) return defaults;

  const parsed = parseKnownConfig(fs.readFileSync(configPath, "utf8"));
  const projectName = parsed.projectName || defaults.projectName;
  const verifyCommands =
    parsed.commands && Array.isArray(parsed.commands.verify)
      ? parsed.commands.verify
      : defaults.commands.verify;
  const requireHumanFor = Array.isArray(parsed.merge?.requireHumanFor)
    ? parsed.merge.requireHumanFor
    : defaults.merge.requireHumanFor;

  return {
    projectName,
    defaultBase: parsed.defaultBase || defaults.defaultBase,
    commands: {
      verify: verifyCommands,
    },
    github: {
      issues: parsed.github?.issues ?? defaults.github.issues,
      labels: {
        ...defaults.github.labels,
        ...(parsed.github?.labels || {}),
      },
    },
    ci: {
      fastChecks: Array.isArray(parsed.ci?.fastChecks)
        ? parsed.ci.fastChecks
        : verifyCommands,
      integration: {
        labels: {
          ...defaults.ci.integration.labels,
          ...(parsed.ci?.integration?.labels || {}),
        },
        mergeQueue: parsed.ci?.integration?.mergeQueue ?? defaults.ci.integration.mergeQueue,
        mergeGroup: parsed.ci?.integration?.mergeGroup ?? defaults.ci.integration.mergeGroup,
      },
      humanReviewRisks: Array.isArray(parsed.ci?.humanReviewRisks)
        ? parsed.ci.humanReviewRisks
        : requireHumanFor,
      riskyPaths: parsed.ci?.riskyPaths || defaults.ci.riskyPaths,
    },
    workflow: {
      maxActiveIssues: parsed.workflow?.maxActiveIssues ?? defaults.workflow.maxActiveIssues,
      requireIssueBeforeImplementation:
        parsed.workflow?.requireIssueBeforeImplementation ??
        defaults.workflow.requireIssueBeforeImplementation,
      defaultBranchType: parsed.workflow?.defaultBranchType || defaults.workflow.defaultBranchType,
      allowSpeculativeBranches:
        parsed.workflow?.allowSpeculativeBranches ?? defaults.workflow.allowSpeculativeBranches,
    },
    merge: {
      mode: parsed.merge?.mode || defaults.merge.mode,
      requireHumanFor,
    },
    threads: {
      reviewer: {
        mode: parsed.threads?.reviewer?.mode || defaults.threads.reviewer.mode,
        title: `Reviewer: ${projectName}`,
      },
      docs: {
        mode: parsed.threads?.docs?.mode || defaults.threads.docs.mode,
        title: parsed.threads?.docs?.title || `Docs: ${projectName}`,
      },
    },
    review: {
      maxCycles: parsed.review?.maxCycles ?? defaults.review.maxCycles,
      requireCleanWorkingTree:
        parsed.review?.requireCleanWorkingTree ?? defaults.review.requireCleanWorkingTree,
      requireInlineFindings:
        parsed.review?.requireInlineFindings ?? defaults.review.requireInlineFindings,
    },
  };
}

function normalizeRepoRoot(inputDir) {
  const resolved = path.resolve(inputDir || process.cwd());
  return runGit(resolved, ["rev-parse", "--show-toplevel"]);
}

function porcelainToFiles(status) {
  if (!status.trim()) return "No changed files reported by git status.";

  return status
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line) => {
      const code = line.slice(0, 2);
      const file = line.slice(3).replace(/^"|"$/g, "");
      return `${code} ${file}`;
    })
    .join("\n");
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

function formatNamedList(title, values) {
  if (!values || !values.length) return `${title}: none configured`;
  return [`${title}:`, ...values.map((value) => `  - ${value}`)].join("\n");
}

function formatRiskyPathCategories(riskyPaths) {
  const entries = Object.entries(riskyPaths || {}).filter(
    ([, patterns]) => Array.isArray(patterns) && patterns.length
  );

  if (!entries.length) return "Risky path categories: none configured";

  return [
    "Risky path categories:",
    ...entries.map(([category, patterns]) => `  - ${category}: ${patterns.join(", ")}`),
  ].join("\n");
}

function formatCiPolicy(config) {
  const ci = config.ci || {};
  const integration = ci.integration || {};
  const labels = integration.labels || {};

  return [
    formatNamedList("Fast checks", ci.fastChecks || []),
    `Integration labels: fullCi=${labels.fullCi || "not configured"}, readyToMerge=${
      labels.readyToMerge || "not configured"
    }`,
    `Merge queue evidence accepted: ${integration.mergeQueue ? "yes" : "no"}`,
    `Merge group evidence accepted: ${integration.mergeGroup ? "yes" : "no"}`,
    formatNamedList("Human-review risks", ci.humanReviewRisks || []),
    formatRiskyPathCategories(ci.riskyPaths),
  ].join("\n");
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
    body: "No issue context provided.",
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
    body: body || "No issue body provided.",
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
      body: `Issue context unavailable from gh.${stderr ? `\n${stderr}` : ""}`,
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
    ISSUE_BODY: issueContext.body,
    CI_POLICY: formatCiPolicy(config),
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
  getBranchDiff,
  issueContextFromPayload,
  parseKnownConfig,
  readConfig,
  readIssueContext,
  resolveBaseRef,
};
