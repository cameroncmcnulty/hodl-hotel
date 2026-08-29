/** Compile lookDraw and stamp a test sheet so we can judge the pixels. */
const fs = require("fs");
const path = require("path");
const ts = require("typescript");
const { PNG } = require("pngjs");

const ROOT = path.join(__dirname, "..");
const OUT = path.join(__dirname, "look-tests");
fs.mkdirSync(OUT, { recursive: true });

function loadTs(rel, cache = new Map()) {
  if (cache.has(rel)) return cache.get(rel);
  const abs = path.join(ROOT, rel);
  const src = fs.readFileSync(abs, "utf8");
  const out = ts.transpileModule(src, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
      esModuleInterop: true,
      isolatedModules: true,
    },
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
const { paintLook, clampFigure, LOOK_W, LOOK_H, Pix, setChibi, pixFromRgba, allChibiIds } = { ...look, ...pix };

const CHIBI_DIR = path.join(ROOT, "public", "art", "chibi");
for (const id of allChibiIds()) {
  const file = path.join(CHIBI_DIR, id + ".png");
  const png = PNG.sync.read(fs.readFileSync(file));
  setChibi(id, pixFromRgba(png.width, png.height, png.data));
}

function savePix(name, p, scale = 4) {
  const w = p.w * scale;
  const h = p.h * scale;
  const png = new PNG({ width: w, height: h, colorType: 6 });
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const sx = Math.floor(x / scale);
      const sy = Math.floor(y / scale);
      const i = (sy * p.w + sx) * 4;
      const o = (y * w + x) * 4;
      png.data[o] = p.d[i];
      png.data[o + 1] = p.d[i + 1];
      png.data[o + 2] = p.d[i + 2];
      png.data[o + 3] = p.d[i + 3];
    }
  }
  fs.writeFileSync(path.join(OUT, name + ".png"), PNG.sync.write(png));
}

function fig(patch) {
  return clampFigure({ gender: 0, skin: 1, hair: 0, hairColor: 0, top: 0, bottom: 0, shoes: 0, topCut: 0, botCut: 0, shoeCut: 0, acc: 0, ...patch });
}

function sheet(name, figs, cols = 5, bg = [92, 107, 120]) {
  const pad = 10;
  const rows = Math.ceil(figs.length / cols);
  const p = new Pix(pad + cols * (LOOK_W + pad), pad + rows * (LOOK_H + pad));
  p.rect(0, 0, p.w, p.h, bg);
  figs.forEach((f, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    p.blit(paintLook(f), pad + col * (LOOK_W + pad), pad + row * (LOOK_H + pad));
  });
  savePix(name, p, 4);
}

const boyHairs = [0, 1, 2, 3, 4, 5].map((hair) => fig({ gender: 0, hair, topCut: 1, botCut: 0, top: 3, bottom: 1, shoes: 0 }));
const girlHairs = [0, 1, 2, 3, 4, 5].map((hair) => fig({ gender: 1, hair, topCut: 1, botCut: 0, top: 0, bottom: 1, shoes: 1, hairColor: 5 }));
sheet("boy-hairs", boyHairs, 6);
sheet("girl-hairs", girlHairs, 6);

const boySkins = [0, 1, 2, 3, 4, 5, 6, 7].map((skin) => fig({ gender: 0, skin, hair: 4, topCut: 0, botCut: 1, top: 2, bottom: 0, shoes: 2 }));
const girlSkins = [0, 1, 2, 3, 4, 5, 6, 7].map((skin) => fig({ gender: 1, skin, hair: 2, topCut: 0, botCut: 0, top: 1, bottom: 0, shoes: 0 }));
sheet("boy-skins", boySkins, 8);
sheet("girl-skins", girlSkins, 8);

const boyClothes = [0, 1, 2, 3, 4].map((topCut) => fig({ gender: 0, hair: 0, topCut, botCut: 0, top: 0, bottom: 0, shoes: 0 }));
const boyBots = [0, 1, 2, 3, 4].map((botCut) => fig({ gender: 0, hair: 0, topCut: 1, botCut, top: 0, bottom: 0, shoes: 0 }));
const boyShoes = [0, 1, 2, 3, 4].map((shoeCut) => fig({ gender: 0, hair: 0, topCut: 1, botCut: 1, shoeCut, top: 4, bottom: 2, shoes: 0 }));
sheet("boy-tops", boyClothes, 5);
sheet("boy-bots", boyBots, 5);
sheet("boy-shoes", boyShoes, 5);

