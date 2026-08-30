/** Derive missing furniture-style look layers from aligned sources. */
const fs = require("fs");
const path = require("path");
const { PNG } = require("pngjs");

const DIR = path.join(__dirname, "..", "public", "art", "look");

function load(name) {
  return PNG.sync.read(fs.readFileSync(path.join(DIR, name + ".png")));
}
function save(name, png) {
  fs.writeFileSync(path.join(DIR, name + ".png"), PNG.sync.write(png, { colorType: 6, deflateLevel: 9 }));
}
function blank() {
  const png = new PNG({ width: 128, height: 264 });
  png.data.fill(0);
  return png;
}
function mag(r, g, b, a) {
  if (a < 8) return true;
  if (r > 230 && g < 40 && b > 230) return true;
  if (r > 220 && b > 170 && g < 90) return true;
  return false;
}
function clone(src) {
  const p = blank();
  for (let i = 0; i < src.data.length; i += 4) {
    if (mag(src.data[i], src.data[i + 1], src.data[i + 2], src.data[i + 3])) continue;
    p.data[i] = src.data[i];
    p.data[i + 1] = src.data[i + 1];
    p.data[i + 2] = src.data[i + 2];
    p.data[i + 3] = 255;
  }
  return p;
}
function bbox(png) {
  let minx = png.width,
    miny = png.height,
    maxx = 0,
    maxy = 0;
  for (let y = 0; y < png.height; y++) {
    for (let x = 0; x < png.width; x++) {
      const i = (y * png.width + x) * 4;
      if (png.data[i + 3] < 8) continue;
      if (x < minx) minx = x;
      if (y < miny) miny = y;
      if (x > maxx) maxx = x;
      if (y > maxy) maxy = y;
    }
  }
  return { minx, miny, maxx, maxy, w: maxx - minx + 1, h: maxy - miny + 1 };
}
function lum(r, g, b) {
  return r * 0.3 + g * 0.54 + b * 0.16;
}
function outline(r, g, b) {
  return lum(r, g, b) < 38;
}
function tint(png, hex) {
  const n = parseInt(hex.replace("#", ""), 16);
  const tr = (n >> 16) & 255,
    tg = (n >> 8) & 255,
    tb = n & 255;
  const out = clone(png);
  for (let i = 0; i < out.data.length; i += 4) {
    if (out.data[i + 3] < 8) continue;
    const r = out.data[i],
      g = out.data[i + 1],
      b = out.data[i + 2];
    if (outline(r, g, b)) continue;
    const L = lum(r, g, b) / 255;
    out.data[i] = Math.max(0, Math.min(255, Math.round(tr * (0.35 + L * 0.9))));
    out.data[i + 1] = Math.max(0, Math.min(255, Math.round(tg * (0.35 + L * 0.9))));
    out.data[i + 2] = Math.max(0, Math.min(255, Math.round(tb * (0.35 + L * 0.9))));
  }
  return out;
}
function setPx(png, x, y, r, g, b, a = 255) {
  if (x < 0 || y < 0 || x >= png.width || y >= png.height) return;
  const i = (y * png.width + x) * 4;
  png.data[i] = r;
  png.data[i + 1] = g;
  png.data[i + 2] = b;
  png.data[i + 3] = a;
}
function get(png, x, y) {
  if (x < 0 || y < 0 || x >= png.width || y >= png.height) return [0, 0, 0, 0];
  const i = (y * png.width + x) * 4;
  return [png.data[i], png.data[i + 1], png.data[i + 2], png.data[i + 3]];
}

function jacket(src) {
  const p = clone(src);
  const b = bbox(p);
  const mid = Math.round((b.minx + b.maxx) / 2);
  for (let y = b.miny + 8; y <= b.maxy - 6; y++) {
    for (let x = mid - 3; x <= mid + 3; x++) {
      const [r, g, bl, a] = get(p, x, y);
      if (a < 8 || outline(r, g, bl)) continue;
      if (x === mid) setPx(p, x, y, 18, 14, 16);
      else setPx(p, x, y, 230, 222, 208);
    }
  }
  return p;
}

function tank(src) {
  const p = clone(src);
  const b = bbox(p);
  const cx = (b.minx + b.maxx) / 2;
  for (let y = b.miny; y <= b.miny + Math.round(b.h * 0.62); y++) {
    for (let x = b.minx; x <= b.maxx; x++) {
      if (Math.abs(x - cx) < b.w * 0.28) continue;
      const i = (y * p.width + x) * 4;
      p.data[i + 3] = 0;
    }
  }
  return p;
}

