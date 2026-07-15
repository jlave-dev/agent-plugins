const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");

const { downloadGitHubAttachment } = require("../plugins/agent-sdlc/scripts/fetch-github-attachment.js");

const attachmentUrl = "https://github.com/user-attachments/assets/11111111-1111-1111-1111-111111111111";

function response(status, contentType, body = "image bytes") {
  return {
    status,
    headers: { get: (name) => (name.toLowerCase() === "content-type" ? contentType : "") },
    arrayBuffer: async () => Buffer.from(body),
  };
}

async function tempDir(t) {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), "agent-sdlc-attachment-test-"));
  t.after(() => fs.rm(directory, { recursive: true, force: true }));
  return directory;
}

async function captureError(promise) {
  let error;
  try {
    await promise;
  } catch (caught) {
    error = caught;
  }
  assert(error, "expected the operation to reject");
  return error;
}

test("downloads a public image without an authorization header", async (t) => {
  const directory = await tempDir(t);
  const calls = [];
  const result = await downloadGitHubAttachment(attachmentUrl, {
    tempDir: directory,
    request: async (url, options) => {
      calls.push({ url, options });
      return response(200, "image/png", "public image");
    },
  });

  assert.equal(result.authenticated, false);
  assert.equal(result.contentType, "image/png");
  assert.equal(await fs.readFile(result.path, "utf8"), "public image");
  assert.equal(calls.length, 1);
  assert.equal(calls[0].options.headers.Authorization, undefined);
});

test("retries a private 404 with the in-memory gh bearer token", async (t) => {
  const directory = await tempDir(t);
  const secret = "ghs_private_test_token";
  const calls = [];
  const result = await downloadGitHubAttachment(attachmentUrl, {
    tempDir: directory,
    getToken: () => secret,
    request: async (url, options) => {
      calls.push({ url, options });
      return calls.length === 1 ? response(404, "text/plain") : response(200, "image/jpeg", "private image");
    },
  });

  assert.equal(result.authenticated, true);
  assert.equal(await fs.readFile(result.path, "utf8"), "private image");
  assert.equal(calls[0].options.headers.Authorization, undefined);
  assert.equal(calls[1].options.headers.Authorization, `Bearer ${secret}`);
  assert.doesNotMatch(JSON.stringify(result), new RegExp(secret));
});

test("reports authenticated request failure separately from missing evidence", async (t) => {
  const directory = await tempDir(t);
  const error = await captureError(
    downloadGitHubAttachment(attachmentUrl, {
      tempDir: directory,
      getToken: () => "valid-token",
      request: async (_url, options) =>
        options.headers.Authorization ? response(403, "text/plain") : response(404, "text/plain"),
    })
  );

  assert.equal(error.code, "authentication_failed");
  assert.equal(error.publicStatus, 404);
  assert.equal(error.authenticatedStatus, 403);
});

test("reports a second authenticated 404 as genuinely missing evidence", async (t) => {
  const directory = await tempDir(t);
  const error = await captureError(
    downloadGitHubAttachment(attachmentUrl, {
      tempDir: directory,
      getToken: () => "valid-token",
      request: async () => response(404, "text/plain"),
    })
  );

  assert.equal(error.code, "missing_evidence");
  assert.equal(error.publicStatus, 404);
  assert.equal(error.authenticatedStatus, 404);
});

test("rejects a successful non-image response", async (t) => {
  const directory = await tempDir(t);
  const error = await captureError(
    downloadGitHubAttachment(attachmentUrl, {
      tempDir: directory,
      request: async () => response(200, "text/html", "not an image"),
    })
  );

  assert.equal(error.code, "non_image_response");
  assert.equal(error.contentType, "text/html");
});

test("does not disclose a failed credential or request secret", async (t) => {
  const directory = await tempDir(t);
  const secret = "do-not-disclose-this-token";
  const error = await captureError(
    downloadGitHubAttachment(attachmentUrl, {
      tempDir: directory,
      getToken: () => {
        throw new Error(secret);
      },
      request: async () => response(404, "text/plain"),
    })
  );

  assert.equal(error.code, "authentication_failed");
  assert.equal(error.publicStatus, 404);
  assert.doesNotMatch(error.message, new RegExp(secret));
  assert.doesNotMatch(JSON.stringify(error), new RegExp(secret));
});
