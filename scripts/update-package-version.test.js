const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");

const { updatePackageVersion } = require("./update-package-version");

test("updates package.json without touching SKILL.md", async (t) => {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "update-package-version-"));
  t.after(async () => {
    await fs.rm(tempDir, { recursive: true, force: true });
  });

  await fs.mkdir(path.join(tempDir, "skills", "alpha"), { recursive: true });
  await fs.writeFile(
    path.join(tempDir, "package.json"),
    `${JSON.stringify({ name: "agent-skills", version: "0.0.0" }, null, 2)}\n`
  );
  await fs.writeFile(
    path.join(tempDir, "skills", "alpha", "SKILL.md"),
    "---\nname: alpha\ndescription: Use when testing.\n---\n"
  );

  const changedFiles = await updatePackageVersion({
    repoRoot: tempDir,
    version: "2.5.0",
  });

  assert.deepEqual(changedFiles, ["package.json"]);

  const packageJson = JSON.parse(
    await fs.readFile(path.join(tempDir, "package.json"), "utf8")
  );
  assert.equal(packageJson.version, "2.5.0");

  const skill = await fs.readFile(
    path.join(tempDir, "skills", "alpha", "SKILL.md"),
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
