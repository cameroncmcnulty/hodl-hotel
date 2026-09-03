/** Key, 1×, and size the artist body for a hotel guest test. */
const fs = require("fs");
const path = require("path");
const { PNG } = require("pngjs");

const srcPath = "C:/Users/camer/Downloads/image (1).png";
const src = PNG.sync.read(fs.readFileSync(srcPath));
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
  if (r === g && g === b && (r === 128 || r === 192)) return true;
  if (r === 101 && g === 85 && b === 97) return true;
  return false;
}
function lum(r, g, b) {
  return r * 0.3 + g * 0.54 + b * 0.16;
}
function down(srcW, srcH, srcD, scale, get) {
  const nw = Math.floor(srcW / scale);
  const nh = Math.floor((srcH + (scale === 2 ? 1 : 0)) / scale);
  const out = new PNG({ width: nw, height: nh });
  for (let y = 0; y < nh; y++) {
    for (let x = 0; x < nw; x++) {
      const cells = [];
      for (let j = 0; j < scale; j++) {
        for (let i = 0; i < scale; i++) cells.push(get(x * scale + i, y * scale + j));
      }
      const ink = cells.filter((c) => c[3] > 80 && lum(c[0], c[1], c[2]) < 50);
      const solid = cells.filter((c) => c[3] > 80);
      const di = (y * nw + x) << 2;
      if (ink.length) {
        const p = ink.reduce((d, c) => (lum(c[0], c[1], c[2]) < lum(d[0], d[1], d[2]) ? c : d));
        out.data[di] = p[0];
        out.data[di + 1] = p[1];
        out.data[di + 2] = p[2];
        out.data[di + 3] = 255;
      } else if (solid.length) {
        let r = 0,
          g = 0,
          b = 0;
        for (const c of solid) {
          r += c[0];
          g += c[1];
          b += c[2];
        }
        out.data[di] = Math.round(r / solid.length);
        out.data[di + 1] = Math.round(g / solid.length);
        out.data[di + 2] = Math.round(b / solid.length);
        out.data[di + 3] = 255;
      }
    }
  }
  return out;
}

const SCALE = 3;
const OX = 1;
const OY = 1;
const nw = Math.floor((W - OX) / SCALE);
const nh = Math.floor((H - OY) / SCALE);
const one = down(nw * SCALE, nh * SCALE, null, SCALE, (x, y) => {
  const [r, g, b, a] = at(OX + x, OY + y);
  if (isGuide(r, g, b, a)) return [0, 0, 0, 0];
  return [r, g, b, 255];
});

function countRow(buf, w, h, y) {
  let n = 0;
  for (let x = 0; x < w; x++) if (buf[(y * w + x) * 4 + 3] > 12) n++;
  return n;
}
function countCol(buf, w, h, x) {
  let n = 0;
  for (let y = 0; y < h; y++) if (buf[(y * w + x) * 4 + 3] > 12) n++;
  return n;
}
const ys = [];
for (let y = 0; y < one.height; y++) {
  const n = countRow(one.data, one.width, one.height, y);
  if (n > 8 && n < one.width - 2) ys.push(y);
}
const xs = [];
for (let x = 0; x < one.width; x++) {
  const n = countCol(one.data, one.width, one.height, x);
  if (n > 8 && n < one.height - 2) xs.push(x);
}
const x0 = xs[0];
const y0 = ys[0];
const x1 = xs[xs.length - 1];
const y1 = ys[ys.length - 1];
const cw = x1 - x0 + 1;
const ch = y1 - y0 + 1;
const crop = new PNG({ width: cw, height: ch });
for (let y = 0; y < ch; y++) {
  for (let x = 0; x < cw; x++) {
    const si = ((y0 + y) * one.width + (x0 + x)) << 2;
    const di = (y * cw + x) << 2;
    crop.data[di] = one.data[si];
    crop.data[di + 1] = one.data[si + 1];
    crop.data[di + 2] = one.data[si + 2];
    crop.data[di + 3] = one.data[si + 3];
  }
}

const half = down(cw, ch, crop.data, 2, (x, y) => {
  if (x < 0 || y < 0 || x >= cw || y >= ch) return [0, 0, 0, 0];
  const i = (y * cw + x) << 2;
  return [crop.data[i], crop.data[i + 1], crop.data[i + 2], crop.data[i + 3]];
});

const dest = path.join(__dirname, "..", "public", "art", "avatars", "test-body.png");
fs.mkdirSync(path.dirname(dest), { recursive: true });
fs.writeFileSync(dest, PNG.sync.write(half));
console.log("1x crop", cw + "x" + ch, "-> test", half.width + "x" + half.height);
console.log("wrote", dest);
