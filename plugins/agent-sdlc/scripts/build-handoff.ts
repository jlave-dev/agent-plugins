#!/usr/bin/env node

const { execFileSync } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

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
    threads: {
      reviewer: {
        mode: "reuse-or-create",
        title: `Reviewer: ${getProjectName(repoRoot)}`,
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

  return {
    projectName,
    defaultBase: parsed.defaultBase || defaults.defaultBase,
    commands: {
      verify: parsed.commands && Array.isArray(parsed.commands.verify)
        ? parsed.commands.verify
        : defaults.commands.verify,
    },
    threads: {
      reviewer: {
        mode: parsed.threads?.reviewer?.mode || defaults.threads.reviewer.mode,
        title: parsed.threads?.reviewer?.title || `Reviewer: ${projectName}`,
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

function formatVerifyCommands(commands) {
  if (!commands.length) return "No verification commands configured.";
  return commands.map((command) => `not run by handoff helper: ${command}`).join("\n");
}

function fillTemplate(template, values) {
  return template.replace(/\{\{([A-Z_]+)\}\}/g, (_, key) => values[key] ?? "");
}

function buildHandoff(repoRoot) {
  const config = readConfig(repoRoot);
  const templatePath = path.join(__dirname, "..", "assets", "handoff-template.md");
  const template = fs.readFileSync(templatePath, "utf8");
  const branch = valueOrNone(
    tryGit(repoRoot, ["branch", "--show-current"]),
    valueOrNone(tryGit(repoRoot, ["rev-parse", "--short", "HEAD"]), "unknown")
  );
  const status = tryGit(repoRoot, ["status", "--short", "--branch"]);

  return fillTemplate(template, {
    PROJECT_NAME: String(config.projectName),
    PROJECT_DIR: repoRoot,
    BRANCH: branch,
    BASE_BRANCH: String(config.defaultBase),
    GENERATED_AT: new Date().toISOString(),
    STATUS_SUMMARY: valueOrNone(status, "No status output."),
    CHANGED_FILES: porcelainToFiles(status.split(/\r?\n/).slice(1).join("\n")),
    DIFF_STAT: valueOrNone(tryGit(repoRoot, ["diff", "--stat", "HEAD", "--"]), "No tracked diff stat."),
    STAGED_SUMMARY: valueOrNone(tryGit(repoRoot, ["diff", "--cached", "--name-status"]), "No staged changes."),
    UNSTAGED_SUMMARY: valueOrNone(tryGit(repoRoot, ["diff", "--name-status"]), "No unstaged tracked changes."),
    VERIFY_COMMANDS: formatVerifyCommands(config.commands.verify),
  });
}

function main() {
  try {
    const repoRoot = normalizeRepoRoot(process.argv[2]);
    process.stdout.write(buildHandoff(repoRoot));
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
  parseKnownConfig,
  readConfig,
};
