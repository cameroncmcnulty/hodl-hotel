const fs = require("fs");
const path = require("path");
const jpeg = require("jpeg-js");
const { PNG } = require("pngjs");

const DIR = path.join(__dirname, "..", "public", "art", "avatars");
const SRC = path.join(
  process.env.USERPROFILE,
  ".grok",
  "sessions",
  "C%3A%5CUsers%5Ccamer",
  "01a0318d-2002-7f90-a78b-d6097a8442c5",
  "images"
);
const W = 784;
const H = 1168;

const JOBS = [
  { file: "313.jpg", g: "m", kind: "hair", name: "spike" },
  { file: "314.jpg", g: "m", kind: "hair", name: "buzz" },
  { file: "323.jpg", g: "m", kind: "hair", name: "mohawk" },
  { file: "316.jpg", g: "m", kind: "top", name: "tee" },
  { file: "321.jpg", g: "m", kind: "top", name: "jacket" },
  { file: "312.jpg", g: "m", kind: "bot", name: "shorts" },
  { file: "311.jpg", g: "f", kind: "hair", name: "bob" },
  { file: "319.jpg", g: "f", kind: "hair", name: "long" },
  { file: "315.jpg", g: "f", kind: "top", name: "cami" },
  { file: "322.jpg", g: "f", kind: "top", name: "cardi" },
  { file: "317.jpg", g: "f", kind: "bot", name: "shorts" },
  { file: "318.jpg", g: "f", kind: "bot", name: "pants" },
];

function isMagenta(r, g, b) {
  return r > 180 && b > 140 && g < 120;
}
function isOutline(r, g, b) {
  return r < 28 && g < 28 && b < 28;
}
function isSkin(r, g, b) {
  return r > 210 && g > 140 && g < 225 && b > 95 && b < 195 && r - b > 35 && r > g - 6;
}
function isHair(r, g, b) {
  if (r > 170) return false;
  return r > 50 && r < 160 && g > 22 && g < 100 && b < 65 && r > g + 8;
}
function isGray(r, g, b) {
  const mx = Math.max(r, g, b),
    mn = Math.min(r, g, b);
  return mx - mn < 24 && mx > 85 && mx < 200;
}
function isPink(r, g, b) {
  return r > 190 && g > 70 && g < 195 && b > 115 && r - g > 35;
}
function isNavy(r, g, b) {
  return b > r + 12 && b > g && r < 90 && g < 100 && b < 180;
}
function isDark(r, g, b) {
  return r < 60 && g < 60 && b < 60 && !isOutline(r, g, b);
}
function isWhite(r, g, b) {
  return r > 200 && g > 200 && b > 200;
}
function isBlue(r, g, b) {
  return b > 55 && b >= r && b >= g - 15 && r < 130 && g < 150;
}
function isCream(r, g, b) {
  return r > 190 && g > 170 && b > 130 && r - b < 80 && g - b > 10;
}
function isBrown(r, g, b) {
  return r > 70 && r < 190 && g > 35 && g < 130 && b < 85 && r > g && g > b - 10;
}
function inFace(xn, yn) {
  return yn > 0.24 && yn < 0.4 && xn > 0.34 && xn < 0.66;
}

function seedFn(kind) {
  if (kind === "hair") return (r, g, b, yn) => yn < 0.5 && isHair(r, g, b);
  if (kind === "top")
    return (r, g, b, yn) => {
      if (yn < 0.34 || yn > 0.63) return false;
      if (isSkin(r, g, b) || isHair(r, g, b) || isMagenta(r, g, b)) return false;
      if (r > 130 && g < 90 && b < 90) return false;
      if (isNavy(r, g, b) && yn > 0.58) return false;
      return isWhite(r, g, b) || isGray(r, g, b) || isPink(r, g, b) || isBlue(r, g, b) || isCream(r, g, b) || (isDark(r, g, b) && yn < 0.58);
    };
  if (kind === "bot")
    return (r, g, b, yn) => {
      if (yn < 0.56 || yn > 0.82) return false;
      if (isSkin(r, g, b) || isHair(r, g, b) || isMagenta(r, g, b) || isGray(r, g, b) || isPink(r, g, b) || isWhite(r, g, b)) return false;
      if (r > 140 && g < 90 && b < 90) return false;
      return isNavy(r, g, b) || isDark(r, g, b) || isBrown(r, g, b) || isBlue(r, g, b);
    };
  return () => false;
}

function growFn(kind) {
  const seed = seedFn(kind);
  return (r, g, b, yn, xn) => {
    if (isMagenta(r, g, b) || isSkin(r, g, b)) return false;
    if (seed(r, g, b, yn)) return true;
    if (kind === "hair") return yn < 0.46 && isOutline(r, g, b) && !inFace(xn, yn);
    if (kind === "top") return yn > 0.36 && yn < 0.64 && isOutline(r, g, b) && !inFace(xn, yn);
    if (kind === "bot") return yn > 0.56 && yn < 0.83 && isOutline(r, g, b);
    return false;
  };
}

