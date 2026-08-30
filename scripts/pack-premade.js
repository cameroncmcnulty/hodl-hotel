/** Magenta-key complete look sprites into 96x176 premade PNGs. */
const fs = require("fs");
const path = require("path");
const jpeg = require("jpeg-js");
const { PNG } = require("pngjs");

const ROOT = path.join(__dirname, "..");
const OUT = path.join(ROOT, "public", "art", "premade");
const IMG = path.join(
  process.env.USERPROFILE || "C:\\Users\\camer",
  ".grok",
  "sessions",
  "C%3A%5CUsers%5Ccamer",
  "01a0318d-2002-7f90-a78b-d6097a8442c5",
  "images"
);
fs.mkdirSync(OUT, { recursive: true });

const W = 96;
const H = 176;

const MAP = {
  "b-00": path.join(ROOT, "public", "art", "avatars", "m-se-idle.png"),
  "g-00": path.join(ROOT, "public", "art", "avatars", "f-se-idle.png"),
  "b-01": "363.jpg",
  "b-02": "365.jpg",
  "b-03": "370.jpg",
  "b-04": "372.jpg",
  "b-05": "367.jpg",
  "b-06": "375.jpg",
  "b-07": "376.jpg",
  "b-08": "373.jpg",
  "b-09": "382.jpg",
  "b-10": "384.jpg",
  "b-11": "380.jpg",
  "b-12": "386.jpg",
  "b-13": "387.jpg",
  "b-14": "389.jpg",
  "b-15": "391.jpg",
  "b-16": "393.jpg",
  "b-17": "395.jpg",
  "b-18": "397.jpg",
  "b-19": "399.jpg",
  "b-20": "402.jpg",
  "b-21": "400.jpg",
  "b-22": "405.jpg",
  "b-23": "409.jpg",
  "b-24": "411.jpg",
  "b-25": "407.jpg",
  "b-26": "412.jpg",
  "b-27": "413.jpg",
  "b-28": "416.jpg",
  "b-29": "418.jpg",
  "b-30": "421.jpg",
  "g-01": "366.jpg",
  "g-02": "364.jpg",
  "g-03": "368.jpg",
  "g-04": "369.jpg",
  "g-05": "371.jpg",
  "g-06": "378.jpg",
  "g-07": "374.jpg",
  "g-08": "377.jpg",
  "g-09": "383.jpg",
  "g-10": "381.jpg",
  "g-11": "379.jpg",
  "g-12": "385.jpg",
  "g-13": "390.jpg",
  "g-14": "388.jpg",
  "g-15": "394.jpg",
  "g-16": "392.jpg",
  "g-17": "398.jpg",
  "g-18": "396.jpg",
  "g-19": "403.jpg",
  "g-20": "401.jpg",
  "g-21": "404.jpg",
  "g-22": "408.jpg",
  "g-23": "406.jpg",
  "g-24": "410.jpg",
  "g-25": "414.jpg",
  "g-26": "415.jpg",
  "g-27": "417.jpg",
  "g-28": "419.jpg",
  "g-29": "420.jpg",
};

function mag(r, g, b) {
  if (g > 60) return false;
  if (r > 235 && b > 235 && Math.abs(r - b) < 28) return true;
  return false;
}

function loadRaw(file) {
  const buf = fs.readFileSync(file);
  if (file.endsWith(".png")) {
    const p = PNG.sync.read(buf);
    return { w: p.width, h: p.height, d: p.data };
  }
  const j = jpeg.decode(buf, { maxMemoryUsageInMB: 256 });
  return { w: j.width, h: j.height, d: j.data };
}

function resolve(file) {
  if (path.isAbsolute(file) || file.includes(`${path.sep}public${path.sep}`) || file.includes("/public/")) return file;
  return path.join(IMG, file);
}

function pack(id, file) {
  file = resolve(file);
  if (!fs.existsSync(file)) {
    console.log("missing", id, file);
    return;
  }
  const src = loadRaw(file);
  const seen = new Uint8Array(src.w * src.h);
  const stack = [];
  const push = (x, y) => {
    if (x < 0 || y < 0 || x >= src.w || y >= src.h) return;
    const i = y * src.w + x;
    if (seen[i]) return;
    const o = i * 4;
    const a = src.d[o + 3] ?? 255;
    if (a > 8 && !mag(src.d[o], src.d[o + 1], src.d[o + 2])) return;
    seen[i] = 1;
    src.d[o + 3] = 0;
    stack.push(x, y);
  };
  for (let x = 0; x < src.w; x++) {
    push(x, 0);
    push(x, src.h - 1);
  }
  for (let y = 0; y < src.h; y++) {
    push(0, y);
    push(src.w - 1, y);
  }
  while (stack.length) {
    const y = stack.pop();
    const x = stack.pop();
    push(x - 1, y);
    push(x + 1, y);
    push(x, y - 1);
    push(x, y + 1);
  }
  let minx = src.w,
    miny = src.h,
    maxx = 0,
    maxy = 0;
  for (let y = 0; y < src.h; y++) {
    for (let x = 0; x < src.w; x++) {
      const i = (y * src.w + x) * 4;
      const r = src.d[i],
        g = src.d[i + 1],
        b = src.d[i + 2],
        a = src.d[i + 3] ?? 255;
      if (a < 8 || mag(r, g, b)) continue;
      if (x < minx) minx = x;
      if (y < miny) miny = y;
      if (x > maxx) maxx = x;
      if (y > maxy) maxy = y;
    }
  }
  if (maxx < minx) {
    console.log("empty", id);
    return;
  }
  minx = Math.max(0, minx - 6);
  miny = Math.max(0, miny - 10);
  maxx = Math.min(src.w - 1, maxx + 6);
  maxy = Math.min(src.h - 1, maxy + 4);
  const bw = maxx - minx + 1;
  const bh = maxy - miny + 1;
  const pad = 4;
  const sc = Math.min((W - pad * 2) / bw, (H - pad * 2) / bh);
  const dw = Math.max(1, Math.round(bw * sc));
  const dh = Math.max(1, Math.round(bh * sc));
  const ox = Math.round((W - dw) / 2);
  const oy = H - pad - dh;
  const png = new PNG({ width: W, height: H, colorType: 6 });
  png.data.fill(0);
  for (let y = 0; y < dh; y++) {
    for (let x = 0; x < dw; x++) {
      const sx = minx + Math.floor(x / sc);
      const sy = miny + Math.floor(y / sc);
      const i = (sy * src.w + sx) * 4;
      const r = src.d[i],
        g = src.d[i + 1],
        b = src.d[i + 2],
        a = src.d[i + 3] ?? 255;
      if (a < 8 || mag(r, g, b)) continue;
      const o = ((oy + y) * W + (ox + x)) * 4;
      png.data[o] = r;
      png.data[o + 1] = g;
      png.data[o + 2] = b;
      png.data[o + 3] = 255;
    }
  }
  fs.writeFileSync(path.join(OUT, id + ".png"), PNG.sync.write(png, { colorType: 6, deflateLevel: 9 }));
  console.log("packed", id, dw + "x" + dh);
}

for (const [id, file] of Object.entries(MAP)) pack(id, file);
console.log("out", OUT);
