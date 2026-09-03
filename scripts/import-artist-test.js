/** Import 1× artist test sprites. Strip only the faint grid overlay. */
const fs = require("fs");
const path = require("path");
const { PNG } = require("pngjs");

const chairSrc = "C:/Users/camer/Downloads/CoralChair.png";
const stoolSrc = "C:/Users/camer/Downloads/MintStool.png";
const bodySrc = path.join(
  "C:/Users/camer/.grok/sessions",
  "C%3A%5CUsers%5Ccamer",
  "01a0318d-2002-7f90-a78b-d6097a8442c5",
  "assets",
  "image-09dd4126-ddd6-47ea-a130-e7381aa411cc.png"
);

function isOverlay(r, g, b, a) {
  if (a < 8) return true;
  if (a >= 200) return false;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  return max - min <= 20;
}

function keyKeepSize(file) {
  const src = PNG.sync.read(fs.readFileSync(file));
  const out = new PNG({ width: src.width, height: src.height });
  let kept = 0;
  let white = 0;
  for (let i = 0; i < src.data.length; i += 4) {
    const r = src.data[i],
      g = src.data[i + 1],
      b = src.data[i + 2],
      a = src.data[i + 3];
    if (isOverlay(r, g, b, a)) continue;
    out.data[i] = r;
    out.data[i + 1] = g;
    out.data[i + 2] = b;
    out.data[i + 3] = 255;
    kept++;
    if (r > 240 && g > 240 && b > 240) white++;
  }
  return { png: out, kept, white, w: src.width, h: src.height };
}

function cropSolid(png, pad = 1) {
  const w = png.width;
  const h = png.height;
  const d = png.data;
  let minX = w,
    minY = h,
    maxX = 0,
    maxY = 0;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (d[(y * w + x) * 4 + 3] < 12) continue;
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
    }
  }
  minX = Math.max(0, minX - pad);
  minY = Math.max(0, minY - pad);
  maxX = Math.min(w - 1, maxX + pad);
  maxY = Math.min(h - 1, maxY + pad);
  const cw = maxX - minX + 1;
  const ch = maxY - minY + 1;
  const out = new PNG({ width: cw, height: ch });
  for (let y = 0; y < ch; y++) {
    for (let x = 0; x < cw; x++) {
      const si = ((minY + y) * w + (minX + x)) << 2;
      const di = (y * cw + x) << 2;
      out.data[di] = png.data[si];
      out.data[di + 1] = png.data[si + 1];
      out.data[di + 2] = png.data[si + 2];
      out.data[di + 3] = png.data[si + 3];
    }
  }
  return out;
}

const root = path.join(__dirname, "..");
const chair = keyKeepSize(chairSrc);
fs.writeFileSync(path.join(root, "public/art/furn/chair_coral.png"), PNG.sync.write(chair.png));
console.log("chair", chair.w + "x" + chair.h, "kept", chair.kept);

const stool = keyKeepSize(stoolSrc);
fs.writeFileSync(path.join(root, "public/art/furn/stool_mint.png"), PNG.sync.write(stool.png));
console.log("stool", stool.w + "x" + stool.h, "kept", stool.kept);

const body = keyKeepSize(bodySrc);
const cropped = cropSolid(body.png, 1);
fs.writeFileSync(path.join(root, "public/art/avatars/test-body.png"), PNG.sync.write(cropped));
let white = 0;
for (let i = 0; i < cropped.data.length; i += 4) {
  if (cropped.data[i + 3] > 8 && cropped.data[i] > 240 && cropped.data[i + 1] > 240 && cropped.data[i + 2] > 240) white++;
}
console.log("body", cropped.width + "x" + cropped.height, "white", white, "from", body.w + "x" + body.h);
