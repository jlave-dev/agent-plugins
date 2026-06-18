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
const { buildHandoff, issueContextFromPayload, readConfig } = require(buildHandoffScript);

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

test("handoff includes supplied GitHub issue context", async (t) => {
  const fixture = await createCommittedFeatureBranch(t);

  const output = buildHandoff(fixture, {
    issueContext: {
      number: 42,
      title: "feat: add onboarding empty state",
      state: "OPEN",
      url: "https://github.com/example/repo/issues/42",
      labels: [{ name: "agent:active" }, { name: "area:frontend" }],
      body: [
        "## Goal",
        "Make onboarding less blank.",
        "",
        "## Acceptance Criteria",
        "- Empty state appears when no invitations exist.",
        "- Empty state links to invite creation.",
        "",
        "## Dependencies",
        "Depends on: none",
        "Mode: independent",
        "",
        "## CI Tier",
        "Tier: full-ci-before-merge",
        "Reason: stack layer can be reviewed with fast checks.",
        "Full integration evidence: top-of-stack PR",
        "Stack position: stack layer",
        "",
        "## Verification",
        "- npm run check",
      ].join("\n"),
    },
  });

  assert.match(output, /## Issue Context/);
  assert.match(output, /Issue: #42/);
  assert.match(output, /Title: feat: add onboarding empty state/);
  assert.match(output, /Labels: agent:active, area:frontend/);
  assert.match(output, /Tier: full-ci-before-merge/);
  assert.match(output, /Evidence source: top-of-stack PR/);
  assert.match(output, /Stack position: stack layer/);
  assert.match(output, /Empty state appears when no invitations exist\./);
  assert.match(output, /Depends on: none/);
  assert.match(output, /npm run check/);
});

test("issue context extraction finds task sections", () => {
  const context = issueContextFromPayload({
    number: 7,
    title: "fix: repair dashboard",
    state: "OPEN",
    labels: ["agent:ready"],
    body: [
      "## Goal",
      "Repair dashboard.",
      "",
      "## Acceptance Criteria",
      "- Cards render.",
      "",
      "## CI Tier",
      "Tier: fast-check-only",
      "Fast checks: npm test",
      "",
      "## Verification",
      "- npm test",
    ].join("\n"),
  });

  assert.equal(context.ref, "#7");
  assert.equal(context.labels, "agent:ready");
  assert.equal(context.acceptanceCriteria, "- Cards render.");
  assert.equal(context.ciTier, "fast-check-only");
  assert.equal(context.verification, "- npm test");
  assert.equal(context.dependencies, "No dependencies section found.");
});

test("config parser includes issue workflow defaults", async (t) => {
  const fixture = await createCommittedFeatureBranch(t);
  const config = readConfig(fixture);

  assert.equal(config.github.issues, true);
  assert.equal(config.github.labels.ready, "agent:ready");
  assert.equal(config.github.labels.fullCi, "full-ci");
  assert.deepEqual(config.ci.fastChecks, []);
  assert.equal(config.ci.integration.labels.fullCi, "full-ci");
  assert.equal(config.workflow.maxActiveIssues, 5);
  assert.equal(config.merge.mode, "auto");
  assert(config.merge.requireHumanFor.includes("security"));
});

test("config parser includes configured CI policy", async (t) => {
  const fixture = await createCommittedFeatureBranch(t);
  await writeText(
    path.join(fixture, ".agent-sdlc.yml"),
    [
      "projectName: fixture",
      "defaultBase: main",
      "",
      "commands:",
      "  verify:",
      "    - npm test",
      "",
      "ci:",
      "  fastChecks:",
      "    - npm run check",
      "  integration:",
      "    labels:",
      "      fullCi: full-ci",
      "      readyToMerge: ready-to-merge",
      "    mergeQueue: true",
      "    mergeGroup: true",
      "  humanReviewRisks:",
      "    - auth",
      "    - data",
      "  riskyPaths:",
      "    native:",
      "      - ios/**",
      "      - android/**",
      "    data:",
      "      - db/migrations/**",
      "",
    ].join("\n")
  );

  const config = readConfig(fixture);

  assert.deepEqual(config.commands.verify, ["npm test"]);
  assert.deepEqual(config.ci.fastChecks, ["npm run check"]);
  assert.equal(config.ci.integration.mergeQueue, true);
  assert.equal(config.ci.integration.mergeGroup, true);
  assert.deepEqual(config.ci.humanReviewRisks, ["auth", "data"]);
  assert.deepEqual(config.ci.riskyPaths.native, ["ios/**", "android/**"]);
});

test("CI human-review risks inherit existing merge risk config", async (t) => {
  const fixture = await createCommittedFeatureBranch(t);
  await writeText(
    path.join(fixture, ".agent-sdlc.yml"),
    [
      "projectName: fixture",
      "defaultBase: main",
      "",
      "merge:",
      "  requireHumanFor:",
      "    - privacy",
      "    - billing",
      "",
    ].join("\n")
  );

  const config = readConfig(fixture);

  assert.deepEqual(config.merge.requireHumanFor, ["privacy", "billing"]);
  assert.deepEqual(config.ci.humanReviewRisks, ["privacy", "billing"]);
});

test("handoff includes CI tier and configured CI policy", async (t) => {
  const fixture = await createCommittedFeatureBranch(t);
  await writeText(
    path.join(fixture, ".agent-sdlc.yml"),
    [
      "projectName: fixture",
      "defaultBase: main",
      "",
      "ci:",
      "  fastChecks:",
      "    - npm run check",
      "  integration:",
      "    labels:",
      "      fullCi: full-ci",
      "      readyToMerge: ready-to-merge",
      "    mergeQueue: true",
      "    mergeGroup: true",
      "  humanReviewRisks:",
      "    - security",
      "  riskyPaths:",
      "    native:",
      "      - ios/**",
      "",
    ].join("\n")
  );

  const output = buildHandoff(fixture, {
    issueContext: {
      number: 9,
      title: "feat: add native bridge",
      state: "OPEN",
      labels: [{ name: "agent:active" }, { name: "full-ci" }],
      body: [
        "## Goal",
        "Add a native bridge.",
        "",
        "## CI Tier",
        "Tier: full-ci-required",
        "Reason: native bridge touches configured risky paths.",
        "Full integration evidence: current head SHA",
        "Stack position: top-of-stack",
      ].join("\n"),
    },
  });

  assert.match(output, /## Configured CI Policy/);
  assert.match(output, /Tier: full-ci-required/);
  assert.match(output, /Evidence source: current head SHA/);
  assert.match(output, /Stack position: top-of-stack/);
  assert.match(output, /Fast checks:\n  - npm run check/);
  assert.match(output, /Integration labels: fullCi=full-ci, readyToMerge=ready-to-merge/);
  assert.match(output, /Merge queue evidence accepted: yes/);
  assert.match(output, /Merge group evidence accepted: yes/);
  assert.match(output, /Human-review risks:\n  - security/);
  assert.match(output, /native: ios\/\*\*/);
});