function sweater(src) {
  const p = tint(src, "#c4a574");
  const b = bbox(p);
  for (let y = b.miny; y <= b.miny + 8; y++) {
    for (let x = b.minx; x <= b.maxx; x++) {
      const [r, g, bl, a] = get(p, x, y);
      if (a < 8 || outline(r, g, bl)) continue;
      const k = y % 2 === 0 ? 18 : -18;
      setPx(p, x, y, Math.max(0, r + k), Math.max(0, g + k), Math.max(0, bl + k));
    }
  }
  return p;
}

function jeans(src) {
  const p = tint(src, "#2563eb");
  const b = bbox(p);
  const left = b.minx + Math.round(b.w * 0.32);
  const right = b.minx + Math.round(b.w * 0.68);
  for (let y = b.miny + 10; y <= b.maxy - 4; y++) {
    const [r, g, bl, a] = get(p, left, y);
    if (a > 8 && !outline(r, g, bl)) setPx(p, left, y, Math.min(255, r + 40), Math.min(255, g + 40), Math.min(255, bl + 40));
    const q = get(p, right, y);
    if (q[3] > 8 && !outline(q[0], q[1], q[2])) setPx(p, right, y, Math.min(255, q[0] + 40), Math.min(255, q[1] + 40), Math.min(255, q[2] + 40));
  }
  return p;
}

function cargo(src) {
  const p = tint(src, "#c4a574");
  const b = bbox(p);
  const y0 = b.miny + Math.round(b.h * 0.35);
  function pocket(x0) {
    for (let y = y0; y < y0 + 14; y++) {
      for (let x = x0; x < x0 + 12; x++) {
        const [r, g, bl, a] = get(p, x, y);
        if (a < 8) continue;
        if (y === y0 || x === x0 || x === x0 + 11 || y === y0 + 13) setPx(p, x, y, 20, 16, 14);
        else setPx(p, x, y, Math.max(0, r - 24), Math.max(0, g - 24), Math.max(0, bl - 24));
      }
    }
  }
  pocket(b.minx + 6);
  pocket(b.maxx - 18);
  return p;
}

function joggers(src) {
  const p = clone(src);
  const b = bbox(p);
  for (let y = b.maxy - 10; y <= b.maxy; y++) {
    for (let x = b.minx; x <= b.maxx; x++) {
      const [r, g, bl, a] = get(p, x, y);
      if (a < 8 || outline(r, g, bl)) continue;
      setPx(p, x, y, Math.max(0, r - 28), Math.max(0, g - 28), Math.max(0, bl - 28));
    }
  }
  return p;
}

function mohawk(src) {
  const p = clone(src);
  const b = bbox(p);
  const cx = (b.minx + b.maxx) / 2;
  for (let y = 0; y < p.height; y++) {
    for (let x = 0; x < p.width; x++) {
      const i = (y * p.width + x) * 4;
      if (p.data[i + 3] < 8) continue;
      if (Math.abs(x - cx) > b.w * 0.18) p.data[i + 3] = 0;
    }
  }
  return p;
}

function longHair(src) {
  const p = clone(src);
  const b = bbox(p);
  for (let y = b.miny + 20; y <= b.maxy; y++) {
    for (let x = b.minx; x <= b.maxx; x++) {
      const t = (x - b.minx) / b.w;
      if (t > 0.28 && t < 0.72) continue;
      const [r, g, bl, a] = get(src, x, y);
      if (a < 8) continue;
      const dy = y + 42;
      if (get(p, x, dy)[3] < 8) setPx(p, x, dy, r, g, bl);
      if (get(p, x, dy + 8)[3] < 8) setPx(p, x - 1, dy + 8, r, g, bl);
    }
  }
  return p;
}

function pigtails(src) {
  const p = clone(src);
  const b = bbox(p);
  for (let y = b.miny; y <= b.maxy; y++) {
    for (let x = b.minx; x <= Math.round((b.minx + b.maxx) / 2); x++) {
      const [r, g, bl, a] = get(src, x, y);
      if (a < 8) continue;
      const nx = b.maxx - (x - b.minx);
      if (get(p, nx, y)[3] < 8) setPx(p, nx, y, r, g, bl);
    }
  }
  for (let y = b.maxy - 8; y <= b.maxy + 18; y++) {
    for (const sx of [b.minx + 8, b.maxx - 8]) {
      for (let x = sx - 5; x <= sx + 5; x++) {
        const [r, g, bl, a] = get(src, Math.min(b.maxx, Math.max(b.minx, x)), b.maxy - 4);
        if (a < 8) continue;
        if (get(p, x, y)[3] < 8) setPx(p, x, y, r, g, bl);
      }
    }
  }
  return p;
}

