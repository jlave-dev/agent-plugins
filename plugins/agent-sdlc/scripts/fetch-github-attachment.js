#!/usr/bin/env node

const { execFileSync } = require("node:child_process");
const fs = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");

const GITHUB_ATTACHMENT_PATH = /^\/user-attachments\/(?:assets|files)\/[^/]+(?:\/.*)?$/;

class AttachmentRetrievalError extends Error {
  constructor(code, message, details = {}) {
    super(message);
    this.name = "AttachmentRetrievalError";
    this.code = code;
    Object.assign(this, details);
  }
}

function validateAttachmentUrl(value) {
  let parsed;
  try {
    parsed = new URL(value);
  } catch {
    throw new AttachmentRetrievalError("invalid_url", "GitHub attachment URL is invalid.");
  }

  if (parsed.protocol !== "https:" || parsed.hostname !== "github.com" || !GITHUB_ATTACHMENT_PATH.test(parsed.pathname)) {
    throw new AttachmentRetrievalError("invalid_url", "URL is not a GitHub user-attachment URL.");
  }

  return parsed.toString();
}

function readGitHubToken() {
  try {
    const token = execFileSync("gh", ["auth", "token", "--hostname", "github.com"], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
    if (!token) throw new Error("empty token");
    return token;
  } catch {
    throw new AttachmentRetrievalError(
      "authentication_failed",
      "GitHub authentication is unavailable for this attachment."
    );
  }
}

function responseHeader(response, name) {
  return response?.headers?.get?.(name) || response?.headers?.[name] || "";
}

function responseStatus(response) {
  return Number(response?.status) || 0;
}

function isSuccess(status) {
  return status >= 200 && status < 300;
}

async function requestAttachment(request, url, headers, stage) {
  try {
    return await request(url, { headers, redirect: "follow" });
  } catch {
    throw new AttachmentRetrievalError(
      stage === "authenticated" ? "authenticated_request_failed" : "request_failed",
      `${stage === "authenticated" ? "Authenticated" : "Public"} GitHub attachment request failed.`
    );
  }
}

async function downloadGitHubAttachment(value, options = {}) {
  const url = validateAttachmentUrl(value);
  const request = options.request || globalThis.fetch;
  if (typeof request !== "function") {
    throw new AttachmentRetrievalError("request_unavailable", "No HTTP fetch implementation is available.");
  }

  const publicResponse = await requestAttachment(request, url, { Accept: "image/*" }, "public");
  const publicStatus = responseStatus(publicResponse);
  let response = publicResponse;
  let authenticated = false;

  if (publicStatus === 404) {
    let token;
    try {
      token = await (options.getToken || readGitHubToken)();
    } catch {
      throw new AttachmentRetrievalError(
        "authentication_failed",
        "GitHub authentication is unavailable for this attachment.",
        { publicStatus }
      );
    }

    const authToken = String(token || "").trim();
    if (!authToken || /[\r\n]/.test(authToken)) {
      throw new AttachmentRetrievalError(
        "authentication_failed",
        "GitHub authentication is unavailable for this attachment.",
        { publicStatus }
      );
    }

    response = await requestAttachment(
      request,
      url,
      { Accept: "image/*", Authorization: `Bearer ${authToken}` },
      "authenticated"
    );
    authenticated = true;
  }

  const status = responseStatus(response);
  if (authenticated && status === 404) {
    throw new AttachmentRetrievalError(
      "missing_evidence",
      "GitHub attachment was not found after authenticated retrieval.",
      { publicStatus, authenticatedStatus: status }
    );
  }
  if (!isSuccess(status)) {
    throw new AttachmentRetrievalError(
      authenticated ? "authentication_failed" : "http_error",
      `${authenticated ? "Authenticated" : "Public"} GitHub attachment request returned HTTP ${status}.`,
      authenticated ? { publicStatus, authenticatedStatus: status } : { status }
    );
  }

  const contentType = responseHeader(response, "content-type").split(";", 1)[0].trim().toLowerCase();
  if (!contentType.startsWith("image/")) {
    throw new AttachmentRetrievalError(
      "non_image_response",
      "GitHub attachment response is not an image.",
      authenticated ? { publicStatus, authenticatedStatus: status, contentType } : { status, contentType }
    );
  }

  let body;
  try {
    body = Buffer.from(await response.arrayBuffer());
  } catch {
    throw new AttachmentRetrievalError("download_failed", "GitHub attachment body could not be downloaded.");
  }

  try {
    const directory = await fs.mkdtemp(path.join(options.tempDir || os.tmpdir(), "agent-sdlc-attachment-"));
    const filePath = path.join(directory, "evidence");
    await fs.writeFile(filePath, body);
    return {
      url,
      path: filePath,
      contentType,
      size: body.byteLength,
      authenticated,
      status,
    };
  } catch {
    throw new AttachmentRetrievalError("download_failed", "GitHub attachment could not be written to a temporary file.");
  }
}

async function main() {
  const url = process.argv[2];
  if (!url) {
    process.stderr.write("Usage: fetch-github-attachment.js <github-user-attachment-url>\n");
    process.exitCode = 1;
    return;
  }

  try {
    const result = await downloadGitHubAttachment(url);
    process.stdout.write(`${JSON.stringify(result)}\n`);
  } catch (error) {
    const code = error?.code || "attachment_failed";
    process.stderr.write(`${code}: ${error?.message || "GitHub attachment retrieval failed."}\n`);
    process.exitCode = 1;
  }
}

if (require.main === module) main();

module.exports = {
  AttachmentRetrievalError,
  downloadGitHubAttachment,
  readGitHubToken,
  validateAttachmentUrl,
};
