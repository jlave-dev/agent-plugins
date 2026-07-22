const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const repoRoot = path.join(__dirname, "..");

test("release workflow installs the configured changelog preset", () => {
  const config = JSON.parse(fs.readFileSync(path.join(repoRoot, ".releaserc.json"), "utf8"));
  const workflow = fs.readFileSync(path.join(repoRoot, ".github", "workflows", "release.yml"), "utf8");
  const generator = config.plugins.find(([name]) => name === "@semantic-release/release-notes-generator");

  assert.equal(generator[1].preset, "conventionalcommits");
  assert.match(workflow, /conventional-changelog-conventionalcommits@9\.3\.1/);
});
