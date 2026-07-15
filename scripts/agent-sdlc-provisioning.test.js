const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const repoRoot = path.join(__dirname, "..");

test("worker provisioning attaches and verifies the declared branch before edits", () => {
  const dispatch = fs.readFileSync(
    path.join(repoRoot, "plugins", "agent-sdlc", "skills", "sdlc-dispatch-issue", "SKILL.md"),
    "utf8"
  );
  const preflight = fs.readFileSync(
    path.join(repoRoot, "plugins", "agent-sdlc", "skills", "sdlc-preflight", "SKILL.md"),
    "utf8"
  );

  assert.match(dispatch, /git switch -c <declared-branch> <base-sha>/);
  assert.match(dispatch, /git push -u origin <declared-branch>/);
  assert.match(dispatch, /git switch <declared-branch>/);
  assert.match(dispatch, /git branch --show-current/);
  assert.match(dispatch, /git rev-parse HEAD/);
  assert.match(dispatch, /must not receive implementation instructions[\s\S]*edit files until/);
  assert.match(preflight, /pushed `origin\/<branch>` ref/);
});
