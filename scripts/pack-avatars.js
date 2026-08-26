/**
 * Magenta-key HQ avatar JPEGs into uniform transparent PNGs.
 */
const fs = require("fs");
const path = require("path");
const jpeg = require("jpeg-js");
const { PNG } = require("pngjs");

const SRC = path.join(
  process.env.USERPROFILE || "C:\\Users\\camer",
  ".grok",
  "sessions",
  "C%3A%5CUsers%5Ccamer",
  "01a0318d-2002-7f90-a78b-d6097a8442c5",
  "images"
);
const OUT = path.join(__dirname, "..", "public", "art", "avatars");
const CW = 384;
const CH = 576;
const FOOT = 16;

const MAP = {
  "84.jpg": "m-se-idle",
  "85.jpg": "m-ne-idle",
  "87.jpg": "m-se-walk0",
  "102.jpg": "m-se-walk1",
  "95.jpg": "m-ne-walk0",
  "97.jpg": "m-ne-walk1",
  "86.jpg": "m-se-sit",
  "83.jpg": "f-se-idle",
  "88.jpg": "f-ne-idle",
  "94.jpg": "f-se-walk0",
  "103.jpg": "f-se-walk1",
  "106.jpg": "f-ne-walk0",
  "89.jpg": "f-se-sit",
  "98.jpg": "m-hair-buzz-se",
  "91.jpg": "m-hair-bob-se",
  "93.jpg": "m-hair-pony-se",
  "104.jpg": "m-hair-bun-se",
  "99.jpg": "m-hair-mohawk-se",
  "105.jpg": "m-hair-curl-se",
  "121.jpg": "m-hair-long-se",
  "107.jpg": "f-hair-buzz-se",
  "113.jpg": "f-hair-bob-se",
  "109.jpg": "f-hair-pony-se",
  "108.jpg": "f-hair-bun-se",
  "114.jpg": "f-hair-mohawk-se",
  "112.jpg": "f-hair-curl-se",
  "100.jpg": "m-top-tee-se",
  "101.jpg": "m-top-jacket-se",
  "118.jpg": "m-top-sweater-se",
  "115.jpg": "m-top-tank-se",
  "111.jpg": "f-top-tee-se",
  "119.jpg": "f-top-jacket-se",
  "117.jpg": "f-top-sweater-se",
  "120.jpg": "m-bot-shorts-se",
  "116.jpg": "m-bot-cargo-se",
  "122.jpg": "f-bot-shorts-se",
  "110.jpg": "f-bot-skirt-se",
  "130.jpg": "m-hair-bob-ne",
  "127.jpg": "m-hair-pony-ne",
  "128.jpg": "m-hair-bun-ne",
  "125.jpg": "m-hair-mohawk-ne",
  "124.jpg": "m-hair-curl-ne",
  "133.jpg": "m-hair-long-ne",
  "123.jpg": "f-hair-bob-ne",
  "132.jpg": "f-hair-pony-ne",
  "136.jpg": "f-hair-bun-ne",
  "137.jpg": "f-hair-mohawk-ne",
  "131.jpg": "f-hair-curl-ne",
  "129.jpg": "f-top-tank-se",
  "126.jpg": "f-bot-dress-se",
  "134.jpg": "m-top-shirt-se",
  "135.jpg": "m-top-tee-ne",
  "138.jpg": "m-top-jacket-ne",
  "139.jpg": "m-hair-undercut-se",
  "144.jpg": "m-hair-crop-se",
  "141.jpg": "m-hair-side-se",
  "146.jpg": "m-hair-undercut-ne",
  "145.jpg": "f-hair-bangs-se",
  "143.jpg": "f-hair-twin-se",
  "142.jpg": "f-hair-twin-ne",
  "140.jpg": "f-top-blouse-se",
  "148.jpg": "f-top-crop-se",
  "151.jpg": "f-top-cardi-se",
  "154.jpg": "f-top-cami-se",
  "147.jpg": "f-top-wrap-se",
  "150.jpg": "f-bot-leggings-se",
  "152.jpg": "f-bot-pleat-se",
  "153.jpg": "m-bot-joggers-se",
  "149.jpg": "m-bot-jeans-se",
};

