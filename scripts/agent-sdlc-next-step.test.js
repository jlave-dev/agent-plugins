const test = require("node:test");
const assert = require("node:assert/strict");

const { parseAgentState, resolveNextStep } = require("../plugins/agent-sdlc/scripts/next-step.ts");

function issueWithStatus(status, extra = "") {
  return {
    body: [
      "## Goal",
      "Ship the thing.",
      "",
      "## Agent State",
      `Status: ${status}`,
      extra,
    ]
      .filter(Boolean)
      .join("\n"),
    labels: ["agent:active"],
  };
}

test("parses Agent State fields from issue body", () => {
  const state = parseAgentState([
    "## Agent State",
    "Status: evidence_ready",
    "PR: https://github.com/example/repo/pull/1",
    "Head: abc123",
  ].join("\n"));

  assert.equal(state.status, "evidence_ready");
  assert.equal(state.pr, "https://github.com/example/repo/pull/1");
  assert.equal(state.head, "abc123");
});

test("ready issues run preflight first", () => {
  assert.deepEqual(resolveNextStep({ issue: issueWithStatus("ready") }), {
    role: "sdlc-preflight",
    reason: "Issue is ready and needs branch/worktree/dependency preflight.",
    stop: false,
  });
});

test("preflight-passed issues dispatch workers", () => {
  assert.equal(
    resolveNextStep({ issue: issueWithStatus("preflight_passed") }).role,
    "sdlc-dispatch-issue"
  );
});

test("PR with missing evidence refreshes evidence", () => {
  assert.equal(
    resolveNextStep({
      issue: issueWithStatus("implementation_ready", "PR: https://github.com/example/repo/pull/2"),
      pr: { headRefOid: "abc123" },
    }).role,
    "sdlc-evidence"
  );
});

test("evidence-ready docs changes run docs before review", () => {
  assert.equal(
    resolveNextStep({
      issue: issueWithStatus(
        "evidence_ready",
        [
          "PR: https://github.com/example/repo/pull/2",
          "Head: abc123",
          "Checks: passed",
          "Evidence: local checks passed",
        ].join("\n")
      ),
      pr: { headRefOid: "abc123" },
      changedFiles: ["AGENTS.md"],
    }).role,
    "sdlc-docs"
  );
});

test("evidence-ready code changes run review loop", () => {
  assert.equal(
    resolveNextStep({
      issue: issueWithStatus(
        "evidence_ready",
        [
          "PR: https://github.com/example/repo/pull/3",
          "Head: abc123",
          "Checks: passed",
          "Evidence: local checks passed",
        ].join("\n")
      ),
      pr: { headRefOid: "abc123" },
      changedFiles: ["src/app.ts"],
    }).role,
    "sdlc-review-loop"
  );
});

test("review-approved issues refresh evidence before merge readiness", () => {
  assert.equal(
    resolveNextStep({
      issue: issueWithStatus(
        "review_approved",
        [
          "PR: https://github.com/example/repo/pull/4",
          "Head: abc123",
          "Checks: passed",
          "Evidence: local checks passed",
        ].join("\n")
      ),
      pr: { headRefOid: "abc123" },
    }).role,
    "sdlc-evidence"
  );
});

test("merge-ready issues enter merge queue", () => {
  assert.equal(
    resolveNextStep({
      issue: issueWithStatus(
        "merge_ready",
        [
          "PR: https://github.com/example/repo/pull/5",
          "Head: abc123",
          "Checks: passed",
          "Evidence: hosted checks passed",
        ].join("\n")
      ),
      pr: { headRefOid: "abc123" },
    }).role,
    "sdlc-merge-queue"
  );
});

test("blocked issues stop", () => {
  const result = resolveNextStep({ issue: issueWithStatus("blocked") });
  assert.equal(result.stop, true);
  assert.equal(result.role, "");
});
