/** Downscale the artist stool screenshot and drop the gray floor guide. */
const fs = require("fs");
const path = require("path");
const { PNG } = require("pngjs");

const src = PNG.sync.read(fs.readFileSync("C:/Users/camer/Downloads/image.png"));
const SCALE = 6;
const OX = 2;
const OY = 0;
const nw = Math.floor((src.width - OX) / SCALE);
const nh = Math.floor((src.height - OY) / SCALE);

function isGuide(r, g, b) {
  if (r === 0 && g === 0 && b === 255) return true;
  if (r === g && g === b && (r === 128 || r === 192 || r === 103 || r === 155)) return true;
  return false;
}

const raw = new PNG({ width: nw, height: nh });
for (let y = 0; y < nh; y++) {
  for (let x = 0; x < nw; x++) {
    const si = ((OY + y * SCALE) * src.width + (OX + x * SCALE)) << 2;
    const r = src.data[si];
    const g = src.data[si + 1];
    const b = src.data[si + 2];
    const di = (y * nw + x) << 2;
    if (isGuide(r, g, b)) {
      raw.data[di + 3] = 0;
      continue;
    }
    raw.data[di] = r;
    raw.data[di + 1] = g;
    raw.data[di + 2] = b;
    raw.data[di + 3] = 255;
  }
}

let minX = nw,
  minY = nh,
  maxX = 0,
  maxY = 0;
for (let y = 0; y < nh; y++) {
  for (let x = 0; x < nw; x++) {
    if (raw.data[(y * nw + x) * 4 + 3] < 8) continue;
    if (x < minX) minX = x;
    if (y < minY) minY = y;
    if (x > maxX) maxX = x;
    if (y > maxY) maxY = y;
  }
}
const pad = 1;
minX = Math.max(0, minX - pad);
minY = Math.max(0, minY - pad);
maxX = Math.min(nw - 1, maxX + pad);
maxY = Math.min(nh - 1, maxY + pad);
const cw = maxX - minX + 1;
const ch = maxY - minY + 1;
const out = new PNG({ width: cw, height: ch });
for (let y = 0; y < ch; y++) {
  for (let x = 0; x < cw; x++) {
    const si = ((minY + y) * nw + (minX + x)) << 2;
    const di = (y * cw + x) << 2;
    out.data[di] = raw.data[si];
    out.data[di + 1] = raw.data[si + 1];
    out.data[di + 2] = raw.data[si + 2];
    out.data[di + 3] = raw.data[si + 3];
  }
}

function lum(r, g, b) {
  return r * 0.3 + g * 0.54 + b * 0.16;
}
function pix(buf, w, h, x, y) {
  if (x < 0 || y < 0 || x >= w || y >= h) return [0, 0, 0, 0];
  const i = (y * w + x) << 2;
  return [buf[i], buf[i + 1], buf[i + 2], buf[i + 3]];
}

const tw = Math.floor(cw / 2);
const th = Math.floor((ch + 1) / 2);
const half = new PNG({ width: tw, height: th });
for (let y = 0; y < th; y++) {
  for (let x = 0; x < tw; x++) {
    const cells = [
      pix(out.data, cw, ch, x * 2, y * 2),
      pix(out.data, cw, ch, x * 2 + 1, y * 2),
      pix(out.data, cw, ch, x * 2, y * 2 + 1),
      pix(out.data, cw, ch, x * 2 + 1, y * 2 + 1),
    ];
    const ink = cells.filter((c) => c[3] > 80 && lum(c[0], c[1], c[2]) < 50);
    const solid = cells.filter((c) => c[3] > 80);
    const di = (y * tw + x) << 2;
    if (ink.length) {
      const p = ink.reduce((d, c) => (lum(c[0], c[1], c[2]) < lum(d[0], d[1], d[2]) ? c : d));
      half.data[di] = p[0];
      half.data[di + 1] = p[1];
      half.data[di + 2] = p[2];
      half.data[di + 3] = 255;
    } else if (solid.length) {
      let r = 0,
        g = 0,
        b = 0;
      for (const c of solid) {
        r += c[0];
        g += c[1];
        b += c[2];
      }
      half.data[di] = Math.round(r / solid.length);
      half.data[di + 1] = Math.round(g / solid.length);
      half.data[di + 2] = Math.round(b / solid.length);
      half.data[di + 3] = 255;
    }
  }
}

const dest = path.join(__dirname, "..", "public", "art", "furn", "stool_mint.png");
fs.mkdirSync(path.dirname(dest), { recursive: true });
fs.writeFileSync(dest, PNG.sync.write(half));
console.log("wrote", dest, tw + "x" + th, "(stool ~half a tile, 1:1 plant)");
