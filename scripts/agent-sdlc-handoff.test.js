const test = require("node:test");
const assert = require("node:assert/strict");
const { execFile } = require("node:child_process");
const fs = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");
const { promisify } = require("node:util");

const execFileAsync = promisify(execFile);

const repoRoot = path.join(__dirname, "..");
const buildHandoffScript = path.join(
  repoRoot,
  "plugins",
  "agent-sdlc",
  "scripts",
  "build-handoff.ts"
);

async function run(command, args, cwd) {
  const { stdout } = await execFileAsync(command, args, { cwd });
  return stdout;
}

async function writeText(filePath, value) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, value);
}

async function createCommittedFeatureBranch(t) {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "agent-sdlc-handoff-"));
  t.after(async () => {
    await fs.rm(tempDir, { recursive: true, force: true });
  });

  await run("git", ["init", "-b", "main"], tempDir);
  await run("git", ["config", "user.email", "smoke@example.com"], tempDir);
  await run("git", ["config", "user.name", "Smoke Test"], tempDir);

  await writeText(
    path.join(tempDir, "package.json"),
    `${JSON.stringify({ name: "handoff-fixture" }, null, 2)}\n`
  );
  await writeText(path.join(tempDir, "README.md"), "# Handoff Fixture\n");
  await run("git", ["add", "."], tempDir);
  await run("git", ["commit", "-m", "initial"], tempDir);

  await run("git", ["switch", "-c", "feat/docs-visible"], tempDir);
  await writeText(path.join(tempDir, "README.md"), "# Handoff Fixture\n\nUpdated docs.\n");
  await run("git", ["add", "README.md"], tempDir);
  await run("git", ["commit", "-m", "docs: update fixture"], tempDir);

  return tempDir;
}

test("handoff includes committed feature-branch diff from base", async (t) => {
  const fixture = await createCommittedFeatureBranch(t);

  const output = await run("node", [buildHandoffScript, fixture], repoRoot);

  assert.match(output, /Base ref: main/);
  assert.match(output, /Comparison: [a-f0-9]{40}\.\.HEAD/);
  assert.match(output, /## Changed Files From Base/);
  assert.match(output, /M\s+README\.md/);
  assert.match(output, /README\.md\s+\|/);
  assert.doesNotMatch(output, /No committed changes from base\./);
  assert.match(output, /No staged changes\./);
  assert.match(output, /No unstaged tracked changes\./);
});
