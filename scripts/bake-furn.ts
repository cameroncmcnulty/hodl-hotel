import fs from "fs";
import path from "path";
import { PNG } from "pngjs";
import { furn } from "../src/lib/catalog";
import { paintFurnPix } from "../src/lib/game/furnDraw";
import { iso } from "../src/lib/game/iso";
import { Pix } from "../src/lib/game/pix";
import { DEFAULT_FIGURE, paintLook } from "../src/lib/game/lookDraw";

const OUT = path.join(__dirname, "furn-tests");
fs.mkdirSync(OUT, { recursive: true });

function writePix(p: Pix, file: string) {
  const png = new PNG({ width: p.w, height: p.h });
  png.data.set(p.d);
  fs.writeFileSync(file, PNG.sync.write(png));
}

const ids = [
  "sofa_corner",
  "sofa_sunset",
  "chair_coral",
  "armchair_teal",
  "stool_mint",
  "table_coffee",
  "bed_twin",
  "lamp_floor",
  "plant_palm",
  "wardrobe",
  "rug_small",
];

for (const id of ids) {
  const def = furn(id);
  if (!def) continue;
  writePix(paintFurnPix(def, 0), path.join(OUT, `${id}.png`));
}

function snapSheet() {
  const ox = 160;
  const oy = 20;
  const p = new Pix(320, 220);
  const fillQuad = (
    a: { sx: number; sy: number },
    b: { sx: number; sy: number },
    c: { sx: number; sy: number },
    d: { sx: number; sy: number },
    col: [number, number, number]
  ) => {
    const pts = [a, b, c, d].map((q) => ({ x: Math.round(q.sx + ox), y: Math.round(q.sy + oy) }));
    const minX = Math.min(...pts.map((q) => q.x));
    const maxX = Math.max(...pts.map((q) => q.x));
    const minY = Math.min(...pts.map((q) => q.y));
    const maxY = Math.max(...pts.map((q) => q.y));
    const tri = (A: (typeof pts)[0], B: (typeof pts)[0], C: (typeof pts)[0]) => {
      const area = (B.x - A.x) * (C.y - A.y) - (B.y - A.y) * (C.x - A.x);
      if (!area) return;
      for (let y = minY; y <= maxY; y++) {
        for (let x = minX; x <= maxX; x++) {
          const w0 = (B.x - A.x) * (y - A.y) - (B.y - A.y) * (x - A.x);
          const w1 = (C.x - B.x) * (y - B.y) - (C.y - B.y) * (x - B.x);
          const w2 = (A.x - C.x) * (y - C.y) - (A.y - C.y) * (x - C.x);
          if (area > 0 ? w0 >= 0 && w1 >= 0 && w2 >= 0 : w0 <= 0 && w1 <= 0 && w2 <= 0) p.set(x, y, col);
        }
      }
    };
    tri(pts[0], pts[1], pts[2]);
    tri(pts[0], pts[2], pts[3]);
  };
  for (let y = 0; y < 4; y++) {
    for (let x = 0; x < 4; x++) {
      const fill: [number, number, number] = (x + y) % 2 === 0 ? [201, 163, 110] : [184, 146, 92];
      fillQuad(iso(x, y), iso(x + 1, y), iso(x + 1, y + 1), iso(x, y + 1), fill);
    }
  }
  const def = furn("sofa_corner")!;
  const spr = paintFurnPix(def, 0);
  const left = iso(0, 1);
  const front = iso(2, 1);
  const dx = Math.round(left.sx) - 2 + ox;
  const dy = Math.round(front.sy) - spr.h + 2 + oy;
  for (let y = 0; y < spr.h; y++) {
    for (let x = 0; x < spr.w; x++) {
      const i = (y * spr.w + x) * 4;
      if (spr.d[i + 3] < 8) continue;
      p.set(dx + x, dy + y, [spr.d[i], spr.d[i + 1], spr.d[i + 2]]);
    }
  }
  for (const c of [iso(0, 0), iso(2, 0), iso(0, 1), iso(2, 1), iso(1, 0), iso(1, 1)]) {
    const x = Math.round(c.sx + ox);
    const y = Math.round(c.sy + oy);
    p.set(x, y, [255, 0, 80]);
    p.set(x + 1, y, [255, 0, 80]);
    p.set(x, y + 1, [255, 0, 80]);
  }
  const chair = paintFurnPix(furn("chair_coral")!, 0);
  const cLeft = iso(2, 2);
  const cFront = iso(3, 3);
  const cdx = Math.round(cLeft.sx) - 2 + ox;
  const cdy = Math.round(cFront.sy) - chair.h + 2 + oy;
  for (let y = 0; y < chair.h; y++) {
    for (let x = 0; x < chair.w; x++) {
      const i = (y * chair.w + x) * 4;
      if (chair.d[i + 3] < 8) continue;
      p.set(cdx + x, cdy + y, [chair.d[i], chair.d[i + 1], chair.d[i + 2]]);
    }
  }
  const look = paintLook(DEFAULT_FIGURE, { view: 1 });
  const foot = iso(1.5, 2.5);
  const adx = Math.round(foot.sx + ox - 48);
  const ady = Math.round(foot.sy + oy - 162);
  for (let y = 0; y < look.h; y++) {
    for (let x = 0; x < look.w; x++) {
      const i = (y * look.w + x) * 4;
      if (look.d[i + 3] < 8) continue;
      p.set(adx + x, ady + y, [look.d[i], look.d[i + 1], look.d[i + 2]]);
    }
  }
  writePix(p, path.join(OUT, "snap-sofa.png"));
}

snapSheet();
console.log("baked", ids.length, "sprites + snap sheet →", OUT);
