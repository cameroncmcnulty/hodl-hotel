/**
 * Convert furniture JPEGs (magenta key) to trimmed transparent PNGs.
 */
const fs = require("fs");
const path = require("path");
const jpeg = require("jpeg-js");
const { PNG } = require("pngjs");

const DIR = path.join(__dirname, "..", "public", "art", "furn");

function isMagenta(r, g, b) {
  const dist = Math.hypot(r - 255, g - 0, b - 255);
  if (dist < 155) return true;
  if (r > 155 && b > 150 && g < 145 && Math.abs(r - b) < 95) return true;
  if (r > 190 && b > 140 && g < 175 && r + b > g * 2.15) return true;
  return false;
}

function convertJpeg(buf) {
  const decoded = jpeg.decode(buf, { maxMemoryUsageInMB: 256, useTArray: true });
  const w = decoded.width;
  const h = decoded.height;
  const src = Buffer.from(decoded.data);
  const out = Buffer.from(src);

  const keyed = Buffer.alloc(w * h);
  const stack = [];
  const tryKey = (x, y) => {
    if (x < 0 || y < 0 || x >= w || y >= h) return;
    const i = y * w + x;
    if (keyed[i]) return;
    const o = i * 4;
    if (!isMagenta(out[o], out[o + 1], out[o + 2])) return;
    keyed[i] = 1;
    out[o + 3] = 0;
    stack.push(i);
  };
  for (let x = 0; x < w; x++) {
    tryKey(x, 0);
    tryKey(x, h - 1);
  }
  for (let y = 0; y < h; y++) {
    tryKey(0, y);
    tryKey(w - 1, y);
  }
  while (stack.length) {
    const i = stack.pop();
    const x = i % w;
    const y = (i / w) | 0;
    tryKey(x - 1, y);
    tryKey(x + 1, y);
    tryKey(x, y - 1);
    tryKey(x, y + 1);
  }
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const i = y * w + x;
      if (keyed[i]) continue;
      let n = 0;
      if (keyed[i - 1]) n++;
      if (keyed[i + 1]) n++;
      if (keyed[i - w]) n++;
      if (keyed[i + w]) n++;
      if (n >= 2) {
        const o = i * 4;
        if (isMagenta(out[o], out[o + 1], out[o + 2]) || (out[o] > 160 && out[o + 2] > 140 && out[o + 1] < 190)) {
          out[o + 3] = 0;
        }
      }
    }
  }

  let minX = w,
    minY = h,
    maxX = 0,
    maxY = 0;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (out[(y * w + x) * 4 + 3] > 12) {
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
      }
    }
  }
  if (maxX <= minX || maxY <= minY) return { width: w, height: h, data: out };
  const pad = 2;
  minX = Math.max(0, minX - pad);
  minY = Math.max(0, minY - pad);
  maxX = Math.min(w - 1, maxX + pad);
  maxY = Math.min(h - 1, maxY + pad);
  const tw = maxX - minX + 1;
  const th = maxY - minY + 1;
  const trimmed = Buffer.alloc(tw * th * 4);
  for (let y = 0; y < th; y++) {
    const srcStart = ((minY + y) * w + minX) * 4;
    out.copy(trimmed, y * tw * 4, srcStart, srcStart + tw * 4);
  }
  return { width: tw, height: th, data: trimmed };
}

function nnScale(img, maxSide) {
  const m = Math.max(img.width, img.height);
  if (m <= maxSide) return img;
  const w = Math.max(1, Math.round((img.width * maxSide) / m));
  const h = Math.max(1, Math.round((img.height * maxSide) / m));
  const data = Buffer.alloc(w * h * 4);
  for (let y = 0; y < h; y++) {
    const sy = Math.min(img.height - 1, Math.floor((y * img.height) / h));
    for (let x = 0; x < w; x++) {
      const sx = Math.min(img.width - 1, Math.floor((x * img.width) / w));
      img.data.copy(data, (y * w + x) * 4, (sy * img.width + sx) * 4, (sy * img.width + sx) * 4 + 4);
    }
  }
  return { width: w, height: h, data };
}

function writePng(file, img) {
  const png = new PNG({ width: img.width, height: img.height });
  png.data = Buffer.from(img.data);
  fs.writeFileSync(file, PNG.sync.write(png, { colorType: 6, deflateLevel: 9 }));
}

const files = fs.readdirSync(DIR).filter((f) => /\.jpe?g$/i.test(f));
for (const f of files) {
  const src = path.join(DIR, f);
  const dest = path.join(DIR, f.replace(/\.jpe?g$/i, ".png"));
  const img = nnScale(convertJpeg(fs.readFileSync(src)), 280);
  writePng(dest, img);
  console.log("keyed", f, "->", path.basename(dest), img.width + "x" + img.height);
}
console.log("done", files.length);
