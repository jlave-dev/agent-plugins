#!/usr/bin/env node

const { execFileSync } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

function tryGit(repoRoot, args, fallback = "") {
  try {
    return execFileSync("git", args, {
      cwd: repoRoot,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch {
    return fallback;
  }
}

function normalizeProjectDir(inputDir) {
  return path.resolve(inputDir || process.cwd());
}

function readJsonIfPresent(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch {
    return null;
  }
}

function getDefaultBranch(projectDir) {
  const root = tryGit(projectDir, ["rev-parse", "--show-toplevel"], projectDir);
  const originHead = tryGit(root, ["symbolic-ref", "--quiet", "--short", "refs/remotes/origin/HEAD"]);
  if (originHead) return originHead.replace(/^origin\//, "");
  return "main";
}

function detectPackageManager(projectDir) {
  if (fs.existsSync(path.join(projectDir, "pnpm-lock.yaml"))) return "pnpm";
  if (fs.existsSync(path.join(projectDir, "yarn.lock"))) return "yarn";
  if (fs.existsSync(path.join(projectDir, "bun.lockb")) || fs.existsSync(path.join(projectDir, "bun.lock"))) return "bun";
  if (fs.existsSync(path.join(projectDir, "package-lock.json"))) return "npm";
  if (fs.existsSync(path.join(projectDir, "package.json"))) return "npm";
  return null;
}

function runCommand(packageManager, scriptName) {
  if (scriptName === "test") {
    if (packageManager === "npm") return "npm test";
    return `${packageManager} test`;
  }
  return `${packageManager} run ${scriptName}`;
}

function detectVerifyCommands(projectDir) {
  const packageJson = readJsonIfPresent(path.join(projectDir, "package.json"));
  const packageManager = detectPackageManager(projectDir);

  if (!packageJson || !packageJson.scripts || !packageManager) {
    return [];
  }

  const scripts = packageJson.scripts;
  if (scripts.verify) return [runCommand(packageManager, "verify")];

  return ["typecheck", "lint", "test", "build"]
    .filter((scriptName) => scripts[scriptName])
    .map((scriptName) => runCommand(packageManager, scriptName));
}

function getProjectName(projectDir) {
  const packageJson = readJsonIfPresent(path.join(projectDir, "package.json"));
  return packageJson && packageJson.name ? packageJson.name : path.basename(projectDir);
}

function renderVerifyCommands(commands) {
  if (!commands.length) return "  verify: []";
  return ["  verify:", ...commands.map((command) => `    - ${command}`)].join("\n");
}

function fillTemplate(template, values) {
  return template.replace(/\{\{([A-Z_]+)\}\}/g, (_, key) => values[key] ?? "");
}

function buildConfig(projectDir) {
  const templatePath = path.join(__dirname, "..", "assets", "project-config-template.yml");
  const template = fs.readFileSync(templatePath, "utf8");
  const projectName = getProjectName(projectDir);

  return fillTemplate(template, {
    PROJECT_NAME: projectName,
    DEFAULT_BASE: getDefaultBranch(projectDir),
    VERIFY_COMMANDS: renderVerifyCommands(detectVerifyCommands(projectDir)),
  });
}

function parseArgs(argv) {
  const args = {
    projectDir: process.cwd(),
    write: false,
    force: false,
  };

  for (const arg of argv) {
    if (arg === "--write") {
      args.write = true;
    } else if (arg === "--force") {
      args.force = true;
    } else {
      args.projectDir = arg;
    }
  }

  return args;
}

function main() {
  try {
    const args = parseArgs(process.argv.slice(2));
    const projectDir = normalizeProjectDir(args.projectDir);
    const config = buildConfig(projectDir);
    const configPath = path.join(projectDir, ".agent-sdlc.yml");

    if (!args.write) {
      process.stdout.write(config);
      process.stdout.write("\n");
      process.stderr.write("Dry run only. Re-run with --write after explicit user approval to create .agent-sdlc.yml.\n");
      return;
    }

    if (fs.existsSync(configPath) && !args.force) {
      throw new Error(".agent-sdlc.yml already exists. Re-run with --force only after explicit replacement approval.");
    }

    fs.writeFileSync(configPath, `${config.trimEnd()}\n`);
    process.stdout.write(`Wrote ${configPath}\n`);
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  buildConfig,
  detectPackageManager,
  detectVerifyCommands,
};
