/** Key and size the artist chair for a 1x1 hotel seat. */
const fs = require("fs");
const path = require("path");
const { PNG } = require("pngjs");

const src = PNG.sync.read(fs.readFileSync("C:/Users/camer/Downloads/image (2).png"));
const SCALE = 6;
const W = src.width;
const H = src.height;
const D = src.data;

function at(x, y) {
  if (x < 0 || y < 0 || x >= W || y >= H) return [0, 0, 0, 0];
  const i = (y * W + x) << 2;
  return [D[i], D[i + 1], D[i + 2], D[i + 3]];
}
function isGuide(r, g, b, a) {
  if (a < 8) return true;
  if (r === g && g === b && (r === 128 || r === 192 || r === 103 || r === 155)) return true;
  return false;
}
function lum(r, g, b) {
  return r * 0.3 + g * 0.54 + b * 0.16;
}

const nw = Math.floor(W / SCALE);
const nh = Math.floor(H / SCALE);
const raw = new PNG({ width: nw, height: nh });
for (let y = 0; y < nh; y++) {
  for (let x = 0; x < nw; x++) {
    const cells = [];
    for (let j = 0; j < SCALE; j++) {
      for (let i = 0; i < SCALE; i++) {
        const c = at(x * SCALE + i, y * SCALE + j);
        if (!isGuide(c[0], c[1], c[2], c[3])) cells.push(c);
      }
    }
    const di = (y * nw + x) << 2;
    if (!cells.length) continue;
    const ink = cells.filter((c) => lum(c[0], c[1], c[2]) < 50);
    if (ink.length) {
      const p = ink.reduce((d, c) => (lum(c[0], c[1], c[2]) < lum(d[0], d[1], d[2]) ? c : d));
      raw.data[di] = p[0];
      raw.data[di + 1] = p[1];
      raw.data[di + 2] = p[2];
      raw.data[di + 3] = 255;
    } else {
      let r = 0,
        g = 0,
        b = 0;
      for (const c of cells) {
        r += c[0];
        g += c[1];
        b += c[2];
      }
      raw.data[di] = Math.round(r / cells.length);
      raw.data[di + 1] = Math.round(g / cells.length);
      raw.data[di + 2] = Math.round(b / cells.length);
      raw.data[di + 3] = 255;
    }
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

const dest = path.join(__dirname, "..", "public", "art", "furn", "chair_coral.png");
fs.mkdirSync(path.dirname(dest), { recursive: true });
fs.writeFileSync(dest, PNG.sync.write(out));
console.log("wrote", dest, cw + "x" + ch);
