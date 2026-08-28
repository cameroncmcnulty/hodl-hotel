/**
 * Convert generated hotel furniture JPGs to keyed PNGs and build color variants.
 */
const fs = require("fs");
const path = require("path");
const jpeg = require("jpeg-js");
const { PNG } = require("pngjs");

const SRC = path.join(
  process.env.USERPROFILE || process.env.HOME,
  ".grok",
  "sessions",
  "C%3A%5CUsers%5Ccamer",
  "01a0318d-2002-7f90-a78b-d6097a8442c5",
  "images"
);
const DEST = path.join(__dirname, "..", "public", "art", "furn");

const MAP = {
  "285.jpg": "hq_fountain",
  "286.jpg": "hq_desk",
  "287.jpg": "hq_urn",
  "288.jpg": "hq_chandelier",
  "289.jpg": "hq_lounger",
  "290.jpg": "hq_palm",
  "291.jpg": "hq_dj",
  "292.jpg": "hq_umb_pink",
  "293.jpg": "hq_sofa",
  "294.jpg": "hq_cork",
  "295.jpg": "hq_bean",
  "296.jpg": "hq_disco",
  "297.jpg": "hq_speakers",
  "298.jpg": "hq_cab_pink",
  "299.jpg": "hq_table",
  "300.jpg": "hq_prize",
  "301.jpg": "hq_ottoman",
  "302.jpg": "hq_stool",
  "303.jpg": "hq_club_table",
  "304.jpg": "hq_lamp",
};

function isKey(r, g, b) {
  if (r > 200 && b > 170 && g < 90) return true;
  if (r > 220 && g < 70 && b > 140) return true;
  const mag = Math.hypot(r - 255, g - 0, b - 255);
  return mag < 140 && g < 110;
}

function decodeJpg(file) {
  const raw = jpeg.decode(fs.readFileSync(file), { useTArray: true, maxMemoryUsageInMB: 256 });
  return { width: raw.width, height: raw.height, data: raw.data };
}

function toPng(img) {
  const png = new PNG({ width: img.width, height: img.height });
  for (let i = 0; i < img.data.length; i += 4) {
    const r = img.data[i],
      g = img.data[i + 1],
      b = img.data[i + 2];
    if (isKey(r, g, b)) {
      png.data[i] = 255;
      png.data[i + 1] = 0;
      png.data[i + 2] = 255;
      png.data[i + 3] = 255;
    } else {
      png.data[i] = r;
      png.data[i + 1] = g;
      png.data[i + 2] = b;
      png.data[i + 3] = 255;
    }
  }
  return png;
}

function savePng(name, png) {
  fs.writeFileSync(path.join(DEST, name + ".png"), PNG.sync.write(png, { colorType: 6, deflateLevel: 9 }));
  console.log("wrote", name, png.width, png.height);
}

function clonePng(png) {
  const out = new PNG({ width: png.width, height: png.height });
  out.data = Buffer.from(png.data);
  return out;
}

function hueShift(png, deg, sat = 1) {
  const out = clonePng(png);
  const d = out.data;
  const rad = (deg * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  for (let i = 0; i < d.length; i += 4) {
    if (d[i] > 250 && d[i + 1] < 8 && d[i + 2] > 250) continue;
    let r = d[i] / 255,
      g = d[i + 1] / 255,
      b = d[i + 2] / 255;
    const mx = Math.max(r, g, b),
      mn = Math.min(r, g, b);
    if (mx - mn < 0.08) continue;
    const nr = r * (0.299 + 0.701 * cos + 0.168 * sin) + g * (0.587 - 0.587 * cos + 0.33 * sin) + b * (0.114 - 0.114 * cos - 0.497 * sin);
    const ng = r * (0.299 - 0.299 * cos - 0.328 * sin) + g * (0.587 + 0.413 * cos + 0.035 * sin) + b * (0.114 - 0.114 * cos + 0.292 * sin);
    const nb = r * (0.299 - 0.3 * cos + 1.25 * sin) + g * (0.587 - 0.588 * cos - 1.05 * sin) + b * (0.114 + 0.886 * cos - 0.203 * sin);
    d[i] = Math.max(0, Math.min(255, Math.round(nr * 255 * sat)));
    d[i + 1] = Math.max(0, Math.min(255, Math.round(ng * 255 * sat)));
    d[i + 2] = Math.max(0, Math.min(255, Math.round(nb * 255 * sat)));
  }
  return out;
}

function tintNonKey(png, tr, tg, tb, mix = 0.55) {
  const out = clonePng(png);
  const d = out.data;
  for (let i = 0; i < d.length; i += 4) {
    if (d[i] > 250 && d[i + 1] < 8 && d[i + 2] > 250) continue;
    const r = d[i],
      g = d[i + 1],
      b = d[i + 2];
    const mx = Math.max(r, g, b),
      mn = Math.min(r, g, b);
    if (mx - mn < 18 && mx > 200) continue;
    d[i] = Math.round(r * (1 - mix) + tr * mix);
    d[i + 1] = Math.round(g * (1 - mix) + tg * mix);
    d[i + 2] = Math.round(b * (1 - mix) + tb * mix);
  }
  return out;
}

const pngs = {};
for (const [file, name] of Object.entries(MAP)) {
  const full = path.join(SRC, file);
  if (!fs.existsSync(full)) {
    console.log("missing", file);
    continue;
  }
  const png = toPng(decodeJpg(full));
  savePng(name, png);
  pngs[name] = png;
}

if (pngs.hq_cab_pink) {
  savePng("hq_cab_blue", hueShift(pngs.hq_cab_pink, 200));
  savePng("hq_cab_green", hueShift(pngs.hq_cab_pink, 110));
  savePng("hq_cab_purple", hueShift(pngs.hq_cab_pink, 40));
}
if (pngs.hq_umb_pink) {
  savePng("hq_umb_blue", tintNonKey(pngs.hq_umb_pink, 70, 180, 230, 0.45));
  savePng("hq_umb_yellow", tintNonKey(pngs.hq_umb_pink, 245, 210, 70, 0.5));
}
if (pngs.hq_lounger) {
  savePng("hq_lounger_orange", tintNonKey(pngs.hq_lounger, 240, 120, 40, 0.5));
}
if (pngs.hq_bean) {
  savePng("hq_bean_gold", tintNonKey(pngs.hq_bean, 230, 180, 50, 0.5));
}
if (pngs.hq_ottoman) {
  savePng("hq_ottoman_teal", tintNonKey(pngs.hq_ottoman, 40, 160, 170, 0.5));
  savePng("hq_ottoman_coral", tintNonKey(pngs.hq_ottoman, 230, 110, 120, 0.5));
}

const extra = path.join(DEST, "plant_monstera.png");
if (fs.existsSync(extra)) {
  fs.copyFileSync(extra, path.join(DEST, "hq_monstera.png"));
  console.log("copied hq_monstera");
}

console.log("done");
