/** Fail if leftover pale skin, grey hoodie holes, or off-center/clipped heads. */
const fs = require("fs");
const path = require("path");
const { PNG } = require("pngjs");
const ts = require("typescript");

const ROOT = path.join(__dirname, "..");
const DIR = path.join(ROOT, "public", "art", "chibi");

function loadTs(rel, cache = new Map()) {
  if (cache.has(rel)) return cache.get(rel);
  const abs = path.join(ROOT, rel);
  const src = fs.readFileSync(abs, "utf8");
  const out = ts.transpileModule(src, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true, isolatedModules: true },
    fileName: abs,
  });
  const module = { exports: {} };
  const requireTs = (id) => {
    if (id.startsWith("./") || id.startsWith("../")) {
      let n = path.posix.normalize(path.posix.join(path.posix.dirname(rel.replace(/\\/g, "/")), id));
      if (!n.endsWith(".ts")) n += ".ts";
      if (n.includes("types.ts")) return {};
      return loadTs(n.replace(/\//g, path.sep), cache);
    }
    return require(id);
  };
  const fn = new Function("exports", "require", "module", "__filename", "__dirname", out.outputText);
  fn(module.exports, requireTs, module, abs, path.dirname(abs));
  cache.set(rel, module.exports);
  return module.exports;
}

const look = loadTs(path.join("src", "lib", "game", "lookDraw.ts"));
const pix = loadTs(path.join("src", "lib", "game", "pix.ts"));
const { paintLook, clampFigure, setChibi, pixFromRgba, allChibiIds, LOOK_W, LOOK_H } = { ...look, ...pix };

for (const id of allChibiIds()) {
  const png = PNG.sync.read(fs.readFileSync(path.join(DIR, id + ".png")));
  setChibi(id, pixFromRgba(png.width, png.height, png.data));
}

function fig(patch) {
  return clampFigure({
    gender: 0, skin: 1, hair: 0, hairColor: 0, top: 0, bottom: 0, shoes: 0,
    topCut: 0, botCut: 0, shoeCut: 0, acc: 0, ...patch,
  });
}

function isInk(r, g, b) {
  return r + g + b < 40;
}
function isPale(r, g, b) {
  return r > 200 && g > 160 && b > 130 && r - b > 30 && r - g < 70;
}

function faceStats(p) {
  let sx = 0, sy = 0, n = 0, pale = 0, topY = 999, left = 999, right = 0;
  for (let y = 0; y < 100; y++) {
    for (let x = 0; x < p.w; x++) {
      if (p.a(x, y) < 16) continue;
      if (y < topY) topY = y;
      if (x < left) left = x;
      if (x > right) right = x;
      const i = (y * p.w + x) * 4;
      const r = p.d[i], g = p.d[i + 1], b = p.d[i + 2];
      if (y >= 48 && y <= 88 && x >= 28 && x <= 68 && r > 90 && r - b > 20 && r >= g && !isInk(r, g, b)) {
        sx += x;
        sy += y;
        n++;
        if (isPale(r, g, b)) pale++;
      }
    }
  }
  return {
    faceX: n ? sx / n : -1,
    faceY: n ? sy / n : -1,
    pale,
    topY,
    left,
    right,
    width: right - left + 1,
  };
}

function torsoGrey(p) {
  let grey = 0, fill = 0;
  for (let y = 90; y < 124; y++) {
    for (let x = 28; x < 68; x++) {
      if (p.a(x, y) < 16) continue;
      const i = (y * p.w + x) * 4;
      const r = p.d[i], g = p.d[i + 1], b = p.d[i + 2];
      if (isInk(r, g, b)) continue;
      fill++;
      const max = Math.max(r, g, b), min = Math.min(r, g, b);
      if (max - min < 18 && r > 70 && r < 170) grey++;
    }
  }
  return { grey, fill, pct: fill ? Math.round((100 * grey) / fill) : 0 };
}

const fails = [];
function check(label, ok, detail) {
  if (!ok) fails.push(label + " " + (detail || ""));
  else console.log("ok", label, detail || "");
}

for (const gender of [0, 1]) {
  for (let hair = 0; hair < 6; hair++) {
    const p = paintLook(fig({ gender, hair, skin: 5, hairColor: 3, top: 1, bottom: 1, shoes: 1 }));
    const s = faceStats(p);
    check(
      (gender ? "girl" : "boy") + " hair " + hair + " faceX",
      s.faceX >= 42 && s.faceX <= 54,
      "x=" + s.faceX.toFixed(1) + " y=" + s.faceY.toFixed(1) + " top=" + s.topY,
    );
    check((gender ? "girl" : "boy") + " hair " + hair + " not clipped", s.topY < 36, "topY=" + s.topY);
    check((gender ? "girl" : "boy") + " hair " + hair + " pale leftover", s.pale < 40, "pale=" + s.pale);
  }
}

for (const gender of [0, 1]) {
  for (let topCut = 0; topCut < 5; topCut++) {
    const p = paintLook(fig({ gender, topCut, top: 1, skin: 4 }));
    const g = torsoGrey(p);
    check(
      (gender ? "girl" : "boy") + " top " + topCut + " grey splotch",
      g.pct < 12,
      "grey=" + g.grey + "/" + g.fill + " " + g.pct + "%",
    );
    const s = faceStats(p);
    check((gender ? "girl" : "boy") + " top " + topCut + " pale", s.pale < 40, "pale=" + s.pale);
  }
}

for (const gender of [0, 1]) {
  for (let skin = 0; skin < 8; skin++) {
    const p = paintLook(fig({ gender, skin, hair: 1, topCut: 0, top: 0 }));
    const s = faceStats(p);
    const allowPale = skin <= 1;
    check(
      (gender ? "girl" : "boy") + " skin " + skin + " leftover pale",
      allowPale || s.pale < 25,
      "pale=" + s.pale + " faceX=" + s.faceX.toFixed(1),
    );
  }
}

if (fails.length) {
  console.error("\nFAILS\n" + fails.join("\n"));
  process.exit(1);
}
console.log("quality ok");
