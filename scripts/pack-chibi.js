/** Pack Imagine full-body variants onto one grid with a shared pixel scale. */
const fs = require("fs");
const path = require("path");
const jpeg = require("jpeg-js");
const { PNG } = require("pngjs");

const SRC = path.join(
  process.env.USERPROFILE || process.env.HOME,
  ".grok/sessions/C%3A%5CUsers%5Ccamer/01a0318d-2002-7f90-a78b-d6097a8442c5/images"
);
const OUT = path.join(__dirname, "..", "public", "art", "chibi");
const TEST = path.join(__dirname, "chibi-tests");
fs.mkdirSync(OUT, { recursive: true });
fs.mkdirSync(TEST, { recursive: true });

const W = 96;
const H = 176;
const SAMPLE = 6;

const MAP = {
  "m-hair-messy": "325.jpg",
  "m-hair-afro": "327.jpg",
  "m-hair-side": "332.jpg",
  "m-hair-undercut": "334.jpg",
  "m-hair-spikes": "335.jpg",
  "m-hair-mohawk": "331.jpg",
  "m-top-hoodie": "325.jpg",
  "m-top-tee": "329.jpg",
  "m-top-jacket": "337.jpg",
  "m-top-tank": "340.jpg",
  "m-top-sweater": "336.jpg",
  "m-bot-pants": "325.jpg",
  "m-bot-shorts": "346.jpg",
  "m-bot-jeans": "345.jpg",
  "m-bot-cargo": "343.jpg",
  "m-bot-joggers": "347.jpg",
  "m-shoe-sneakers": "325.jpg",
  "m-shoe-hightops": "352.jpg",
  "m-shoe-boots": "348.jpg",
  "m-shoe-skate": "355.jpg",
  "m-shoe-slides": "357.jpg",
  "f-hair-pony": "324.jpg",
  "f-hair-bob": "326.jpg",
  "f-hair-waves": "333.jpg",
  "f-hair-long": "330.jpg",
  "f-hair-pigtails": "338.jpg",
  "f-hair-bun": "339.jpg",
  "f-top-hoodie": "324.jpg",
  "f-top-tee": "328.jpg",
  "f-top-jacket": "341.jpg",
  "f-top-tank": "342.jpg",
  "f-top-sweater": "344.jpg",
  "f-bot-skirt": "324.jpg",
  "f-bot-pants": "353.jpg",
  "f-bot-shorts": "350.jpg",
  "f-bot-jeans": "351.jpg",
  "f-bot-pleat": "349.jpg",
  "f-shoe-sneakers": "324.jpg",
  "f-shoe-hightops": "358.jpg",
  "f-shoe-boots": "356.jpg",
  "f-shoe-skate": "354.jpg",
  "f-shoe-flats": "359.jpg",
};

function isMag(r, g, b) {
  return r > 180 && b > 140 && g < 130 && r + b - g > 280;
}

function decode(file) {
  const raw = jpeg.decode(fs.readFileSync(path.join(SRC, file)), { useTArray: true });
  return { w: raw.width, h: raw.height, d: raw.data };
}

function bbox(img) {
  let x0 = img.w,
    y0 = img.h,
    x1 = 0,
    y1 = 0;
  for (let y = 0; y < img.h; y++) {
    for (let x = 0; x < img.w; x++) {
      const i = (y * img.w + x) * 4;
      if (isMag(img.d[i], img.d[i + 1], img.d[i + 2])) continue;
      if (img.d[i + 3] < 8) continue;
      if (x < x0) x0 = x;
      if (y < y0) y0 = y;
      if (x > x1) x1 = x;
      if (y > y1) y1 = y;
    }
  }
  return { x0, y0, x1, y1, bw: x1 - x0 + 1, bh: y1 - y0 + 1 };
}

function blank() {
  return { w: W, h: H, d: Buffer.alloc(W * H * 4) };
}

function pack(img) {
  const b = bbox(img);
  const dw = Math.floor(b.bw / SAMPLE);
  const dh = Math.floor(b.bh / SAMPLE);
  const ox = Math.floor((W - dw) / 2);
  const oy = H - dh - 4;
  const out = blank();
  for (let y = 0; y < dh; y++) {
    for (let x = 0; x < dw; x++) {
      const dx = ox + x;
      const dy = oy + y;
      if (dx < 0 || dy < 0 || dx >= W || dy >= H) continue;
      const sx = b.x0 + x * SAMPLE;
      const sy = b.y0 + y * SAMPLE;
      const i = (sy * img.w + sx) * 4;
      const r = img.d[i],
        g = img.d[i + 1],
        bl = img.d[i + 2];
      if (isMag(r, g, bl)) continue;
      const o = (dy * W + dx) * 4;
      out.d[o] = r;
      out.d[o + 1] = g;
      out.d[o + 2] = bl;
      out.d[o + 3] = 255;
    }
  }
  return out;
}

function savePng(file, img, dir = OUT) {
  const png = new PNG({ width: img.w, height: img.h });
  png.data = Buffer.from(img.d);
  fs.writeFileSync(path.join(dir, file), PNG.sync.write(png, { colorType: 6 }));
}

const packed = {};
for (const [name, file] of Object.entries(MAP)) {
  packed[name] = pack(decode(file));
  savePng(name + ".png", packed[name]);
  console.log("packed", name, file);
}

console.log("wrote", OUT);
