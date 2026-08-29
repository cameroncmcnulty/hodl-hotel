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
  { file: "313.jpg", g: "m", kind: "hair", name: "spike", gender: "m" },
  { file: "314.jpg", g: "m", kind: "hair", name: "buzz", gender: "m" },
  { file: "323.jpg", g: "m", kind: "hair", name: "mohawk", gender: "m" },
  { file: "316.jpg", g: "m", kind: "top", name: "tee", gender: "m" },
  { file: "321.jpg", g: "m", kind: "top", name: "jacket", gender: "m" },
  { file: "312.jpg", g: "m", kind: "bot", name: "shorts", gender: "m" },
  { file: "320.jpg", g: "m", kind: "shoe", name: "boots", gender: "m" },
  { file: "311.jpg", g: "f", kind: "hair", name: "bob", gender: "f" },
  { file: "319.jpg", g: "f", kind: "hair", name: "long", gender: "f" },
  { file: "315.jpg", g: "f", kind: "top", name: "cami", gender: "f" },
  { file: "322.jpg", g: "f", kind: "top", name: "cardi", gender: "f" },
  { file: "317.jpg", g: "f", kind: "bot", name: "shorts", gender: "f" },
  { file: "318.jpg", g: "f", kind: "bot", name: "pants", gender: "f" },
];

function isBg(r, g, b) {
  if (r > 190 && b > 150 && g < 110) return true;
  return false;
}
function isOutline(r, g, b) {
  return r < 18 && g < 18 && b < 18;
}
function isSkin(r, g, b) {
  return r > 220 && g > 145 && g < 220 && b > 100 && b < 190 && r - b > 40 && r > g;
}
function isHair(r, g, b) {
  if (r > 160) return false;
  return r > 55 && r < 160 && g > 25 && g < 100 && b < 60 && r > g + 10;
}
function isGray(r, g, b) {
  const mx = Math.max(r, g, b),
    mn = Math.min(r, g, b);
  return mx - mn < 22 && mx > 90 && mx < 190;
}
function isPink(r, g, b) {
  return r > 200 && g > 70 && g < 190 && b > 120 && r - g > 40;
}
function isNavy(r, g, b) {
  return b > r + 15 && b > g && r < 80 && g < 90 && b < 170;
}
function isDark(r, g, b) {
  return r < 55 && g < 55 && b < 55 && !isOutline(r, g, b);
}
function isWhite(r, g, b) {
  return r > 200 && g > 200 && b > 200 && r < 252;
}
function isBrown(r, g, b) {
  return r > 80 && r < 180 && g > 40 && g < 120 && b < 80 && r > g && g > b;
}

function want(kind, r, g, b, yn, gender) {
  if (isBg(r, g, b)) return false;
  if (kind === "hair") return (isHair(r, g, b) || (isOutline(r, g, b) && yn < 0.42)) && yn < 0.52;
  if (kind === "top") {
    if (yn < 0.34 || yn > 0.7) return false;
    if (isSkin(r, g, b) || isHair(r, g, b)) return false;
    return true;
  }
  if (kind === "bot") {
    if (yn < 0.56 || yn > 0.84) return false;
    if (isSkin(r, g, b) || isHair(r, g, b) || isGray(r, g, b) || isPink(r, g, b)) return false;
    if (r > 150 && g < 90 && b < 90) return false;
    return true;
  }
  if (kind === "shoe") {
    if (yn < 0.72) return false;
    if (isSkin(r, g, b) || isHair(r, g, b)) return false;
    return true;
  }
  return false;
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

function extractLayer(img, kind, gender) {
  const out = Buffer.alloc(img.width * img.height * 4);
  for (let i = 0; i < out.length; i += 4) {
    out[i] = 255;
    out[i + 1] = 0;
    out[i + 2] = 255;
    out[i + 3] = 255;
  }
  let n = 0;
  for (let y = 0; y < img.height; y++) {
    const yn = y / img.height;
    for (let x = 0; x < img.width; x++) {
      const i = (y * img.width + x) * 4;
      const r = img.data[i],
        g = img.data[i + 1],
        b = img.data[i + 2];
      if (!want(kind, r, g, b, yn, gender)) continue;
      out[i] = r;
      out[i + 1] = g;
      out[i + 2] = b;
      out[i + 3] = 255;
      n++;
    }
  }
  return { width: img.width, height: img.height, data: out, n };
}

function flipH(img) {
  const out = Buffer.alloc(img.data.length);
  for (let i = 0; i < out.length; i += 4) {
    out[i] = 255;
    out[i + 1] = 0;
    out[i + 2] = 255;
    out[i + 3] = 255;
  }
  for (let y = 0; y < img.height; y++) {
    for (let x = 0; x < img.width; x++) {
      const si = (y * img.width + (img.width - 1 - x)) * 4;
      const di = (y * img.width + x) * 4;
      out[di] = img.data[si];
      out[di + 1] = img.data[si + 1];
      out[di + 2] = img.data[si + 2];
      out[di + 3] = img.data[si + 3];
    }
  }
  return { width: img.width, height: img.height, data: out };
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
  console.log(job.file, raw.width, raw.height);
  const scaled = scaleTo(raw, W, H);
  const layer = extractLayer(scaled, job.kind, job.gender);
  const id = `${job.g}-${job.kind}-${job.name}-se-layer`;
  save(id, layer);
  save(`${job.g}-${job.kind}-${job.name}-ne-layer`, flipH(layer));
  console.log(id, layer.n);
}
console.log("done");
