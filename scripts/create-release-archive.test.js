const test = require("node:test");
const assert = require("node:assert/strict");
const { execFile } = require("node:child_process");
const fs = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");
const { promisify } = require("node:util");

const { createReleaseArchive } = require("./create-release-archive");

const execFileAsync = promisify(execFile);

async function writeJson(filePath, value) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

async function writeText(filePath, value) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, value);
}

async function createFixture(t, version = "2.5.0") {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "release-archive-"));
  t.after(async () => {
    await fs.rm(tempDir, { recursive: true, force: true });
  });

  await writeJson(path.join(tempDir, "package.json"), {
    name: "agent-skills",
    version,
  });
  await writeJson(path.join(tempDir, ".agents", "plugins", "marketplace.json"), {
    plugins: [{ name: "amazon" }],
  });
  await writeJson(
    path.join(tempDir, "plugins", "amazon", ".codex-plugin", "plugin.json"),
    { name: "amazon", version: "0.1.0" }
  );
  await writeText(
    path.join(tempDir, "plugins", "amazon", "skills", "shop-amazon", "SKILL.md"),
    "---\nname: shop-amazon\n---\n"
  );
  await writeText(path.join(tempDir, "README.md"), "# Agent Skills\n");
  await writeText(path.join(tempDir, "TERMS.md"), "# Terms\n");
  await writeText(path.join(tempDir, "PRIVACY.md"), "# Privacy\n");

  await writeText(path.join(tempDir, "CHANGELOG.md"), "# Changelog\n");
  await writeText(path.join(tempDir, ".DS_Store"), "ignored");
  await writeText(path.join(tempDir, "plugins", ".DS_Store"), "ignored");
  await writeText(path.join(tempDir, ".git", "config"), "ignored");
  await writeText(path.join(tempDir, ".github", "workflows", "release.yml"), "ignored");
  await writeText(path.join(tempDir, "node_modules", "package", "index.js"), "ignored");
  await writeText(path.join(tempDir, "scripts", "helper.js"), "ignored");

  return tempDir;
}

async function listArchiveEntries(archivePath) {
  const { stdout } = await execFileAsync("tar", ["-tzf", archivePath]);
  return stdout
    .split("\n")
    .filter(Boolean)
    .map((entry) => entry.replace(/^\.\//, "").replace(/\/$/, ""));
}

test("creates a release archive with marketplace and plugin files", async (t) => {
  const repoRoot = await createFixture(t);

  const result = await createReleaseArchive({
    repoRoot,
    version: "2.5.0",
  });

  assert.equal(result.archiveName, "agent-skills-v2.5.0.tar.gz");
  assert.equal(
    result.archivePath,
    path.join(repoRoot, "dist", "agent-skills-v2.5.0.tar.gz")
  );

  const entries = await listArchiveEntries(result.archivePath);
  assert(entries.includes(".agents/plugins/marketplace.json"));
  assert(entries.includes("plugins/amazon/.codex-plugin/plugin.json"));
  assert(entries.includes("plugins/amazon/skills/shop-amazon/SKILL.md"));
  assert(entries.includes("README.md"));
  assert(entries.includes("TERMS.md"));
  assert(entries.includes("PRIVACY.md"));
  assert(entries.includes("package.json"));

  assert(!entries.some((entry) => entry.startsWith(".git")));
  assert(!entries.some((entry) => entry.startsWith(".github")));
  assert(!entries.some((entry) => entry.startsWith("node_modules")));
  assert(!entries.some((entry) => entry.startsWith("scripts")));
  assert(!entries.some((entry) => entry.endsWith(".DS_Store")));
  assert(!entries.includes("CHANGELOG.md"));

  const extractDir = await fs.mkdtemp(path.join(os.tmpdir(), "release-archive-extract-"));
  t.after(async () => {
    await fs.rm(extractDir, { recursive: true, force: true });
  });

  await execFileAsync("tar", ["-xzf", result.archivePath, "-C", extractDir, "package.json"]);
  const packageJson = JSON.parse(
    await fs.readFile(path.join(extractDir, "package.json"), "utf8")
  );
  assert.equal(packageJson.version, "2.5.0");
});

test("throws when package.json version does not match release version", async (t) => {
  const repoRoot = await createFixture(t, "2.5.0");

  await assert.rejects(
    async () => {
      await createReleaseArchive({
        repoRoot,
        version: "3.0.0",
      });
    },
    /package\.json version 2\.5\.0 does not match release version 3\.0\.0/
  );
});
