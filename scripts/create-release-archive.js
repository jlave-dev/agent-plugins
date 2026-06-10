#!/usr/bin/env node

const { execFile } = require("node:child_process");
const fs = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");
const { promisify } = require("node:util");

const execFileAsync = promisify(execFile);

const RELEASE_ENTRIES = [
  ".agents",
  "plugins",
  "README.md",
  "TERMS.md",
  "PRIVACY.md",
  "package.json",
];

function ensureVersion(version) {
  if (!version || typeof version !== "string") {
    throw new Error("Version is required");
  }
}

async function readPackageVersion(repoRoot) {
  const packageJsonPath = path.join(repoRoot, "package.json");
  const raw = await fs.readFile(packageJsonPath, "utf8");
  return JSON.parse(raw).version;
}

async function copyReleaseEntries({ repoRoot, stagingDir }) {
  for (const entry of RELEASE_ENTRIES) {
    const source = path.join(repoRoot, entry);
    const destination = path.join(stagingDir, entry);

    await fs.cp(source, destination, {
      recursive: true,
      filter: (sourcePath) => path.basename(sourcePath) !== ".DS_Store",
    });
  }
}

async function removeOldArchives(distDir) {
  let entries;
  try {
    entries = await fs.readdir(distDir);
  } catch (error) {
    if (error.code === "ENOENT") {
      return;
    }
    throw error;
  }

  await Promise.all(
    entries
      .filter((entry) => /^agent-skills-v.+\.tar\.gz$/.test(entry))
      .map((entry) => fs.rm(path.join(distDir, entry), { force: true }))
  );
}

async function createReleaseArchive({ repoRoot, version }) {
  ensureVersion(version);

  const packageVersion = await readPackageVersion(repoRoot);
  if (packageVersion !== version) {
    throw new Error(
      `package.json version ${packageVersion} does not match release version ${version}`
    );
  }

  const distDir = path.join(repoRoot, "dist");
  const archiveName = `agent-skills-v${version}.tar.gz`;
  const archivePath = path.join(distDir, archiveName);
  const stagingDir = await fs.mkdtemp(path.join(os.tmpdir(), "agent-skills-release-"));

  try {
    await fs.mkdir(distDir, { recursive: true });
    await removeOldArchives(distDir);
    await copyReleaseEntries({ repoRoot, stagingDir });
    await execFileAsync("tar", [
      "-czf",
      archivePath,
      "-C",
      stagingDir,
      ...RELEASE_ENTRIES,
    ]);
  } finally {
    await fs.rm(stagingDir, { recursive: true, force: true });
  }

  return {
    archiveName,
    archivePath,
  };
}

async function main() {
  try {
    const { archivePath } = await createReleaseArchive({
      repoRoot: process.cwd(),
      version: process.argv[2],
    });
    console.log(`Created release archive at ${archivePath}.`);
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  RELEASE_ENTRIES,
  createReleaseArchive,
};