const girlClothes = [0, 1, 2, 3, 4].map((topCut) => fig({ gender: 1, hair: 0, topCut, botCut: 0, top: 0, bottom: 0, shoes: 0 }));
const girlBots = [0, 1, 2, 3, 4].map((botCut) => fig({ gender: 1, hair: 0, topCut: 0, botCut, top: 0, bottom: 1, shoes: 0 }));
const girlShoes = [0, 1, 2, 3, 4].map((shoeCut) => fig({ gender: 1, hair: 0, topCut: 0, botCut: 0, shoeCut, top: 0, bottom: 0, shoes: 0 }));
sheet("girl-tops", girlClothes, 5);
sheet("girl-bots", girlBots, 5);
sheet("girl-shoes", girlShoes, 5);

const looks = [
  fig({ gender: 0, skin: 1, hair: 4, hairColor: 3, topCut: 1, top: 0, botCut: 1, bottom: 3, shoes: 0 }),
  fig({ gender: 0, skin: 4, hair: 2, hairColor: 2, topCut: 0, top: 3, botCut: 0, bottom: 0, shoes: 2 }),
  fig({ gender: 0, skin: 6, hair: 3, hairColor: 0, topCut: 1, top: 4, botCut: 0, bottom: 2, shoes: 3 }),
  fig({ gender: 1, skin: 0, hair: 0, hairColor: 5, topCut: 0, top: 0, botCut: 0, bottom: 1, shoeCut: 1, shoes: 0 }),
  fig({ gender: 1, skin: 3, hair: 4, hairColor: 3, topCut: 1, top: 2, botCut: 1, bottom: 0, shoeCut: 0, shoes: 1 }),
  fig({ gender: 1, skin: 5, hair: 1, hairColor: 2, topCut: 0, top: 1, botCut: 2, bottom: 0, shoeCut: 1, shoes: 2 }),
];
sheet("heroes", looks, 6);

savePix("boy-default", paintLook(fig({})), 4);
savePix("girl-default", paintLook(fig({ gender: 1, hair: 0, topCut: 0, botCut: 0, hairColor: 0, top: 0, bottom: 0, shoes: 0 })), 4);

function hashPix(p) {
  let h = 0;
  for (let i = 0; i < p.d.length; i += 4) {
    if (p.d[i + 3] < 8) continue;
    h = (h * 33 + p.d[i] + p.d[i + 1] * 3 + p.d[i + 2] * 7 + i) >>> 0;
  }
  return h;
}

let combos = 0;
const seen = new Set();
for (const gender of [0, 1]) {
  const hairs = 6;
  const tops = 5;
  const bots = 5;
  const shoes = 5;
  for (let hair = 0; hair < hairs; hair++) {
    for (let topCut = 0; topCut < tops; topCut++) {
      for (let botCut = 0; botCut < bots; botCut++) {
        for (let shoeCut = 0; shoeCut < shoes; shoeCut++) {
          for (const skin of [0, 4, 7]) {
            const p = paintLook(fig({ gender, hair, topCut, botCut, shoeCut, skin, top: 1, bottom: 2, shoes: 3, hairColor: 2 }));
            if (p.w !== LOOK_W || p.h !== LOOK_H) throw new Error("size " + p.w + "x" + p.h);
            let opaque = 0;
            for (let i = 3; i < p.d.length; i += 4) if (p.d[i] > 8) opaque++;
            if (opaque < 800) throw new Error("empty sprite " + [gender, hair, topCut, botCut, shoeCut, skin].join(","));
            seen.add(hashPix(p));
            combos++;
          }
        }
      }
    }
  }
}
if (seen.size < combos * 0.7) throw new Error("too many identical looks " + seen.size + "/" + combos);
console.log("combos", combos, "unique", seen.size);
console.log("wrote", OUT);
