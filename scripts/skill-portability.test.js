const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const path = require("node:path");

const repoRoot = path.join(__dirname, "..");
const skipDirectories = new Set([".git", ".omc", "dist", "node_modules"]);
const skipFiles = new Set([".git"]);
const textExtensions = new Set([
  "",
  ".cjs",
  ".js",
  ".json",
  ".md",
  ".mjs",
  ".py",
  ".ts",
  ".txt",
  ".yaml",
  ".yml",
]);
const blockedPatterns = [
  {
    name: "absolute local filesystem path",
    pattern:
      /(^|[\s"'`=])\/(?:Users\/|home\/[A-Za-z0-9._-]+\/|var\/folders\/|private\/(?:tmp|var)\/|opt\/homebrew\/|Volumes\/)/m,
  },
  {
    name: "home-relative filesystem path",
    pattern: /(^|[\s"'`=])~\//m,
  },
];
const privateTerms = (process.env.REPO_PRIVATE_DENYLIST || "")
  .split(",")
  .map((term) => term.trim().toLowerCase())
  .filter(Boolean);
async function collectRepoFiles(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const entryPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!skipDirectories.has(entry.name)) {
        files.push(...(await collectRepoFiles(entryPath)));
      }
    } else if (!skipFiles.has(entry.name)) {
      files.push(entryPath);
    }
  }

  return files;
}

test("repo text files do not include personal or machine-specific references", async () => {
  const files = await collectRepoFiles(repoRoot);

  assert(!files.some((filePath) => path.basename(filePath) === ".DS_Store"));

  for (const filePath of files) {
    if (!textExtensions.has(path.extname(filePath))) continue;

    const relativePath = path.relative(repoRoot, filePath);
    const content = await fs.readFile(filePath, "utf8");
    for (const { name, pattern } of blockedPatterns) {
      assert(!pattern.test(content), `${relativePath} contains ${name}`);
    }
    for (const term of privateTerms) {
      assert(!content.toLowerCase().includes(term), `${relativePath} contains private denylist term`);
    }
  }
});
