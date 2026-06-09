#!/usr/bin/env node

const fs = require("node:fs/promises");
const path = require("node:path");

function ensureVersion(version) {
  if (!version || typeof version !== "string") {
    throw new Error("Version is required");
  }
}

async function updatePackageVersion({ repoRoot, version }) {
  ensureVersion(version);

  const packageJsonPath = path.join(repoRoot, "package.json");
  const raw = await fs.readFile(packageJsonPath, "utf8");
  const data = JSON.parse(raw);
  data.version = version;
  await fs.writeFile(packageJsonPath, `${JSON.stringify(data, null, 2)}\n`);

  return ["package.json"];
}

async function main() {
  try {
    const changedFiles = await updatePackageVersion({
      repoRoot: process.cwd(),
      version: process.argv[2],
    });
    console.log(`Updated package version in ${changedFiles.length} file.`);
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  updatePackageVersion,
};