function isMagenta(r, g, b) {
  const dist = Math.hypot(r - 255, g - 0, b - 255);
  if (dist < 155) return true;
  if (r > 155 && b > 150 && g < 145 && Math.abs(r - b) < 95) return true;
  if (r > 190 && b > 140 && g < 175 && r + b > g * 2.15) return true;
  if (r > 210 && b > 80 && g < 90 && r + b > 300) return true;
  return false;
}

function keyJpeg(buf) {
  const decoded = jpeg.decode(buf, { maxMemoryUsageInMB: 512, useTArray: true });
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
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const i = y * w + x;
      if (keyed[i]) continue;
      let n = 0;
      if (keyed[i - 1]) n++;
      if (keyed[i + 1]) n++;
      if (keyed[i - w]) n++;
      if (keyed[i + w]) n++;
      if (n >= 2) {
        const o = i * 4;
        if (isMagenta(out[o], out[o + 1], out[o + 2]) || (out[o] > 160 && out[o + 2] > 140 && out[o + 1] < 190)) {
          out[o + 3] = 0;
        }
      }
    }
  }
  for (let i = 0; i < w * h; i++) {
    const o = i * 4;
    if (out[o + 3] > 0 && isMagenta(out[o], out[o + 1], out[o + 2])) out[o + 3] = 0;
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
  const pad = 4;
  minX = Math.max(0, minX - pad);
  minY = Math.max(0, minY - pad);
  maxX = Math.min(w - 1, maxX + pad);
  maxY = Math.min(h - 1, maxY + pad);
  const tw = maxX - minX + 1;
  const th = maxY - minY + 1;
  const trimmed = Buffer.alloc(tw * th * 4);
  for (let y = 0; y < th; y++) {
    out.copy(trimmed, y * tw * 4, ((minY + y) * w + minX) * 4, ((minY + y) * w + minX) * 4 + tw * 4);
  }
  return { width: tw, height: th, data: trimmed };
}

function nnScale(img, nw, nh) {
  const data = Buffer.alloc(nw * nh * 4);
  for (let y = 0; y < nh; y++) {
    const sy = Math.min(img.height - 1, Math.floor((y * img.height) / nh));
    for (let x = 0; x < nw; x++) {
      const sx = Math.min(img.width - 1, Math.floor((x * img.width) / nw));
      img.data.copy(data, (y * nw + x) * 4, (sy * img.width + sx) * 4, (sy * img.width + sx) * 4 + 4);
    }
  }
  return { width: nw, height: nh, data };
}

function placeCanvas(img) {
  const maxH = CH - FOOT - 12;
  const maxW = CW - 8;
  let nw = img.width;
  let nh = img.height;
  const s = Math.min(maxH / nh, maxW / nw, 1);
  nw = Math.max(1, Math.round(nw * s));
  nh = Math.max(1, Math.round(nh * s));
  const scaled = nw === img.width && nh === img.height ? img : nnScale(img, nw, nh);
  const canvas = Buffer.alloc(CW * CH * 4);
  const ox = Math.round((CW - scaled.width) / 2);
  const oy = CH - FOOT - scaled.height;
  for (let y = 0; y < scaled.height; y++) {
    const dy = oy + y;
    if (dy < 0 || dy >= CH) continue;
    for (let x = 0; x < scaled.width; x++) {
      const dx = ox + x;
      if (dx < 0 || dx >= CW) continue;
      const si = (y * scaled.width + x) * 4;
      if (scaled.data[si + 3] < 8) continue;
      scaled.data.copy(canvas, (dy * CW + dx) * 4, si, si + 4);
    }
  }
  return { width: CW, height: CH, data: canvas };
}

function writePng(file, img) {
  const png = new PNG({ width: img.width, height: img.height });
  png.data = Buffer.from(img.data);
  fs.writeFileSync(file, PNG.sync.write(png, { colorType: 6, deflateLevel: 9 }));
}