function bun(src) {
  const p = clone(src);
  const b = bbox(p);
  const cx = Math.round((b.minx + b.maxx) / 2);
  const cy = b.miny + 4;
  for (let y = cy - 10; y <= cy + 8; y++) {
    for (let x = cx - 12; x <= cx + 12; x++) {
      const dx = (x - cx) / 11;
      const dy = (y - cy) / 8;
      if (dx * dx + dy * dy > 1) continue;
      const [r, g, bl, a] = get(src, cx, b.miny + 8);
      if (a < 8) continue;
      const L = dx * 0.4 + dy * 0.5;
      const k = L < -0.3 ? 30 : L > 0.3 ? -30 : 0;
      setPx(p, x, y, Math.max(0, r + k), Math.max(0, g + k), Math.max(0, bl + k));
    }
  }
  return p;
}

function pleat(src) {
  const p = clone(src);
  const b = bbox(p);
  for (const t of [0.3, 0.5, 0.7]) {
    const x = b.minx + Math.round(b.w * t);
    for (let y = b.miny + 6; y <= b.maxy - 2; y++) {
      const [r, g, bl, a] = get(p, x, y);
      if (a < 8) continue;
      setPx(p, x, y, Math.max(0, r - 50), Math.max(0, g - 50), Math.max(0, bl - 50));
    }
  }
  return p;
}

function tallerShoe(src, up) {
  const p = clone(src);
  const b = bbox(p);
  for (let y = b.miny; y <= b.miny + Math.round(b.h * 0.55); y++) {
    for (let x = b.minx; x <= b.maxx; x++) {
      const [r, g, bl, a] = get(src, x, y);
      if (a < 8) continue;
      setPx(p, x, y - up, r, g, bl);
    }
  }
  return p;
}

function flatShoe(src) {
  const p = clone(src);
  const b = bbox(p);
  const cut = b.miny + Math.round(b.h * 0.4);
  for (let y = b.miny; y < cut; y++) {
    for (let x = b.minx; x <= b.maxx; x++) p.data[(y * p.width + x) * 4 + 3] = 0;
  }
  return p;
}

const jobs = [
  ["m-top-jacket-0", () => jacket(load("m-top-hoodie-0"))],
  ["m-top-tank-0", () => tank(load("m-top-tee-0"))],
  ["m-top-sweater-0", () => sweater(load("m-top-hoodie-0"))],
  ["f-top-jacket-0", () => jacket(load("f-top-hoodie-0"))],
  ["f-top-tank-0", () => tank(load("f-top-tee-0"))],
  ["f-top-sweater-0", () => sweater(load("f-top-hoodie-0"))],
  ["m-bot-jeans-0", () => jeans(load("m-bot-pants-0"))],
  ["m-bot-cargo-0", () => cargo(load("m-bot-pants-0"))],
  ["m-bot-joggers-0", () => joggers(load("m-bot-pants-0"))],
  ["f-bot-jeans-0", () => jeans(load("f-bot-pants-0"))],
  ["f-bot-pleat-0", () => pleat(load("f-bot-skirt-0"))],
  ["m-hair-mohawk-0", () => mohawk(load("m-hair-spikes-0"))],
  ["f-hair-long-0", () => longHair(load("f-hair-waves-0"))],
  ["f-hair-pigtails-0", () => pigtails(load("f-hair-pony-0"))],
  ["f-hair-bun-0", () => bun(load("f-hair-bob-0"))],
  ["m-shoe-hightops-0", () => tallerShoe(load("m-shoe-sneakers-0"), 8)],
  ["m-shoe-boots-0", () => tallerShoe(tint(load("m-shoe-sneakers-0"), "#2a2a32"), 12)],
  ["m-shoe-skate-0", () => tallerShoe(tint(load("m-shoe-sneakers-0"), "#2a2a32"), 2)],
  ["m-shoe-slides-0", () => flatShoe(load("m-shoe-sneakers-0"))],
  ["f-shoe-hightops-0", () => tallerShoe(load("f-shoe-sneakers-0"), 8)],
  ["f-shoe-boots-0", () => tallerShoe(tint(load("f-shoe-sneakers-0"), "#2a2a32"), 12)],
  ["f-shoe-skate-0", () => tallerShoe(tint(load("f-shoe-sneakers-0"), "#2a2a32"), 2)],
];

for (const [name, fn] of jobs) {
  save(name, fn());
  console.log("wrote", name);
}
console.log("done", jobs.length);
