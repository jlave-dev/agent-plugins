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

  const changedFiles = [];
  const packageJsonPath = path.join(repoRoot, "package.json");
  const raw = await fs.readFile(packageJsonPath, "utf8");
  const data = JSON.parse(raw);
  data.version = version;
  await fs.writeFile(packageJsonPath, `${JSON.stringify(data, null, 2)}\n`);
  changedFiles.push("package.json");

  const pluginsDir = path.join(repoRoot, "plugins");
  let pluginEntries;
  try {
    pluginEntries = await fs.readdir(pluginsDir, { withFileTypes: true });
  } catch (error) {
    if (error.code === "ENOENT") {
      return changedFiles;
    }
    throw error;
  }

  for (const entry of pluginEntries.sort((left, right) =>
    left.name.localeCompare(right.name)
  )) {
    if (!entry.isDirectory()) {
      continue;
    }

    const manifestPath = path.join(
      pluginsDir,
      entry.name,
      ".codex-plugin",
      "plugin.json"
    );
    let manifestRaw;
    try {
      manifestRaw = await fs.readFile(manifestPath, "utf8");
    } catch (error) {
      if (error.code === "ENOENT") {
        continue;
      }
      throw error;
    }

    const manifest = JSON.parse(manifestRaw);
    manifest.version = version;
    await fs.writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
    changedFiles.push(path.relative(repoRoot, manifestPath));
  }

  return changedFiles;
}

async function main() {
  try {
    const changedFiles = await updatePackageVersion({
      repoRoot: process.cwd(),
      version: process.argv[2],
    });
    console.log(`Updated release version in ${changedFiles.length} files.`);
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