fs.mkdirSync(OUT, { recursive: true });
let n = 0;
for (const [srcName, destName] of Object.entries(MAP)) {
  const src = path.join(SRC, srcName);
  if (!fs.existsSync(src)) {
    console.log("MISSING", srcName);
    continue;
  }
  const keyed = keyJpeg(fs.readFileSync(src));
  const placed = placeCanvas(keyed);
  const dest = path.join(OUT, destName + ".png");
  writePng(dest, placed);
  n++;
  console.log(srcName, "->", destName, placed.width + "x" + placed.height);
}

const copies = [
  ["f-se-idle.png", "f-hair-long-se.png"],
  ["f-ne-idle.png", "f-ne-walk1.png"],
  ["f-ne-idle.png", "f-hair-long-ne.png"],
];
for (const [a, b] of copies) {
  const from = path.join(OUT, a);
  const to = path.join(OUT, b);
  if (fs.existsSync(from)) {
    fs.copyFileSync(from, to);
    console.log("copy", a, "->", b);
  }
}

function isHairPx(r, g, b, y, h) {
  if (r > 140 && g > 90 && b > 40 && r > g + 10 && g > b - 10) return false;
  if (r > 210 && g > 210 && b > 210) return false;
  const L = r * 0.32 + g * 0.5 + b * 0.18;
  if (L < 16) return false;
  const head = y < h * 0.5;
  if (g > r + 4 && r < 145 && g > 22 && g + b > r * 1.7) {
    if (head) return true;
    return g > r + 16 && g > 55;
  }
  return false;
}

function extractHairLayer(file, destName) {
  const srcPath = path.join(OUT, file);
  if (!fs.existsSync(srcPath)) return;
  const png = PNG.sync.read(fs.readFileSync(srcPath));
  const w = png.width;
  const h = png.height;
  const layer = Buffer.alloc(w * h * 4);
  const cutoff = h;
  for (let y = 0; y < cutoff; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      const a = png.data[i + 3];
      if (a < 12) continue;
      const r = png.data[i],
        g = png.data[i + 1],
        b = png.data[i + 2];
      if (!isHairPx(r, g, b, y, h)) continue;
      png.data.copy(layer, i, i, i + 4);
    }
  }
  writePng(path.join(OUT, destName), { width: w, height: h, data: layer });
  console.log("hair layer", destName);
}

const hairFull = [
  "m-se-idle.png",
  "m-ne-idle.png",
  "m-hair-buzz-se.png",
  "m-hair-bob-se.png",
  "m-hair-pony-se.png",
  "m-hair-bun-se.png",
  "m-hair-mohawk-se.png",
  "m-hair-curl-se.png",
  "m-hair-long-se.png",
  "m-hair-bob-ne.png",
  "m-hair-pony-ne.png",
  "m-hair-bun-ne.png",
  "m-hair-mohawk-ne.png",
  "m-hair-curl-ne.png",
  "m-hair-long-ne.png",
  "f-se-idle.png",
  "f-ne-idle.png",
  "f-hair-buzz-se.png",
  "f-hair-bob-se.png",
  "f-hair-pony-se.png",
  "f-hair-bun-se.png",
  "f-hair-mohawk-se.png",
  "f-hair-curl-se.png",
  "f-hair-long-se.png",
  "f-hair-bob-ne.png",
  "f-hair-pony-ne.png",
  "f-hair-bun-ne.png",
  "f-hair-mohawk-ne.png",
  "f-hair-curl-ne.png",
  "f-hair-long-ne.png",
  "m-hair-undercut-se.png",
  "m-hair-crop-se.png",
  "m-hair-side-se.png",
  "m-hair-undercut-ne.png",
  "f-hair-bangs-se.png",
  "f-hair-twin-se.png",
  "f-hair-twin-ne.png",
];
for (const f of hairFull) {
  extractHairLayer(f, f.replace(".png", "-layer.png"));
}

const pngs = fs.readdirSync(OUT).filter((f) => f.endsWith(".png"));
fs.writeFileSync(path.join(OUT, "manifest.json"), JSON.stringify(pngs, null, 2));
console.log("packed", n, "manifest", pngs.length);
