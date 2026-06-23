const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");

const { updatePackageVersion } = require("./update-package-version");

test("updates package.json and plugin manifests without touching SKILL.md", async (t) => {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "update-package-version-"));
  t.after(async () => {
    await fs.rm(tempDir, { recursive: true, force: true });
  });

  await fs.mkdir(path.join(tempDir, "plugins", "amazon", "skills", "alpha"), {
    recursive: true,
  });
  await fs.mkdir(path.join(tempDir, "plugins", "agent-ops", ".codex-plugin"), {
    recursive: true,
  });
  await fs.mkdir(path.join(tempDir, "plugins", "amazon", ".codex-plugin"), {
    recursive: true,
  });
  await fs.mkdir(path.join(tempDir, "plugins", "not-a-plugin"), { recursive: true });
  await fs.writeFile(
    path.join(tempDir, "package.json"),
    `${JSON.stringify({ name: "agent-plugins", version: "0.0.0" }, null, 2)}\n`
  );
  await fs.writeFile(
    path.join(tempDir, "plugins", "agent-ops", ".codex-plugin", "plugin.json"),
    `${JSON.stringify({ name: "agent-ops", version: "0.1.0" }, null, 2)}\n`
  );
  await fs.writeFile(
    path.join(tempDir, "plugins", "amazon", ".codex-plugin", "plugin.json"),
    `${JSON.stringify({ name: "amazon", version: "0.2.0" }, null, 2)}\n`
  );
  await fs.writeFile(
    path.join(tempDir, "plugins", "amazon", "skills", "alpha", "SKILL.md"),
    "---\nname: alpha\ndescription: Use when testing.\n---\n"
  );

  const changedFiles = await updatePackageVersion({
    repoRoot: tempDir,
    version: "2.5.0",
  });

  assert.deepEqual(changedFiles, [
    "package.json",
    "plugins/agent-ops/.codex-plugin/plugin.json",
    "plugins/amazon/.codex-plugin/plugin.json",
  ]);

  const packageJson = JSON.parse(
    await fs.readFile(path.join(tempDir, "package.json"), "utf8")
  );
  assert.equal(packageJson.version, "2.5.0");
  const agentOps = JSON.parse(
    await fs.readFile(
      path.join(tempDir, "plugins", "agent-ops", ".codex-plugin", "plugin.json"),
      "utf8"
    )
  );
  const amazon = JSON.parse(
    await fs.readFile(
      path.join(tempDir, "plugins", "amazon", ".codex-plugin", "plugin.json"),
      "utf8"
    )
  );
  assert.equal(agentOps.version, "2.5.0");
  assert.equal(amazon.version, "2.5.0");

  const skill = await fs.readFile(
    path.join(tempDir, "plugins", "amazon", "skills", "alpha", "SKILL.md"),
    "utf8"
  );
  assert.doesNotMatch(skill, /^version:/m);
});

test("throws on an invalid version input", async () => {
  await assert.rejects(
    async () => {
      await updatePackageVersion({ repoRoot: process.cwd(), version: "" });
    },
    /Version is required/
  );
});
