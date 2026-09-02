/** Pixel-perfect 2:1 floor guide matching src/lib/game/iso.ts */
const fs = require("fs");
const path = require("path");
const { PNG } = require("pngjs");

const TW = 64;
const TH = 32;
const HALF_W = TW / 2;
const HALF_H = TH / 2;

function iso(x, y) {
  return { sx: (x - y) * HALF_W, sy: (x + y) * HALF_H };
}
function uniso(sx, sy) {
  return {
    x: (sx / HALF_W + sy / HALF_H) / 2,
    y: (sy / HALF_H - sx / HALF_W) / 2,
  };
}

const COLS = 4;
const ROWS = 3;
const PAD = 16;
const LEGEND = 8;
const corners = [iso(0, 0), iso(COLS, 0), iso(0, ROWS), iso(COLS, ROWS)];
const minX = Math.min(...corners.map((p) => p.sx));
const minY = Math.min(...corners.map((p) => p.sy));
const maxX = Math.max(...corners.map((p) => p.sx));
const maxY = Math.max(...corners.map((p) => p.sy));
const W = Math.ceil(maxX - minX + PAD * 2);
const H = Math.ceil(maxY - minY + PAD * 2 + LEGEND);
const ox = PAD - minX;
const oy = PAD - minY;

const png = new PNG({ width: W, height: H });
const d = png.data;
function set(x, y, r, g, b, a = 255) {
  x = Math.round(x);
  y = Math.round(y);
  if (x < 0 || y < 0 || x >= W || y >= H) return;
  const i = (y * W + x) << 2;
  d[i] = r;
  d[i + 1] = g;
  d[i + 2] = b;
  d[i + 3] = a;
}
function hex(h) {
  const n = parseInt(h.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

for (let i = 0; i < W * H; i++) {
  d[i * 4] = 18;
  d[i * 4 + 1] = 16;
  d[i * 4 + 2] = 22;
  d[i * 4 + 3] = 255;
}

const A = hex("#d4b48a");
const B = hex("#c19a6e");
const INK = hex("#0C080E");
const CYAN = hex("#14F195");
const BLUE = hex("#2a7dff");
const PINK = hex("#ff6bd6");
const GOLD = hex("#f5c542");

for (let py = 0; py < H - LEGEND; py++) {
  for (let px = 0; px < W; px++) {
    const u = uniso(px - ox, py - oy);
    if (u.x < 0 || u.y < 0 || u.x >= COLS || u.y >= ROWS) continue;
    const tx = Math.floor(u.x);
    const ty = Math.floor(u.y);
    const c = (tx + ty) % 2 === 0 ? A : B;
    set(px, py, c[0], c[1], c[2]);
  }
}

function diamondCorners(x, y, w = 1, dth = 1) {
  return [iso(x, y), iso(x + w, y), iso(x + w, y + dth), iso(x, y + dth)];
}

function outlinePoly(pts, col) {
  for (let i = 0; i < pts.length; i++) {
    const a = pts[i];
    const b = pts[(i + 1) % pts.length];
    line(a.sx + ox, a.sy + oy, b.sx + ox, b.sy + oy, col);
  }
}

function line(x0, y0, x1, y1, col) {
  x0 = Math.round(x0);
  y0 = Math.round(y0);
  x1 = Math.round(x1);
  y1 = Math.round(y1);
  let dx = Math.abs(x1 - x0);
  let dy = Math.abs(y1 - y0);
  const sx = x0 < x1 ? 1 : -1;
  const sy = y0 < y1 ? 1 : -1;
  let err = dx - dy;
  let x = x0;
  let y = y0;
  for (let n = 0; n < 4000; n++) {
    set(x, y, col[0], col[1], col[2]);
    if (x === x1 && y === y1) break;
    const e2 = 2 * err;
    if (e2 > -dy) {
      err -= dy;
      x += sx;
    }
    if (e2 < dx) {
      err += dx;
      y += sy;
    }
  }
}

function aabb(x, y, col) {
  const t = iso(x, y);
  const left = t.sx + ox - HALF_W;
  const top = t.sy + oy;
  for (let i = 0; i <= TW; i++) {
    set(left + i, top, col[0], col[1], col[2]);
    set(left + i, top + TH, col[0], col[1], col[2]);
  }
  for (let j = 0; j <= TH; j++) {
    set(left, top + j, col[0], col[1], col[2]);
    set(left + TW, top + j, col[0], col[1], col[2]);
  }
}

outlinePoly(diamondCorners(1, 1), CYAN);
aabb(1, 1, BLUE);
outlinePoly(diamondCorners(2, 0, 2, 1), PINK);
outlinePoly(diamondCorners(0, 1, 2, 2), GOLD);

const n0 = iso(1, 1);
const n1 = iso(2, 1);
line(n0.sx + ox, n0.sy + oy + 8, n1.sx + ox, n1.sy + oy + 8, CYAN);

function blitScale(src, scale) {
  const out = new PNG({ width: src.width * scale, height: src.height * scale });
  for (let y = 0; y < src.height; y++) {
    for (let x = 0; x < src.width; x++) {
      const i = (y * src.width + x) << 2;
      for (let dy = 0; dy < scale; dy++) {
        for (let dx = 0; dx < scale; dx++) {
          const j = ((y * scale + dy) * out.width + (x * scale + dx)) << 2;
          out.data[j] = src.data[i];
          out.data[j + 1] = src.data[i + 1];
          out.data[j + 2] = src.data[i + 2];
          out.data[j + 3] = src.data[i + 3];
        }
      }
    }
  }
  return out;
}

const dir = path.join(__dirname, "..", "docs");
const out1 = path.join(dir, "iso-grid-guide.png");
fs.writeFileSync(out1, PNG.sync.write(png));
const out3 = path.join(dir, "iso-grid-guide-3x.png");
fs.writeFileSync(out3, PNG.sync.write(blitScale(png, 3)));
console.log("wrote", out1, W + "x" + H);
console.log("wrote", out3, W * 3 + "x" + H * 3);
