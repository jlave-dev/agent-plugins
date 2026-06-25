const test = require("node:test");
const assert = require("node:assert/strict");
const { execFile } = require("node:child_process");
const fs = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");
const { promisify } = require("node:util");

const execFileAsync = promisify(execFile);
const repoRoot = path.join(__dirname, "..");
const guardrailsScript = path.join(repoRoot, "plugins", "agent-sdlc", "scripts", "guardrails.ts");
const {
  assertSafeGitHubBody,
  replaceMarkdownSection,
  validateBaseRef,
} = require(guardrailsScript);

async function run(command, args, cwd) {
  const { stdout } = await execFileAsync(command, args, { cwd });
  return stdout;
}

async function writeText(filePath, value) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, value);
}

async function createFixture(t) {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "agent-sdlc-guardrails-"));
  t.after(async () => {
    await fs.rm(tempDir, { recursive: true, force: true });
  });

  await run("git", ["init", "-b", "main"], tempDir);
  await run("git", ["config", "user.email", "smoke@example.com"], tempDir);
  await run("git", ["config", "user.name", "Smoke Test"], tempDir);
  await writeText(
    path.join(tempDir, "package.json"),
    `${JSON.stringify({ name: "guardrails-fixture", scripts: { test: "node --test" } }, null, 2)}\n`
  );
  await writeText(path.join(tempDir, "README.md"), "# Guardrails Fixture\n");
  await run("git", ["add", "."], tempDir);
  await run("git", ["commit", "-m", "initial"], tempDir);

  return tempDir;
}

test("base validator rejects scoped files that only exist in the worktree", async (t) => {
  const fixture = await createFixture(t);
  await writeText(path.join(fixture, "scripts", "new-check.js"), "console.log('new');\n");

  const result = validateBaseRef(fixture, {
    baseRef: "main",
    files: ["scripts/new-check.js"],
  });

  assert.equal(result.ok, false);
  assert.deepEqual(result.missingFiles, ["scripts/new-check.js"]);
});

test("base validator rejects package scripts absent from the declared base", async (t) => {
  const fixture = await createFixture(t);
  await writeText(
    path.join(fixture, "package.json"),
    `${JSON.stringify(
      { name: "guardrails-fixture", scripts: { test: "node --test", verify: "node verify.js" } },
      null,
      2
    )}\n`
  );

  const result = validateBaseRef(fixture, {
    baseRef: "main",
    commands: ["npm run verify"],
  });

  assert.equal(result.ok, false);
  assert.deepEqual(result.missingScripts, [{ command: "npm run verify", script: "verify" }]);
});

test("base validator accepts files and scripts present at the declared base", async (t) => {
  const fixture = await createFixture(t);

  const result = validateBaseRef(fixture, {
    baseRef: "main",
    files: ["README.md"],
    commands: ["npm test"],
  });

  assert.equal(result.ok, true);
  assert.deepEqual(result.missingFiles, []);
  assert.deepEqual(result.missingScripts, []);
});

test("base validator accepts issue-template base refs with a recorded sha", async (t) => {
  const fixture = await createFixture(t);
  const sha = (await run("git", ["rev-parse", "main"], fixture)).trim();

  const result = validateBaseRef(fixture, {
    baseRef: `main @ ${sha}`,
    files: ["README.md"],
    commands: ["npm test"],
  });

  assert.equal(result.ok, true);
  assert.equal(result.base.ref, "main");
});

test("body helper rejects local paths and denied terms", () => {
  const localPath = ["", "Users", "example", "project", "screenshot.png"].join("/");

  assert.throws(
    () => assertSafeGitHubBody(`Evidence: ${localPath}`),
    /local absolute filesystem path/
  );
  assert.throws(
    () => assertSafeGitHubBody("Token: SECRET_VALUE", { denylist: ["secret_value"] }),
    /denied secret/
  );
});

test("body helper replaces one markdown section and keeps body safe", () => {
  const body = ["# Title", "", "## Agent State", "Status: active", "", "## Notes", "Keep."].join("\n");

  const next = replaceMarkdownSection(body, "Agent State", "Status: evidence_ready\nChecks: npm test");

  assert.match(next, /## Agent State\nStatus: evidence_ready\nChecks: npm test\n/);
  assert.match(next, /## Notes\nKeep\./);
});

test("guardrails CLI reports missing base files", async (t) => {
  const fixture = await createFixture(t);
  await writeText(path.join(fixture, "new-file.txt"), "new\n");

  await assert.rejects(
    execFileAsync("node", [guardrailsScript, "validate-base", "--repo", fixture, "--base", "main", "--file", "new-file.txt"], {
      cwd: repoRoot,
    }),
    (error) => {
      assert.match(error.stdout, /"missingFiles": \[\n    "new-file.txt"\n  \]/);
      return true;
    }
  );
});
