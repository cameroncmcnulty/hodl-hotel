/** Key only the checker/frame. Keep every body pixel, including eyes. */
const fs = require("fs");
const path = require("path");
const { PNG } = require("pngjs");

const src = PNG.sync.read(fs.readFileSync("C:/Users/camer/Downloads/image (1).png"));
const W = src.width;
const H = src.height;
const D = src.data;

function at(x, y) {
  if (x < 0 || y < 0 || x >= W || y >= H) return [0, 0, 0, 0];
  const i = (y * W + x) << 2;
  return [D[i], D[i + 1], D[i + 2], D[i + 3]];
}

function isChecker(r, g, b, a) {
  if (a < 8) return true;
  if (r === g && g === b && (r === 128 || r === 192)) return true;
  if (r === 101 && g === 85 && b === 97) return true;
  return false;
}

function keyOf(c) {
  return `${c[0]},${c[1]},${c[2]}`;
}

function majority(cells) {
  const tally = new Map();
  for (const c of cells) {
    const k = keyOf(c);
    const hit = tally.get(k);
    if (hit) hit.n++;
    else tally.set(k, { c, n: 1 });
  }
  let best = null;
  for (const v of tally.values()) {
    if (!best || v.n > best.n) best = v;
  }
  return best.c;
}

const SCALE = 3;
const OX = 1;
const OY = 1;
const nw = Math.floor((W - OX) / SCALE);
const nh = Math.floor((H - OY) / SCALE);
const one = new PNG({ width: nw, height: nh });

for (let y = 0; y < nh; y++) {
  for (let x = 0; x < nw; x++) {
    const body = [];
    for (let j = 0; j < SCALE; j++) {
      for (let i = 0; i < SCALE; i++) {
        const c = at(OX + x * SCALE + i, OY + y * SCALE + j);
        if (!isChecker(c[0], c[1], c[2], c[3])) body.push(c);
      }
    }
    if (!body.length) continue;
    const p = majority(body);
    const di = (y * nw + x) << 2;
    one.data[di] = p[0];
    one.data[di + 1] = p[1];
    one.data[di + 2] = p[2];
    one.data[di + 3] = 255;
  }
}

function countRow(y) {
  let n = 0;
  for (let x = 0; x < nw; x++) if (one.data[(y * nw + x) * 4 + 3] > 12) n++;
  return n;
}
function countCol(x) {
  let n = 0;
  for (let y = 0; y < nh; y++) if (one.data[(y * nw + x) * 4 + 3] > 12) n++;
  return n;
}

const ys = [];
for (let y = 0; y < nh; y++) {
  const n = countRow(y);
  if (n > 4 && n < nw - 1) ys.push(y);
}
const xs = [];
for (let x = 0; x < nw; x++) {
  const n = countCol(x);
  if (n > 4 && n < nh - 1) xs.push(x);
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
    const si = ((y0 + y) * nw + (x0 + x)) << 2;
    const di = (y * cw + x) << 2;
    crop.data[di] = one.data[si];
    crop.data[di + 1] = one.data[si + 1];
    crop.data[di + 2] = one.data[si + 2];
    crop.data[di + 3] = one.data[si + 3];
  }
}

const destDir = path.join(__dirname, "..", "public", "art", "avatars");
fs.mkdirSync(destDir, { recursive: true });
fs.writeFileSync(path.join(destDir, "test-body.png"), PNG.sync.write(crop));
console.log("wrote test-body.png", cw + "x" + ch, "from 1x canvas", nw + "x" + nh, "crop", x0, y0, x1, y1);

let white = 0,
  black = 0;
for (let i = 0; i < crop.data.length; i += 4) {
  if (crop.data[i + 3] < 8) continue;
  const r = crop.data[i],
    g = crop.data[i + 1],
    b = crop.data[i + 2];
  if (r > 240 && g > 240 && b > 240) white++;
  if (r < 20 && g < 20 && b < 20) black++;
}
console.log("white eye-ish pixels", white, "black pixels", black);