function scaleTo(raw, tw, th) {
  const out = Buffer.alloc(tw * th * 4);
  for (let y = 0; y < th; y++) {
    const sy = Math.min(raw.height - 1, Math.round((y / th) * raw.height));
    for (let x = 0; x < tw; x++) {
      const sx = Math.min(raw.width - 1, Math.round((x / tw) * raw.width));
      const si = (sy * raw.width + sx) * 4;
      const di = (y * tw + x) * 4;
      out[di] = raw.data[si];
      out[di + 1] = raw.data[si + 1];
      out[di + 2] = raw.data[si + 2];
      out[di + 3] = 255;
    }
  }
  return { width: tw, height: th, data: out };
}

function flood(img, kind) {
  const w = img.width;
  const h = img.height;
  const seed = seedFn(kind);
  const grow = growFn(kind);
  const mark = Buffer.alloc(w * h);
  const stack = [];
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      if (seed(img.data[i], img.data[i + 1], img.data[i + 2], y / h)) {
        mark[y * w + x] = 1;
        stack.push(y * w + x);
      }
    }
  }
  while (stack.length) {
    const i = stack.pop();
    const x = i % w;
    const y = (i / w) | 0;
    for (const j of [i - 1, i + 1, i - w, i + w]) {
      if (j < 0 || j >= w * h) continue;
      if (mark[j]) continue;
      const nx = j % w;
      const ny = (j / w) | 0;
      if (Math.abs(nx - x) + Math.abs(ny - y) !== 1) continue;
      const p = j * 4;
      if (!grow(img.data[p], img.data[p + 1], img.data[p + 2], ny / h, nx / w)) continue;
      mark[j] = 1;
      stack.push(j);
    }
  }
  const data = Buffer.alloc(w * h * 4);
  for (let i = 0; i < data.length; i += 4) {
    data[i] = 255;
    data[i + 1] = 0;
    data[i + 2] = 255;
    data[i + 3] = 255;
  }
  let n = 0;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (!mark[y * w + x]) continue;
      const si = (y * w + x) * 4;
      data[si] = img.data[si];
      data[si + 1] = img.data[si + 1];
      data[si + 2] = img.data[si + 2];
      data[si + 3] = 255;
      n++;
    }
  }
  return sanitize({ width: w, height: h, data, n }, kind);
}

function sanitize(img, kind) {
  let n = 0;
  for (let y = 0; y < img.height; y++) {
    const yn = y / img.height;
    for (let x = 0; x < img.width; x++) {
      const i = (y * img.width + x) * 4;
      const r = img.data[i],
        g = img.data[i + 1],
        b = img.data[i + 2];
      if (r > 250 && g < 8 && b > 250) continue;
      const xn = x / img.width;
      let drop = false;
      if (kind === "hair" && (yn > 0.46 || inFace(xn, yn))) drop = true;
      if (kind === "top" && (yn < 0.36 || yn > 0.64 || inFace(xn, yn))) drop = true;
      if (kind === "bot" && (yn < 0.56 || yn > 0.84)) drop = true;
      if (drop) {
        img.data[i] = 255;
        img.data[i + 1] = 0;
        img.data[i + 2] = 255;
        img.data[i + 3] = 255;
      } else n++;
    }
  }
  img.n = n;
  return img;
}

function flipH(img) {
  const data = Buffer.alloc(img.data.length);
  for (let i = 0; i < data.length; i += 4) {
    data[i] = 255;
    data[i + 1] = 0;
    data[i + 2] = 255;
    data[i + 3] = 255;
  }
  for (let y = 0; y < img.height; y++) {
    for (let x = 0; x < img.width; x++) {
      const si = (y * img.width + (img.width - 1 - x)) * 4;
      const di = (y * img.width + x) * 4;
      data[di] = img.data[si];
      data[di + 1] = img.data[si + 1];
      data[di + 2] = img.data[si + 2];
      data[di + 3] = img.data[si + 3];
    }
  }
  return { width: img.width, height: img.height, data };
}

function save(name, img) {
  const png = new PNG({ width: img.width, height: img.height });
  png.data = Buffer.from(img.data);
  fs.writeFileSync(path.join(DIR, name + ".png"), PNG.sync.write(png, { colorType: 6, deflateLevel: 9 }));
}

for (const job of JOBS) {
  const f = path.join(SRC, job.file);
  if (!fs.existsSync(f)) {
    console.log("missing", job.file);
    continue;
  }
  const raw = jpeg.decode(fs.readFileSync(f), { useTArray: true, maxMemoryUsageInMB: 256 });
  const scaled = scaleTo(raw, W, H);
  const layer = flood(scaled, job.kind);
  save(`${job.g}-${job.kind}-${job.name}-se-layer`, layer);
  save(`${job.g}-${job.kind}-${job.name}-ne-layer`, flipH(layer));
  console.log(`${job.g}-${job.kind}-${job.name}`, layer.n);
}
console.log("done");
