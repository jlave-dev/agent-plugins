#!/usr/bin/env node

const { execFileSync } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");
const { resolveBaseRef } = require("./build-handoff.ts");

const LOCAL_PATH_PATTERN =
  /(^|[\s"'`=])\/(?:Users\/|home\/[A-Za-z0-9._-]+\/|var\/folders\/|private\/(?:tmp|var)\/|opt\/homebrew\/|Volumes\/)/m;

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

function normalizeRepoRoot(inputDir) {
  const resolved = path.resolve(inputDir || process.cwd());
  return runGit(resolved, ["rev-parse", "--show-toplevel"]);
}

function normalizeRepoPath(filePath) {
  return String(filePath || "").replace(/^\.?\//, "").replace(/\\/g, "/");
}

function pathExistsAtRef(repoRoot, ref, filePath) {
  const repoPath = normalizeRepoPath(filePath);
  if (!repoPath) return false;
  try {
    runGit(repoRoot, ["cat-file", "-e", `${ref}:${repoPath}`]);
    return true;
  } catch {
    return false;
  }
}

function pathExistsInWorktree(repoRoot, filePath) {
  return fs.existsSync(path.join(repoRoot, normalizeRepoPath(filePath)));
}

function readPackageScripts(repoRoot, ref = "") {
  const raw = ref
    ? tryGit(repoRoot, ["show", `${ref}:package.json`])
    : fs.existsSync(path.join(repoRoot, "package.json"))
      ? fs.readFileSync(path.join(repoRoot, "package.json"), "utf8")
      : "";
  if (!raw) return {};
  try {
    return JSON.parse(raw).scripts || {};
  } catch {
    return {};
  }
}

function commandScriptName(command) {
  const match = String(command || "").trim().match(/^(?:npm|pnpm|yarn|bun)(?:\s+run)?\s+([^\s]+)/);
  if (!match) return "";
  return match[1] === "test" ? "test" : match[1];
}

function validateBaseRef(repoRoot, options = {}) {
  const base = resolveBaseRef(repoRoot, options.baseRef || "main");
  if (!base.sha) {
    return {
      ok: false,
      base,
      missingFiles: [],
      missingScripts: [],
      errors: [`Base ref "${base.requested}" was not found.`],
    };
  }

  const files = (options.files || []).map(normalizeRepoPath).filter(Boolean);
  const currentScripts = readPackageScripts(repoRoot);
  const baseScripts = readPackageScripts(repoRoot, base.ref);
  const missingFiles = files.filter(
    (filePath) => pathExistsInWorktree(repoRoot, filePath) && !pathExistsAtRef(repoRoot, base.ref, filePath)
  );
  const missingScripts = (options.commands || [])
    .map((command) => ({ command, script: commandScriptName(command) }))
    .filter(({ script }) => script && currentScripts[script] && !baseScripts[script]);

  return {
    ok: missingFiles.length === 0 && missingScripts.length === 0,
    base,
    missingFiles,
    missingScripts,
    errors: [],
  };
}

function assertSafeGitHubBody(body, options = {}) {
  const text = String(body || "");
  if (LOCAL_PATH_PATTERN.test(text)) {
    throw new Error("GitHub body contains a local absolute filesystem path.");
  }
  for (const term of options.denylist || []) {
    const value = String(term || "").trim();
    if (value && text.toLowerCase().includes(value.toLowerCase())) {
      throw new Error("GitHub body contains a denied secret or private term.");
    }
  }
  return text;
}

function replaceMarkdownSection(body, heading, nextContent, options = {}) {
  const level = options.level || 2;
  const marker = `${"#".repeat(level)} ${heading}`;
  const lines = String(body || "").split(/\r?\n/);
  const start = lines.findIndex((line) => line.trim().toLowerCase() === marker.toLowerCase());
  const replacement = [marker, ...String(nextContent || "").replace(/\s+$/u, "").split(/\r?\n/)];

  if (start === -1) {
    const joined = [String(body || "").trimEnd(), "", ...replacement].filter(Boolean).join("\n");
    return `${assertSafeGitHubBody(joined, options)}\n`;
  }

  let end = lines.length;
  for (let index = start + 1; index < lines.length; index += 1) {
    const match = lines[index].match(/^(#{1,6})\s+/);
    if (match && match[1].length <= level) {
      end = index;
      break;
    }
  }

  const joined = [...lines.slice(0, start), ...replacement, ...lines.slice(end)].join("\n");
  return assertSafeGitHubBody(joined, options);
}

function parseArgs(argv) {
  const args = { _: [], files: [], commands: [], denylist: [] };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--repo") args.repo = argv[++index] || "";
    else if (arg === "--base") args.baseRef = argv[++index] || "";
    else if (arg === "--file") args.files.push(argv[++index] || "");
    else if (arg === "--command") args.commands.push(argv[++index] || "");
    else if (arg === "--body-file") args.bodyFile = argv[++index] || "";
    else if (arg === "--section") args.section = argv[++index] || "";
    else if (arg === "--content-file") args.contentFile = argv[++index] || "";
    else if (arg === "--deny") args.denylist.push(argv[++index] || "");
    else args._.push(arg);
  }
  return args;
}

function main() {
  try {
    const args = parseArgs(process.argv.slice(2));
    const command = args._[0];

    if (command === "validate-base") {
      const repoRoot = normalizeRepoRoot(args.repo || process.cwd());
      const result = validateBaseRef(repoRoot, args);
      process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
      process.exitCode = result.ok ? 0 : 1;
      return;
    }

    if (command === "body") {
      const body = fs.readFileSync(args.bodyFile || 0, "utf8");
      const output =
        args.section && args.contentFile
          ? replaceMarkdownSection(body, args.section, fs.readFileSync(args.contentFile, "utf8"), args)
          : assertSafeGitHubBody(body, args);
      process.stdout.write(output);
      return;
    }

    throw new Error("Usage: guardrails.ts validate-base --base <ref> [--file <path>] [--command <cmd>] | body --body-file <file>");
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  assertSafeGitHubBody,
  replaceMarkdownSection,
  validateBaseRef,
};
