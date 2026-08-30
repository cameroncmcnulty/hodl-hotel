const fs = require("fs");
const path = require("path");
const jpeg = require("jpeg-js");
const { PNG } = require("pngjs");

function isMagenta(r, g, b) {
  const dist = Math.hypot(r - 255, g - 0, b - 255);
  if (dist < 200) return true;
  if (r > 140 && b > 100 && g < 160 && Math.abs(r - b) < 140) return true;
  if (r > 170 && b > 80 && g < 180 && r + b > g * 1.8) return true;
  return false;
}

function convertJpeg(buf) {
  const decoded = jpeg.decode(buf, { maxMemoryUsageInMB: 256, useTArray: true });
  const w = decoded.width;
  const h = decoded.height;
  const out = Buffer.from(decoded.data);
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
  const pad = 2;
  minX = Math.max(0, minX - pad);
  minY = Math.max(0, minY - pad);
  maxX = Math.min(w - 1, maxX + pad);
  maxY = Math.min(h - 1, maxY + pad);
  const tw = maxX - minX + 1;
  const th = maxY - minY + 1;
  const png = new PNG({ width: tw, height: th });
  for (let y = 0; y < th; y++) {
    for (let x = 0; x < tw; x++) {
      const si = ((minY + y) * w + (minX + x)) * 4;
      const di = (y * tw + x) * 4;
      png.data[di] = out[si];
      png.data[di + 1] = out[si + 1];
      png.data[di + 2] = out[si + 2];
      png.data[di + 3] = out[si + 3];
    }
  }
  return PNG.sync.write(png);
}

const src = process.argv[2];
const dest = process.argv[3];
if (!src || !dest) {
  console.error("usage: pack-one-furn.js in.jpg out.png");
  process.exit(1);
}
fs.writeFileSync(dest, convertJpeg(fs.readFileSync(src)));
console.log("wrote", dest, fs.statSync(dest).size);
