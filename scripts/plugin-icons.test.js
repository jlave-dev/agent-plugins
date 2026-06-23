const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const path = require("node:path");
const zlib = require("node:zlib");

const repoRoot = path.join(__dirname, "..");
const pluginsRoot = path.join(repoRoot, "plugins");
const iconPath = "./assets/icon.png";
const maxFlatPngBytes = 1_000_000;

function paeth(left, up, upLeft) {
  const estimate = left + up - upLeft;
  const leftDistance = Math.abs(estimate - left);
  const upDistance = Math.abs(estimate - up);
  const upLeftDistance = Math.abs(estimate - upLeft);

  if (leftDistance <= upDistance && leftDistance <= upLeftDistance) return left;
  if (upDistance <= upLeftDistance) return up;
  return upLeft;
}

function unfilterPngRows(inflated, width, height, bytesPerPixel) {
  const stride = width * bytesPerPixel;
  const rows = [];
  let offset = 0;

  for (let y = 0; y < height; y += 1) {
    const filter = inflated[offset];
    offset += 1;
    const source = inflated.subarray(offset, offset + stride);
    offset += stride;
    const row = Buffer.alloc(stride);
    const prior = rows[y - 1] || Buffer.alloc(stride);

    for (let x = 0; x < stride; x += 1) {
      const left = x >= bytesPerPixel ? row[x - bytesPerPixel] : 0;
      const up = prior[x] || 0;
      const upLeft = x >= bytesPerPixel ? prior[x - bytesPerPixel] : 0;

      if (filter === 0) row[x] = source[x];
      else if (filter === 1) row[x] = (source[x] + left) & 0xff;
      else if (filter === 2) row[x] = (source[x] + up) & 0xff;
      else if (filter === 3) row[x] = (source[x] + Math.floor((left + up) / 2)) & 0xff;
      else if (filter === 4) row[x] = (source[x] + paeth(left, up, upLeft)) & 0xff;
      else throw new Error(`Unsupported PNG filter ${filter}`);
    }

    rows.push(row);
  }

  return rows;
}

async function readPng(filePath) {
  const file = await fs.readFile(filePath);
  assert.equal(file.toString("hex", 0, 8), "89504e470d0a1a0a");

  let offset = 8;
  let width = 0;
  let height = 0;
  let bitDepth = 0;
  let colorType = 0;
  const idatChunks = [];

  while (offset < file.length) {
    const length = file.readUInt32BE(offset);
    const type = file.toString("ascii", offset + 4, offset + 8);
    const data = file.subarray(offset + 8, offset + 8 + length);
    offset += 12 + length;

    if (type === "IHDR") {
      width = data.readUInt32BE(0);
      height = data.readUInt32BE(4);
      bitDepth = data[8];
      colorType = data[9];
    } else if (type === "IDAT") {
      idatChunks.push(data);
    } else if (type === "IEND") {
      break;
    }
  }

  assert.equal(bitDepth, 8, "icons must be 8-bit PNGs");
  assert.equal(colorType, 2, "icons must be PNG24 truecolor assets");

  const rows = unfilterPngRows(
    zlib.inflateSync(Buffer.concat(idatChunks)),
    width,
    height,
    3
  );

  return {
    width,
    height,
    pixelAt(x, y) {
      const start = x * 3;
      return [rows[y][start], rows[y][start + 1], rows[y][start + 2]];
    },
  };
}

function isWhiteOrBlack([red, green, blue]) {
  return (
    (red <= 8 && green <= 8 && blue <= 8) ||
    (red >= 247 && green >= 247 && blue >= 247)
  );
}

function colorDistance(left, right) {
  return (
    Math.abs(left[0] - right[0]) +
    Math.abs(left[1] - right[1]) +
    Math.abs(left[2] - right[2])
  );
}

test("plugin presentation icons use flat PNG assets", async () => {
  const pluginNames = await fs.readdir(pluginsRoot);

  for (const pluginName of pluginNames) {
    const pluginDir = path.join(pluginsRoot, pluginName);
    const manifestPath = path.join(pluginDir, ".codex-plugin", "plugin.json");

    try {
      await fs.access(manifestPath);
    } catch {
      continue;
    }

    const manifest = JSON.parse(await fs.readFile(manifestPath, "utf8"));
    assert.equal(manifest.interface.composerIcon, iconPath, pluginName);
    assert.equal(manifest.interface.logo, iconPath, pluginName);

    const assetPath = path.join(pluginDir, "assets", "icon.png");
    const assetStats = await fs.stat(assetPath);
    assert(assetStats.size <= maxFlatPngBytes, `${pluginName} icon is not optimized`);

    const image = await readPng(assetPath);
    assert.deepEqual({ width: image.width, height: image.height }, { width: 1024, height: 1024 }, pluginName);

    const corners = [
      image.pixelAt(0, 0),
      image.pixelAt(image.width - 1, 0),
      image.pixelAt(0, image.height - 1),
      image.pixelAt(image.width - 1, image.height - 1),
    ];
    assert(!isWhiteOrBlack(corners[0]), `${pluginName} icon has a white/black corner`);
    for (const corner of corners) {
      assert(!isWhiteOrBlack(corner), `${pluginName} icon has a white/black corner`);
    }

    const inset = 64;
    const rimSamples = [
      [image.pixelAt(0, 0), image.pixelAt(inset, inset)],
      [image.pixelAt(image.width - 1, 0), image.pixelAt(image.width - 1 - inset, inset)],
      [image.pixelAt(0, image.height - 1), image.pixelAt(inset, image.height - 1 - inset)],
      [
        image.pixelAt(image.width - 1, image.height - 1),
        image.pixelAt(image.width - 1 - inset, image.height - 1 - inset),
      ],
    ];
    for (const [corner, insideCorner] of rimSamples) {
      assert(
        colorDistance(corner, insideCorner) <= 20,
        `${pluginName} icon appears to have a rounded-tile corner rim`
      );
    }

    await assert.rejects(
      fs.access(path.join(pluginDir, "assets", "icon.svg")),
      undefined,
      `${pluginName} should not use an SVG presentation icon`
    );
  }
});
