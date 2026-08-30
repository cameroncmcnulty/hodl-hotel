/**
 * Native PixiJS pixel art — OG Sulake proportions, 1–2px ink, 2:1 iso.
 * Vertices come from iso() so furniture sits on tile diamonds.
 */
import { Graphics, Container } from "pixi.js";
import type { FurnDef } from "../../catalog";
import { footprint } from "../../catalog";
import type { Figure } from "../../types";
import { iso } from "../iso";
import {
  clampFigure,
  hairsFor,
  topsFor,
  botsFor,
  shoesFor,
  defaultHairName,
  hairColors,
  SKIN,
  DYE,
} from "../lookDraw";
import { mix } from "../pix";

export const INK = 0x0c080e;
export const FOOT = 52;

type Rot = 0 | 1 | 2 | 3;
type Cols = FurnDef["colors"];

const WOOD = "#6d4c2f";
const WOOD_L = "#8a6a3e";
const WOOD_R = "#4a331c";
const CREAM = "#f5e6cc";
const BOOKS = ["#c44536", "#1e3a8a", "#14532d", "#f5c542", "#6b21c4", "#e8eefc", "#14F195", "#ff6b5a"];

function hex(s: string) {
  if (s.startsWith("#")) return parseInt(s.slice(1), 16) >>> 0;
  const m = s.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
  if (m) return ((Number(m[1]) << 16) | (Number(m[2]) << 8) | Number(m[3])) >>> 0;
  return 0x888888;
}

function tint(s: string, amt: number) {
  const [r, g, b] = mix(s, amt);
  return ((r << 16) | (g << 8) | b) >>> 0;
}

function tintHex(s: string, amt: number) {
  const [r, g, b] = mix(s, amt);
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}

function poly(g: Graphics, pts: { sx: number; sy: number }[], fill: number, stroke = true) {
  const flat: number[] = [];
  for (const p of pts) flat.push(Math.round(p.sx), Math.round(p.sy));
  g.poly(flat);
  g.fill({ color: fill });
  if (stroke) g.stroke({ width: 2, color: INK });
}

export function isoBox(
  g: Graphics,
  x: number,
  y: number,
  z: number,
  w: number,
  d: number,
  h: number,
  top: string,
  left: string,
  right: string
) {
  if (w <= 0 || d <= 0 || h <= 0) return;
  const A = iso(x, y + d, z + h);
  const B = iso(x + w, y + d, z + h);
  const C = iso(x + w, y, z + h);
  const E = iso(x, y, z + h);
  const A2 = iso(x, y + d, z);
  const B2 = iso(x + w, y + d, z);
  const C2 = iso(x + w, y, z);
  poly(g, [A, B, B2, A2], hex(left));
  poly(g, [C, B, B2, C2], hex(right));
  poly(g, [E, C, B, A], hex(top));
}

export function isoDiamond(g: Graphics, x: number, y: number, z: number, fill: string, stroke = true) {
  poly(g, [iso(x, y, z), iso(x + 1, y, z), iso(x + 1, y + 1, z), iso(x, y + 1, z)], hex(fill), stroke);
}

function legs(g: Graphics, x: number, y: number, z: number, w: number, d: number, hh = 0.18) {
  const s = 0.12;
  isoBox(g, x, y, z, s, s, hh, WOOD_L, WOOD, WOOD_R);
  isoBox(g, x + w - s, y, z, s, s, hh, WOOD_L, WOOD, WOOD_R);
  isoBox(g, x, y + d - s, z, s, s, hh, WOOD_L, WOOD, WOOD_R);
  isoBox(g, x + w - s, y + d - s, z, s, s, hh, WOOD_L, WOOD, WOOD_R);
}

/** Round column in iso space — pots, stools, lamp stems, shade stacks. */
function cyl(g: Graphics, cx: number, cy: number, z: number, r: number, h: number, top: string, side: string) {
  const rx = Math.max(3, Math.round(r * 32));
  const ry = Math.max(2, Math.round(r * 16));
  const b = iso(cx, cy, z);
  const t = iso(cx, cy, z + h);
  const bx = Math.round(b.sx);
  const by = Math.round(b.sy);
  const tx = Math.round(t.sx);
  const ty = Math.round(t.sy);
  g.poly([bx - rx, by, bx, by, tx, ty, tx - rx, ty]);
  g.fill({ color: hex(side) });
  g.stroke({ width: 2, color: INK });
  g.poly([bx, by, bx + rx, by, tx + rx, ty, tx, ty]);
  g.fill({ color: hex(tintHex(side, -22)) });
  g.stroke({ width: 2, color: INK });
  g.ellipse(tx, ty, rx, ry);
  g.fill({ color: hex(top) });
  g.stroke({ width: 2, color: INK });
}

function blobAt(g: Graphics, x: number, y: number, z: number, rx: number, ry: number, fill: string, stroke = true) {
  const p = iso(x, y, z);
  g.ellipse(Math.round(p.sx), Math.round(p.sy), Math.max(1, Math.round(rx)), Math.max(1, Math.round(ry)));
  g.fill({ color: hex(fill) });
  if (stroke) g.stroke({ width: 2, color: INK });
}

function pip(g: Graphics, x: number, y: number, z: number, r: number, fill: number | string = INK) {
  const p = iso(x, y, z);
  g.circle(Math.round(p.sx), Math.round(p.sy), r);
  g.fill({ color: typeof fill === "number" ? fill : hex(fill) });
}

/** Palm / monstera frond as a pointed iso diamond. */
function frond(g: Graphics, x: number, y: number, z: number, dx: number, dy: number, fill: string) {
  const base = iso(x, y, z);
  const tip = iso(x + dx, y + dy, z + 0.08);
  const a = iso(x + dx * 0.4 + dy * 0.22, y + dy * 0.4 - dx * 0.22, z + 0.02);
  const b = iso(x + dx * 0.4 - dy * 0.22, y + dy * 0.4 + dx * 0.22, z + 0.02);
  poly(g, [base, a, tip, b], hex(fill));
}

function back(g: Graphics, x: number, y: number, z: number, w: number, d: number, rot: Rot, thick: number, hh: number, c: Cols) {
  const top = tintHex(c.top, -8);
  if (rot === 0) isoBox(g, x, y, z, w, thick, hh, top, c.left, c.right);
  else if (rot === 1) isoBox(g, x, y, z, thick, d, hh, top, c.left, c.right);
  else if (rot === 2) isoBox(g, x, y + d - thick, z, w, thick, hh, top, c.left, c.right);
  else isoBox(g, x + w - thick, y, z, thick, d, hh, top, c.left, c.right);
}

function armrests(g: Graphics, x: number, y: number, z: number, w: number, d: number, rot: Rot, hh: number, c: Cols) {
  const t = 0.18;
  if (rot === 0 || rot === 2) {
    isoBox(g, x, y, z, t, d, hh, c.top, c.left, c.right);
    isoBox(g, x + w - t, y, z, t, d, hh, c.top, c.left, c.right);
    blobAt(g, x + t * 0.5, y + d * 0.45, z + hh, 5, 3, tintHex(c.top, 18), false);
    blobAt(g, x + w - t * 0.5, y + d * 0.45, z + hh, 5, 3, tintHex(c.top, 18), false);
  } else {
    isoBox(g, x, y, z, w, t, hh, c.top, c.left, c.right);
    isoBox(g, x, y + d - t, z, w, t, hh, c.top, c.left, c.right);
    blobAt(g, x + w * 0.45, y + t * 0.5, z + hh, 5, 3, tintHex(c.top, 18), false);
    blobAt(g, x + w * 0.45, y + d - t * 0.5, z + hh, 5, 3, tintHex(c.top, 18), false);
  }
}

function seatPads(g: Graphics, x: number, y: number, z: number, w: number, d: number, rot: Rot, n: number, fill: string) {
  const pad = tintHex(fill, 18);
  const shade = tintHex(fill, -22);
  for (let i = 0; i < n; i++) {
    if (rot === 0 || rot === 2) {
      const sw = w / n;
      isoBox(g, x + 0.2 + i * sw, y + 0.26, z, sw - 0.28, Math.max(0.28, d - 0.44), 0.14, pad, shade, tintHex(fill, -8));
    } else {
      const sd = d / n;
      isoBox(g, x + 0.26, y + 0.2 + i * sd, z, Math.max(0.28, w - 0.44), sd - 0.28, 0.14, pad, shade, tintHex(fill, -8));
    }
  }
}

function tufts(g: Graphics, x: number, y: number, z: number, n: number) {
  for (let i = 0; i < n; i++) pip(g, x + 0.38 + i * 0.52, y + 0.48, z, 2);
}

function onionShade(g: Graphics, cx: number, cy: number, z: number, col: string) {
  blobAt(g, cx, cy, z, 8, 5, tintHex(col, -28));
  blobAt(g, cx, cy, z + 0.18, 16, 10, tintHex(col, -8));
  blobAt(g, cx, cy, z + 0.42, 14, 9, col);
  blobAt(g, cx, cy, z + 0.68, 9, 6, tintHex(col, 24));
  blobAt(g, cx - 0.08, cy - 0.06, z + 0.5, 5, 4, tintHex(col, 46), false);
}

function fire(g: Graphics, x: number, y: number, z: number) {
  blobAt(g, x, y, z, 8, 10, "#ff6b5a");
  blobAt(g, x, y, z + 0.22, 5, 7, "#f5c542");
  blobAt(g, x, y, z + 0.38, 3, 4, "#fff6d6");
}

function crystal(g: Graphics, x: number, y: number, z: number, h: number, c: Cols) {
  const cx = x + 0.5;
  const cy = y + 0.5;
  const top = iso(cx, cy, z + h);
  const bot = iso(cx, cy, z + 0.08);
  const mid = z + h * 0.48;
  const n = iso(cx, cy - 0.36, mid);
  const s = iso(cx, cy + 0.36, mid);
  const e = iso(cx + 0.36, cy, mid);
  const wpt = iso(cx - 0.36, cy, mid);
  poly(g, [bot, wpt, s], hex(tintHex(c.left, -16)));
  poly(g, [bot, s, e], hex(tintHex(c.right, -16)));
  poly(g, [top, wpt, s], hex(c.left));
  poly(g, [top, s, e], hex(c.right));
  poly(g, [top, e, n], hex(tintHex(c.top, 18)));
  poly(g, [top, n, wpt], hex(c.top));
}

function pot(g: Graphics, x: number, y: number, z: number, col: string) {
  blobAt(g, x + 0.5, y + 0.5, z + 0.02, 16, 8, tintHex(col, -18));
  cyl(g, x + 0.5, y + 0.5, z + 0.04, 0.26, 0.38, tintHex(col, 12), col);
}

export function drawFurni(g: Graphics, def: FurnDef, x: number, y: number, z: number, rot: Rot) {
  const { w, d } = footprint(def, rot);
  const c = def.colors;
  const h = Math.max(0.2, def.h);
  const shape = def.shape;
  const id = def.id;
  const seats = Math.max(1, Math.round(rot === 1 || rot === 3 ? d : w));

  if (shape === "rug" || def.finish) {
    for (let dy = 0; dy < d; dy++) for (let dx = 0; dx < w; dx++) isoDiamond(g, x + dx, y + dy, z + 0.02, (dx + dy) % 2 ? c.right : c.top);
    isoBox(g, x + 0.1, y + 0.1, z + 0.03, Math.max(0.2, w - 0.2), Math.max(0.2, d - 0.2), 0.02, tintHex(c.top, 18), c.left, c.right);
    return;
  }

  if (id.includes("fireplace")) {
    isoBox(g, x, y, z, w, d, 0.22, c.top, c.left, c.right);
    isoBox(g, x, y, z + 0.22, w, 0.28, h - 0.22, c.top, c.left, c.right);
    isoBox(g, x + 0.18, y + 0.04, z + 0.4, w - 0.36, 0.12, h * 0.55, "#1a0a08", "#0b0404", "#3a1510");
    fire(g, x + w / 2, y + 0.18, z + 0.55);
    isoBox(g, x, y, z + h - 0.18, w, d, 0.16, tintHex(c.top, 12), c.left, c.right);
    return;
  }

  if (id === "bookshelf" || id.includes("books")) {
    isoBox(g, x, y, z, w, d, h, WOOD_L, WOOD, WOOD_R);
    for (let row = 0; row < 3; row++) {
      const zz = z + 0.22 + row * ((h - 0.4) / 3);
      isoBox(g, x + 0.08, y + 0.04, zz, w - 0.16, 0.08, 0.06, WOOD_L, WOOD, WOOD_R);
      const n = Math.max(4, Math.round(w * 5));
      for (let i = 0; i < n; i++) {
        const col = BOOKS[(i + row * 3) % BOOKS.length];
        isoBox(g, x + 0.12 + i * ((w - 0.24) / n), y + 0.06, zz + 0.06, (w - 0.24) / n - 0.04, 0.1, 0.38, col, tintHex(col, -24), tintHex(col, -8));
      }
    }
    return;
  }

  if (id.includes("coat_rack")) {
    cyl(g, x + 0.5, y + 0.5, z, 0.16, 0.1, WOOD_L, WOOD);
    cyl(g, x + 0.5, y + 0.5, z + 0.1, 0.06, 1.7, WOOD_L, WOOD);
    isoBox(g, x + 0.22, y + 0.46, z + 1.35, 0.56, 0.08, 0.06, WOOD_L, WOOD, WOOD_R);
    isoBox(g, x + 0.22, y + 0.46, z + 1.55, 0.56, 0.08, 0.06, WOOD_L, WOOD, WOOD_R);
    pip(g, x + 0.22, y + 0.5, z + 1.4, 3, "#c4a574");
    pip(g, x + 0.78, y + 0.5, z + 1.4, 3, "#c4a574");
    return;
  }

  if (id.includes("column") || id.includes("pillar")) {
    cyl(g, x + 0.5, y + 0.5, z, 0.28, 0.16, c.top, c.left);
    cyl(g, x + 0.5, y + 0.5, z + 0.16, 0.2, h - 0.32, c.top, c.left);
    cyl(g, x + 0.5, y + 0.5, z + h - 0.16, 0.28, 0.16, tintHex(c.top, 16), c.right);
    if (id.includes("neon") || id.includes("pillar_neon")) {
      blobAt(g, x + 0.5, y + 0.5, z + h * 0.5, 6, 18, c.right, false);
    }
    return;
  }

  if (id.includes("velvet_rope")) {
    cyl(g, x + 0.12, y + 0.5, z, 0.08, 1.05, c.left, tintHex(c.left, -16));
    cyl(g, x + w - 0.12, y + 0.5, z, 0.08, 1.05, c.left, tintHex(c.left, -16));
    const a = iso(x + 0.12, y + 0.5, z + 0.92);
    const b = iso(x + w - 0.12, y + 0.5, z + 0.72);
    g.moveTo(Math.round(a.sx), Math.round(a.sy));
    g.lineTo(Math.round(b.sx), Math.round(b.sy));
    g.stroke({ width: 5, color: hex(c.top) });
    g.moveTo(Math.round(a.sx), Math.round(a.sy));
    g.lineTo(Math.round(b.sx), Math.round(b.sy));
    g.stroke({ width: 2, color: INK });
    return;
  }

  if (id.includes("hammock")) {
    isoBox(g, x, y + 0.4, z, 0.12, 0.12, 1.15, WOOD_L, WOOD, WOOD_R);
    isoBox(g, x + w - 0.12, y + 0.4, z, 0.12, 0.12, 1.15, WOOD_L, WOOD, WOOD_R);
    const p0 = iso(x + 0.08, y + 0.46, z + 0.95);
    const p1 = iso(x + w / 2, y + 0.7, z + 0.55);
    const p2 = iso(x + w - 0.08, y + 0.46, z + 0.95);
    const p3 = iso(x + w / 2, y + 0.3, z + 0.55);
    poly(g, [p0, p1, p2, p3], hex(c.top));
    return;
  }

  if (id.includes("gold_stack")) {
    isoBox(g, x + 0.18, y + 0.22, z, 0.64, 0.5, 0.14, c.top, c.left, c.right);
    isoBox(g, x + 0.22, y + 0.24, z + 0.14, 0.56, 0.44, 0.14, tintHex(c.top, 10), c.left, c.right);
    isoBox(g, x + 0.26, y + 0.26, z + 0.28, 0.48, 0.38, 0.14, tintHex(c.top, 22), c.left, c.right);
    return;
  }

  if (shape === "sofa" || shape === "bench") {
    legs(g, x, y, z, w, d, 0.18);
    isoBox(g, x, y + 0.06, z + 0.18, w, d - 0.06, 0.4, c.top, c.left, c.right);
    if (shape === "sofa") {
      const bt = 0.28;
      const bh = 0.78;
      if (rot === 0 || rot === 2) {
        const by = rot === 0 ? y : y + d - bt;
        const sw = w / seats;
        for (let i = 0; i < seats; i++) {
          isoBox(g, x + 0.04 + i * sw, by, z + 0.58, sw - 0.08, bt, bh, tintHex(c.top, i ? 6 : 12), c.left, c.right);
        }
      } else {
        const bx = rot === 1 ? x : x + w - bt;
        const sd = d / seats;
        for (let i = 0; i < seats; i++) {
          isoBox(g, bx, y + 0.04 + i * sd, z + 0.58, bt, sd - 0.08, bh, tintHex(c.top, i ? 6 : 12), c.left, c.right);
        }
      }
      armrests(g, x, y, z + 0.58, w, d, rot, 0.42, c);
      seatPads(g, x, y, z + 0.58, w, d, rot, seats, c.top);
      tufts(g, x, y, z + 0.74, seats);
    }
    return;
  }

  if (shape === "chair" || shape === "armchair" || shape === "throne") {
    legs(g, x, y, z, w, d, 0.22);
    isoBox(g, x + 0.14, y + 0.18, z + 0.22, w - 0.28, d - 0.3, 0.36, c.top, c.left, c.right);
    blobAt(g, x + 0.5, y + 0.52, z + 0.6, 11, 6, tintHex(c.top, 16), false);
    const bh = shape === "throne" ? 1.55 : shape === "armchair" ? 1.18 : 0.98;
    back(g, x, y, z + 0.58, w, d, rot, 0.2, bh, c);
    for (let r = 0; r < 3; r++) {
      for (let col = 0; col < 2; col++) {
        const ox = 0.32 + col * 0.36;
        const oz = 0.85 + r * 0.28;
        if (rot === 0) pip(g, x + ox, y + 0.12, z + oz, 2, tintHex(c.top, -30));
        else if (rot === 1) pip(g, x + 0.12, y + ox, z + oz, 2, tintHex(c.top, -30));
        else if (rot === 2) pip(g, x + ox, y + d - 0.12, z + oz, 2, tintHex(c.top, -30));
        else pip(g, x + w - 0.12, y + ox, z + oz, 2, tintHex(c.top, -30));
      }
    }
    if (shape !== "chair") armrests(g, x, y, z + 0.58, w, d, rot, 0.4, c);
    if (shape === "throne") {
      isoBox(g, x + 0.16, y, z + 0.58 + bh, 0.16, 0.16, 0.24, c.accent || "#f5c542", WOOD, WOOD_R);
      isoBox(g, x + w - 0.32, y, z + 0.58 + bh, 0.16, 0.16, 0.24, c.accent || "#f5c542", WOOD, WOOD_R);
      pip(g, x + 0.5, y + 0.12, z + 0.58 + bh + 0.1, 3, c.accent || "#f5c542");
    }
    if (id.includes("gamer")) {
      isoBox(g, x + 0.08, y + 0.2, z + 0.7, 0.08, d - 0.28, 0.08, c.left, c.left, c.right);
      isoBox(g, x + w - 0.16, y + 0.2, z + 0.7, 0.08, d - 0.28, 0.08, c.left, c.left, c.right);
    }
    return;
  }

  if (shape === "stool") {
    const tall = h > 1.2;
    const lh = tall ? 1.05 : 0.52;
    cyl(g, x + 0.5, y + 0.5, z, 0.08, lh, WOOD_L, WOOD);
    pip(g, x + 0.28, y + 0.42, z + 0.08, 4, hex(c.left));
    pip(g, x + 0.72, y + 0.32, z + 0.08, 4, hex(c.left));
    pip(g, x + 0.68, y + 0.7, z + 0.08, 4, hex(c.left));
    cyl(g, x + 0.5, y + 0.5, z + lh, 0.38, 0.12, tintHex(c.top, 18), c.left);
    blobAt(g, x + 0.42, y + 0.4, z + lh + 0.14, 8, 4, tintHex(c.top, 36), false);
    return;
  }

  if (shape === "bean") {
    blobAt(g, x + 0.5, y + 0.58, z + 0.12, 20, 11, c.left);
    blobAt(g, x + 0.5, y + 0.46, z + 0.42, 17, 12, c.top);
    blobAt(g, x + 0.4, y + 0.38, z + 0.62, 8, 5, tintHex(c.top, 24));
    return;
  }

  if (shape === "lounger") {
    legs(g, x, y, z, w, d, 0.12);
    isoBox(g, x, y, z + 0.12, w, d, 0.22, c.top, c.left, c.right);
    back(g, x, y, z + 0.34, w, d, rot, 0.38, 0.3, c);
    seatPads(g, x, y, z + 0.34, w, d, rot, 1, c.top);
    return;
  }

  if (shape === "bed" || shape === "canopy") {
    legs(g, x, y, z, w, d, 0.16);
    isoBox(g, x, y, z + 0.16, w, d, 0.22, WOOD_L, WOOD, WOOD_R);
    back(g, x, y, z + 0.38, w, d, rot, 0.14, 0.55, { top: WOOD_L, left: WOOD, right: WOOD_R });
    isoBox(g, x + 0.06, y + 0.06, z + 0.38, w - 0.12, d - 0.12, 0.2, c.top, c.left, c.right);
    isoBox(g, x + 0.1, y + 0.14, z + 0.58, w - 0.2, d - 0.24, 0.1, tintHex(c.top, 16), tintHex(c.left, 8), c.right);
    const acc = c.accent || "#ff6b5a";
    if (rot === 0) {
      isoBox(g, x + 0.14, y + 0.08, z + 0.68, w - 0.28, 0.28, 0.16, acc, tintHex(acc, -24), tintHex(acc, -8));
      blobAt(g, x + w / 2, y + 0.2, z + 0.86, 8, 5, tintHex(acc, 18), false);
    } else if (rot === 1) {
      isoBox(g, x + 0.08, y + 0.14, z + 0.68, 0.28, d - 0.28, 0.16, acc, tintHex(acc, -24), tintHex(acc, -8));
    } else if (rot === 2) {
      isoBox(g, x + 0.14, y + d - 0.36, z + 0.68, w - 0.28, 0.28, 0.16, acc, tintHex(acc, -24), tintHex(acc, -8));
    } else isoBox(g, x + w - 0.36, y + 0.14, z + 0.68, 0.28, d - 0.28, 0.16, acc, tintHex(acc, -24), tintHex(acc, -8));
    if (shape === "canopy") {
      const post = 0.1;
      isoBox(g, x, y, z + 0.38, post, post, 1.65, c.right, c.left, c.right);
      isoBox(g, x + w - post, y, z + 0.38, post, post, 1.65, c.right, c.left, c.right);
      isoBox(g, x, y + d - post, z + 0.38, post, post, 1.65, c.right, c.left, c.right);
      isoBox(g, x + w - post, y + d - post, z + 0.38, post, post, 1.65, c.right, c.left, c.right);
      isoBox(g, x, y, z + 2.03, w, d, 0.08, c.top, c.left, c.right);
    }
    return;
  }

  if (id.includes("lantern")) {
    cyl(g, x + 0.5, y + 0.5, z, 0.1, 0.12, WOOD_L, WOOD);
    isoBox(g, x + 0.46, y + 0.46, z + 0.12, 0.08, 0.08, 0.35, WOOD_L, WOOD, WOOD_R);
    blobAt(g, x + 0.5, y + 0.5, z + 0.85, 14, 16, c.top);
    blobAt(g, x + 0.42, y + 0.4, z + 0.95, 5, 6, tintHex(c.top, 30), false);
    return;
  }

  if (id.includes("candle")) {
    cyl(g, x + 0.5, y + 0.5, z, 0.2, 0.12, c.top, c.left);
    for (const ox of [0.32, 0.5, 0.68]) {
      isoBox(g, x + ox - 0.04, y + 0.46, z + 0.12, 0.08, 0.08, 0.7, c.top, c.left, c.right);
      blobAt(g, x + ox, y + 0.5, z + 0.9, 4, 6, "#ffe08a");
      pip(g, x + ox, y + 0.5, z + 1.05, 2, "#fff6d6");
    }
    return;
  }

  if (shape === "lamp" || shape === "solamp" || shape === "lava") {
    cyl(g, x + 0.5, y + 0.5, z, 0.22, 0.12, "#6b7280", "#374151");
    const stem = Math.max(0.45, Math.min(1.55, h - 0.7));
    cyl(g, x + 0.5, y + 0.5, z + 0.12, 0.055, stem, c.left, tintHex(c.left, -18));
    if (shape === "lava") {
      cyl(g, x + 0.5, y + 0.5, z + 0.12, 0.16, stem, tintHex(c.right, 20), c.right);
      blobAt(g, x + 0.5, y + 0.5, z + 0.55, 7, 8, c.top);
      blobAt(g, x + 0.5, y + 0.5, z + 1.05, 6, 7, c.left);
    } else {
      onionShade(g, x + 0.5, y + 0.5, z + 0.12 + stem - 0.08, c.top);
    }
    return;
  }

  if (shape === "chandelier") {
    isoBox(g, x + w / 2 - 0.04, y + d / 2 - 0.04, z + h - 0.12, 0.08, 0.08, 0.12, "#c9a227", "#8a6a00", "#f5c542");
    blobAt(g, x + w / 2, y + d / 2, z + h - 0.4, 18, 9, c.top);
    for (const [dx, dy] of [
      [-0.28, 0],
      [0.28, 0],
      [0, -0.28],
      [0, 0.28],
    ] as const) {
      blobAt(g, x + w / 2 + dx, y + d / 2 + dy, z + h - 0.62, 5, 5, "#fff6d6");
    }
    return;
  }

  if (shape === "neon") {
    isoBox(g, x, y + 0.35, z + 0.08, w, 0.3, 0.16, c.top, c.left, c.right);
    blobAt(g, x + w / 2, y + 0.5, z + 0.28, w * 14, 4, tintHex(c.top, 30), false);
    return;
  }

  if (shape === "palm" || shape === "cactus" || shape === "hedge" || shape === "flower" || shape === "tree") {
    pot(g, x, y, z, c.left);
    if (shape === "hedge") {
      if (id.includes("bamboo")) {
        for (const ox of [0.32, 0.5, 0.68]) {
          isoBox(g, x + ox - 0.05, y + 0.46, z + 0.42, 0.1, 0.1, 1.5, c.top, tintHex(c.top, -22), c.right);
        }
        return;
      }
      isoBox(g, x + 0.08, y + 0.08, z + 0.42, w - 0.16, d - 0.16, 0.85, c.top, tintHex(c.top, -25), c.right);
      blobAt(g, x + 0.3, y + 0.3, z + 1.3, 10, 6, tintHex(c.top, 10));
      blobAt(g, x + 0.7, y + 0.55, z + 1.28, 9, 6, tintHex(c.right, 6));
      return;
    }
    if (shape === "cactus") {
      cyl(g, x + 0.5, y + 0.5, z + 0.42, 0.12, 0.95, c.top, tintHex(c.top, -18));
      cyl(g, x + 0.28, y + 0.5, z + 0.78, 0.1, 0.18, c.top, tintHex(c.top, -18));
      cyl(g, x + 0.7, y + 0.48, z + 0.95, 0.09, 0.16, c.top, tintHex(c.top, -18));
      pip(g, x + 0.5, y + 0.5, z + 1.4, 2, "#f5c542");
      return;
    }
    isoBox(g, x + 0.44, y + 0.44, z + 0.42, 0.12, 0.12, 0.85, WOOD_L, WOOD, WOOD_R);
    const crown = z + 1.28;
    frond(g, x + 0.5, y + 0.5, crown, -0.62, 0.12, tintHex(c.top, -14));
    frond(g, x + 0.5, y + 0.5, crown, -0.28, -0.52, c.top);
    frond(g, x + 0.5, y + 0.5, crown, 0.22, -0.55, tintHex(c.top, 10));
    frond(g, x + 0.5, y + 0.5, crown, 0.62, -0.08, tintHex(c.right, 4));
    frond(g, x + 0.5, y + 0.5, crown, 0.38, 0.42, tintHex(c.top, -8));
    frond(g, x + 0.5, y + 0.5, crown, -0.12, 0.52, c.right);
    if (shape === "flower") blobAt(g, x + 0.5, y + 0.42, crown + 0.35, 7, 7, c.top);
    if (shape === "tree") blobAt(g, x + 0.5, y + 0.5, crown + 0.28, 18, 12, tintHex(c.top, -6));
    return;
  }

  if (shape === "table" || shape === "desk" || shape === "chess") {
    const lh = Math.max(0.4, h - 0.16);
    if (id.includes("round") || id.includes("cafe")) {
      legs(g, x + 0.18, y + 0.18, z, w - 0.36, d - 0.36, lh);
      cyl(g, x + 0.5, y + 0.5, z + lh, 0.46, 0.1, c.top, c.left);
      return;
    }
    legs(g, x, y, z, w, d, lh);
    isoBox(g, x, y, z + lh, w, d, 0.12, c.top, c.left, c.right);
    if (id.includes("glass")) blobAt(g, x + w / 2, y + d / 2, z + lh + 0.14, w * 10, d * 5, tintHex(c.top, 30), false);
    if (id.includes("pool") || id.includes("poker")) {
      isoBox(g, x + 0.08, y + 0.08, z + lh + 0.12, w - 0.16, d - 0.16, 0.04, "#14532d", "#0f3d22", "#166534");
      for (const [px, py] of [
        [0.12, 0.12],
        [w - 0.12, 0.12],
        [0.12, d - 0.12],
        [w - 0.12, d - 0.12],
        [w / 2, 0.1],
        [w / 2, d - 0.1],
      ] as const) pip(g, x + px, y + py, z + lh + 0.18, 3, "#111");
    }
    if (id.includes("foos")) {
      for (let i = 0; i < 3; i++) isoBox(g, x + 0.15 + i * 0.55, y + 0.08, z + lh + 0.12, 0.08, d - 0.16, 0.1, "#d1d5db", "#6b7280", "#e5e7eb");
    }
    if (shape === "desk") isoBox(g, x + 0.12, y + 0.52, z + lh + 0.12, 0.42, 0.32, 0.08, c.accent || "#14F195", c.left, c.right);
    if (shape === "chess") {
      for (let iy = 0; iy < 4; iy++)
        for (let ix = 0; ix < 4; ix++) {
          const dark = (ix + iy) % 2 === 0;
          isoBox(
            g,
            x + 0.12 + ix * ((w - 0.24) / 4),
            y + 0.12 + iy * ((d - 0.24) / 4),
            z + lh + 0.12,
            (w - 0.24) / 4,
            (d - 0.24) / 4,
            0.02,
            dark ? "#1a1a1a" : "#eee",
            "#333",
            "#ccc"
          );
        }
    }
    return;
  }

  if (shape === "tv") {
    isoBox(g, x + w * 0.35, y + 0.35, z, w * 0.3, 0.3, 0.18, "#374151", "#111", "#1f2937");
    isoBox(g, x + 0.06, y + 0.22, z + 0.18, w - 0.12, 0.42, h - 0.28, c.top, c.left, c.right);
    isoBox(g, x + 0.14, y + 0.26, z + 0.38, w - 0.28, 0.12, h * 0.52, c.accent || "#0b1220", "#020617", c.accent || "#2ec4b6");
    pip(g, x + w - 0.18, y + 0.4, z + 0.28, 2, "#14F195");
    return;
  }

  if (shape === "arcade") {
    isoBox(g, x + 0.12, y + 0.18, z, w - 0.24, d - 0.28, h - 0.35, c.top, c.left, c.right);
    isoBox(g, x + 0.08, y + 0.55, z + 0.55, w - 0.16, 0.28, 0.16, tintHex(c.left, -10), c.left, c.right);
    isoBox(g, x + 0.18, y + 0.22, z + h * 0.42, w - 0.36, 0.1, h * 0.32, "#0b1220", "#020617", c.right);
    isoBox(g, x + 0.1, y + 0.16, z + h - 0.35, w - 0.2, 0.22, 0.22, c.right, c.left, c.top);
    pip(g, x + 0.35, y + 0.68, z + 0.74, 3, "#ff6b5a");
    pip(g, x + 0.55, y + 0.68, z + 0.74, 3, "#14F195");
    return;
  }

  if (shape === "pc") {
    if (id.includes("laptop")) {
      isoBox(g, x + 0.12, y + 0.28, z, 0.76, 0.5, 0.08, c.left, "#111", c.right);
      isoBox(g, x + 0.18, y + 0.18, z + 0.08, 0.64, 0.12, 0.42, "#111827", "#020617", c.top);
      return;
    }
    isoBox(g, x + 0.18, y + 0.42, z, 0.28, 0.28, 0.55, c.left, "#111", "#1f2937");
    isoBox(g, x + 0.22, y + 0.18, z + 0.4, 0.56, 0.12, 0.55, "#111827", "#020617", c.right);
    isoBox(g, x + 0.22, y + 0.48, z + 0.08, 0.56, 0.38, 0.08, c.right, c.left, c.top);
    return;
  }

  if (shape === "juke") {
    if (id.includes("speaker")) {
      isoBox(g, x + 0.18, y + 0.18, z, 0.64, 0.64, h, c.top, c.left, c.right);
      blobAt(g, x + 0.5, y + 0.35, z + h * 0.7, 10, 10, c.right);
      blobAt(g, x + 0.5, y + 0.35, z + h * 0.38, 12, 12, tintHex(c.right, -16));
      return;
    }
    isoBox(g, x + 0.14, y + 0.16, z, 0.72, 0.68, h, c.top, c.left, c.right);
    blobAt(g, x + 0.5, y + 0.22, z + h * 0.72, 10, 8, c.right);
    isoBox(g, x + 0.22, y + 0.2, z + 0.22, 0.56, 0.12, 0.42, "#111", "#000", c.right);
    pip(g, x + 0.35, y + 0.28, z + h * 0.5, 2, "#14F195");
    pip(g, x + 0.5, y + 0.28, z + h * 0.55, 2, "#ff6b5a");
    pip(g, x + 0.65, y + 0.28, z + h * 0.5, 2, "#f5c542");
    return;
  }

  if (shape === "dj") {
    isoBox(g, x, y, z, w, d, h - 0.12, c.top, c.left, c.right);
    isoBox(g, x + 0.08, y + 0.06, z + h - 0.12, w - 0.16, d - 0.14, 0.1, tintHex(c.top, 16), c.left, c.right);
    blobAt(g, x + 0.4, y + 0.35, z + h, 7, 7, "#111");
    blobAt(g, x + w - 0.4, y + 0.35, z + h, 7, 7, "#111");
    isoBox(g, x + w / 2 - 0.18, y + 0.12, z + h, 0.36, 0.22, 0.06, c.right, c.left, c.top);
    return;
  }

  if (shape === "fridge") {
    isoBox(g, x + 0.12, y + 0.16, z, 0.76, 0.7, h, c.top, c.left, c.right);
    isoBox(g, x + 0.18, y + 0.18, z + h * 0.62, 0.64, 0.08, 0.04, tintHex(c.top, -18), c.left, c.right);
    isoBox(g, x + 0.72, y + 0.22, z + h * 0.42, 0.1, 0.08, 0.22, "#d1d5db", "#6b7280", "#e5e7eb");
    pip(g, x + 0.78, y + 0.28, z + h * 0.72, 2, c.accent || "#2ec4b6");
    return;
  }

  if (shape === "bar") {
    isoBox(g, x, y, z, w, d, h, c.top, c.left, c.right);
    isoBox(g, x + 0.06, y + 0.04, z + h, w - 0.12, d - 0.1, 0.08, tintHex(c.top, 14), c.left, c.right);
    for (let i = 0; i < Math.max(2, Math.round(w)); i++) {
      cyl(g, x + 0.3 + i * 0.55, y + 0.35, z + h + 0.08, 0.06, 0.22, c.right, tintHex(c.right, -16));
    }
    isoBox(g, x + w - 0.16, y + 0.18, z + h * 0.5, 0.1, 0.08, 0.16, "#d1d5db", "#6b7280", "#e5e7eb");
    return;
  }

  if (shape === "disco" || shape === "orb") {
    if (id.includes("trophy") || id.includes("cup")) {
      cyl(g, x + 0.5, y + 0.5, z, 0.16, 0.1, c.top, c.left);
      isoBox(g, x + 0.44, y + 0.44, z + 0.1, 0.12, 0.12, 0.28, c.top, c.left, c.right);
      blobAt(g, x + 0.5, y + 0.5, z + 0.7, 12, 10, c.top);
      isoBox(g, x + 0.22, y + 0.46, z + 0.62, 0.12, 0.08, 0.08, c.top, c.left, c.right);
      isoBox(g, x + 0.66, y + 0.46, z + 0.62, 0.12, 0.08, 0.08, c.top, c.left, c.right);
      return;
    }
    if (id.includes("vase")) {
      cyl(g, x + 0.5, y + 0.5, z, 0.14, 0.12, c.top, c.left);
      blobAt(g, x + 0.5, y + 0.5, z + 0.45, 11, 14, c.top);
      blobAt(g, x + 0.5, y + 0.5, z + 0.85, 7, 6, tintHex(c.top, 18));
      return;
    }
    isoBox(g, x + 0.44, y + 0.44, z, 0.12, 0.12, Math.max(0.35, h - 0.75), c.left, tintHex(c.left, -20), c.right);
    blobAt(g, x + 0.5, y + 0.5, z + Math.max(0.85, h - 0.35), 14, 13, c.top);
    blobAt(g, x + 0.4, y + 0.4, z + Math.max(0.95, h - 0.2), 5, 4, "#ffffff", false);
    pip(g, x + 0.58, y + 0.48, z + Math.max(0.9, h - 0.28), 2, c.right);
    pip(g, x + 0.46, y + 0.58, z + Math.max(0.78, h - 0.42), 2, c.left);
    return;
  }

  if (shape === "diamond" || shape === "prism") {
    crystal(g, x, y, z, h, c);
    return;
  }

  if (shape === "fountain") {
    isoBox(g, x, y, z, w, d, 0.22, c.right, c.left, c.top);
    cyl(g, x + w / 2, y + d / 2, z + 0.22, 0.22, 0.45, c.top, c.left);
    blobAt(g, x + w / 2, y + d / 2, z + 0.95, 12, 9, tintHex(c.top, 20));
    blobAt(g, x + w / 2, y + d / 2, z + 1.2, 6, 8, "#e0f2fe");
    if (id.includes("fire")) fire(g, x + 0.5, y + 0.5, z + 0.4);
    return;
  }

  if (shape === "radio") {
    isoBox(g, x + 0.12, y + 0.22, z, 0.76, 0.56, 0.42, c.top, c.left, c.right);
    blobAt(g, x + 0.35, y + 0.4, z + 0.5, 6, 6, "#111");
    isoBox(g, x + 0.52, y + 0.32, z + 0.42, 0.28, 0.18, 0.08, c.right, c.left, c.top);
    isoBox(g, x + 0.46, y + 0.46, z + 0.42, 0.08, 0.08, 0.28, WOOD_L, WOOD, WOOD_R);
    return;
  }

  if (shape === "clock") {
    cyl(g, x + 0.5, y + 0.5, z, 0.16, 0.12, WOOD_L, WOOD);
    blobAt(g, x + 0.5, y + 0.5, z + 0.72, 13, 13, c.top);
    const hand = iso(x + 0.5, y + 0.5, z + 0.78);
    const tip = iso(x + 0.5, y + 0.32, z + 0.9);
    g.moveTo(Math.round(hand.sx), Math.round(hand.sy));
    g.lineTo(Math.round(tip.sx), Math.round(tip.sy));
    g.stroke({ width: 2, color: INK });
    pip(g, x + 0.5, y + 0.5, z + 0.78, 2, c.right);
    return;
  }

  if (shape === "divider" || shape === "wardrobe") {
    isoBox(g, x, y, z, w, Math.min(d, 0.42), h, c.top, c.left, c.right);
    isoBox(g, x + w * 0.48, y + 0.04, z + 0.12, 0.06, 0.3, h - 0.28, WOOD_L, WOOD, WOOD_R);
    isoBox(g, x + 0.16, y + 0.04, z + h * 0.52, 0.12, 0.08, 0.1, "#d1d5db", "#6b7280", "#e5e7eb");
    isoBox(g, x + w - 0.28, y + 0.04, z + h * 0.52, 0.12, 0.08, 0.1, "#d1d5db", "#6b7280", "#e5e7eb");
    if (shape === "wardrobe") {
      isoBox(g, x + 0.1, y + 0.06, z + 0.28, w * 0.34, 0.08, 0.7, tintHex(c.right, -8), c.left, c.right);
      isoBox(g, x + w * 0.54, y + 0.06, z + 0.28, w * 0.34, 0.08, 0.7, tintHex(c.right, -8), c.left, c.right);
    }
    if (id.includes("locker")) {
      for (let i = 0; i < 4; i++) isoBox(g, x + 0.22, y + 0.06, z + 0.35 + i * 0.35, 0.56, 0.06, 0.06, tintHex(c.top, 16), c.left, c.right);
    }
    return;
  }

  if (shape === "frame" || shape === "board") {
    const thick = def.slot === "wall" ? 0.12 : 0.18;
    isoBox(g, x, y, z + 0.7, w, thick, Math.max(1.1, h), c.top, c.left, c.right);
    isoBox(g, x + 0.08, y + 0.02, z + 0.82, Math.max(0.3, w - 0.16), Math.max(0.06, thick - 0.06), Math.max(0.85, h - 0.28), "#111111", "#1f2937", "#0f172a");
    return;
  }

  if (shape === "umbrella") {
    isoBox(g, x + 0.44, y + 0.44, z, 0.12, 0.12, 1.55, WOOD_L, WOOD, WOOD_R);
    blobAt(g, x + 0.5, y + 0.5, z + 1.55, 22, 8, c.left);
    blobAt(g, x + 0.5, y + 0.5, z + 1.68, 20, 9, c.top);
    blobAt(g, x + 0.5, y + 0.5, z + 1.82, 12, 6, tintHex(c.top, 16));
    return;
  }

  if (shape === "dice") {
    isoBox(g, x + 0.14, y + 0.14, z, 0.72, 0.72, 1.05, c.top, c.left, c.right);
    pip(g, x + 0.35, y + 0.28, z + 0.9, 3);
    pip(g, x + 0.55, y + 0.28, z + 0.72, 3);
    pip(g, x + 0.45, y + 0.28, z + 1.05, 3);
    return;
  }

  if (shape === "pad") {
    isoDiamond(g, x, y, z + 0.02, c.top);
    if (id.includes("float")) {
      blobAt(g, x + 0.5, y + 0.5, z + 0.12, 18, 10, c.top);
      blobAt(g, x + 0.5, y + 0.5, z + 0.12, 8, 5, c.right, false);
    } else {
      isoBox(g, x + 0.18, y + 0.18, z + 0.04, 0.64, 0.64, 0.16, c.right, c.left, c.accent || c.right);
    }
    return;
  }

  if (shape === "box" || id.includes("nightstand") || id.includes("toaster") || id.includes("sink") || id.includes("ice") || id.includes("safe") || id.includes("crate") || id.includes("grill")) {
    if (id.includes("toaster")) {
      isoBox(g, x + 0.18, y + 0.28, z, 0.64, 0.44, 0.42, c.top, c.left, c.right);
      isoBox(g, x + 0.28, y + 0.32, z + 0.42, 0.16, 0.12, 0.08, "#111", "#000", "#333");
      isoBox(g, x + 0.52, y + 0.32, z + 0.42, 0.16, 0.12, 0.08, "#111", "#000", "#333");
      isoBox(g, x + 0.74, y + 0.38, z + 0.18, 0.08, 0.08, 0.1, c.right, c.left, c.top);
      return;
    }
    if (id.includes("sink")) {
      isoBox(g, x + 0.08, y + 0.16, z, 0.84, 0.7, 0.72, c.top, c.left, c.right);
      blobAt(g, x + 0.5, y + 0.48, z + 0.78, 12, 7, "#93c5fd");
      isoBox(g, x + 0.46, y + 0.22, z + 0.78, 0.08, 0.08, 0.12, "#d1d5db", "#6b7280", "#e5e7eb");
      return;
    }
    if (id.includes("ice")) {
      cyl(g, x + 0.5, y + 0.5, z, 0.28, 0.55, c.top, c.left);
      blobAt(g, x + 0.42, y + 0.45, z + 0.62, 5, 4, "#ffffff");
      blobAt(g, x + 0.58, y + 0.5, z + 0.58, 4, 3, "#e0f2fe");
      return;
    }
    if (id.includes("safe")) {
      isoBox(g, x + 0.1, y + 0.14, z, 0.8, 0.72, h, c.top, c.left, c.right);
      blobAt(g, x + 0.5, y + 0.35, z + h * 0.55, 8, 8, c.right);
      pip(g, x + 0.5, y + 0.35, z + h * 0.55, 2, "#111");
      return;
    }
    if (id.includes("grill")) {
      isoBox(g, x + 0.12, y + 0.16, z, 0.76, 0.68, 0.7, c.top, c.left, c.right);
      for (let i = 0; i < 4; i++) isoBox(g, x + 0.2 + i * 0.16, y + 0.2, z + 0.7, 0.08, 0.5, 0.04, "#6b7280", "#111", "#9ca3af");
      fire(g, x + 0.5, y + 0.45, z + 0.82);
      return;
    }
    if (id.includes("crate")) {
      isoBox(g, x + 0.08, y + 0.08, z, w - 0.16, d - 0.16, h, c.top, c.left, c.right);
      isoBox(g, x + 0.08, y + 0.08, z + h * 0.45, w - 0.16, d - 0.16, 0.06, WOOD_L, WOOD, WOOD_R);
      isoBox(g, x + w / 2 - 0.04, y + 0.08, z, 0.08, d - 0.16, h, WOOD_L, WOOD, WOOD_R);
      return;
    }
    isoBox(g, x + 0.1, y + 0.12, z, w - 0.2, d - 0.2, h, c.top, c.left, c.right);
    isoBox(g, x + 0.18, y + 0.14, z + h * 0.45, w - 0.36, 0.08, 0.06, tintHex(c.top, -16), c.left, c.right);
    pip(g, x + w - 0.28, y + 0.22, z + h * 0.52, 2, "#d1d5db");
    return;
  }

  isoBox(g, x + 0.08, y + 0.08, z, w - 0.16, d - 0.16, h, c.top, c.left, c.right);
}

function pal(fig: Figure) {
  const f = clampFigure(fig);
  const g = f.gender ?? 0;
  return {
    skin: SKIN[f.skin] || SKIN[1],
    hair: hairColors(g)[f.hairColor] || "#8b5a2b",
    top: DYE[f.top] || DYE[8] || "#f5c542",
    bot: DYE[f.bottom] || DYE[2],
    shoe: DYE[f.shoes] || DYE[1],
    hairName: hairsFor(g)[f.hair] || defaultHairName(g),
    topName: topsFor(g)[f.topCut ?? 0] || "hoodie",
    botName: botsFor(g)[f.botCut ?? 0] || "pants",
    shoeName: shoesFor(g)[f.shoeCut ?? 0] || "sneakers",
    girl: g === 1,
  };
}

function disk(g: Graphics, x: number, y: number, r: number, fill: number, stroke = true) {
  g.circle(Math.round(x), Math.round(y), r);
  g.fill({ color: fill });
  if (stroke) g.stroke({ width: 2, color: INK });
}

function rect(g: Graphics, x: number, y: number, w: number, h: number, fill: number, stroke = true) {
  g.rect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
  g.fill({ color: fill });
  if (stroke) g.stroke({ width: 2, color: INK });
}

/** OG Sulake guest drawn in local space, feet at (0, 0). */
export function drawGuest(
  g: Graphics,
  fig: Figure,
  opts: { dir?: 0 | 1 | 2 | 3; sit?: boolean; lay?: boolean; walk?: 0 | 1 } = {}
) {
  const p = pal(fig);
  const sit = !!opts.sit && !opts.lay;
  const lay = !!opts.lay;
  const walk = opts.walk ? 2 : 0;
  const back = opts.dir === 2 || opts.dir === 3;
  const flip = opts.dir === 0 || opts.dir === 3;

  if (lay) {
    disk(g, -18, -10, 12, hex(p.hair));
    if (!back) disk(g, -12, -8, 11, hex(p.skin));
    rect(g, -2, -14, 22, 12, hex(p.top));
    rect(g, 18, -12, 8, 10, hex(p.bot));
    rect(g, 24, -8, 10, 6, hex(p.shoe));
    if (!back) {
      disk(g, -16, -10, 2, INK, false);
      disk(g, -10, -10, 2, INK, false);
    }
    return;
  }

  const drop = sit ? 10 : 0;
  const a = sit ? 0 : walk;
  const b = sit ? 0 : -walk;
  const hx = flip ? 1 : -1;

  if (p.hairName === "afro") disk(g, 0, -40, 18, hex(p.hair));
  else if (p.hairName === "pigtails") {
    disk(g, -16, -36, 6, hex(p.hair));
    disk(g, 16, -36, 6, hex(p.hair));
  } else if (p.hairName === "pony") disk(g, -14 * hx, -32, 7, hex(p.hair));

  if (sit) {
    rect(g, -12, -18, 10, 8, hex(p.bot));
    rect(g, 2, -16, 10, 8, hex(p.bot));
    rect(g, -14, -12, 10, 6, hex(p.shoe));
    rect(g, 4, -10, 10, 6, hex(p.shoe));
  } else {
    rect(g, -8, -22 + a, 7, 14, hex(p.bot));
    rect(g, 2, -20 + b, 7, 14, hex(p.bot));
    const sh = p.shoeName === "boots" ? 8 : 6;
    rect(g, -10, -10 + a, 10, sh, hex(p.shoe));
    rect(g, 2, -8 + b, 10, sh, hex(p.shoe));
  }

  const th = sit ? 14 : 16;
  rect(g, -9, -36 + drop, 18, th, hex(p.top));
  if (p.topName !== "tank") {
    rect(g, -14, -34 + drop, 6, sit ? 10 : 14, hex(p.top));
    rect(g, 8, -34 + drop, 6, sit ? 10 : 14, hex(p.top));
  }
  if (p.topName === "hoodie") {
    disk(g, 0, -38 + drop, 6, tint(p.top, -16));
    if (!back) rect(g, -1, -34 + drop, 2, 12, INK, false);
  }

  disk(g, -12, -20 + drop + a, 4, hex(p.skin));
  disk(g, 12, -20 + drop + b, 4, hex(p.skin));

  disk(g, 0, -44 + drop, 14, hex(p.skin));
  disk(g, -13, -42 + drop, 3, hex(p.skin));
  disk(g, 13, -42 + drop, 3, hex(p.skin));

  if (p.hairName === "mohawk") rect(g, -3, -62 + drop, 6, 16, hex(p.hair));
  else if (p.hairName === "spikes") {
    disk(g, -8, -56 + drop, 4, hex(p.hair));
    disk(g, 0, -60 + drop, 5, hex(p.hair));
    disk(g, 8, -56 + drop, 4, hex(p.hair));
  } else if (p.hairName === "bob" || p.hairName === "messy" || p.hairName === "side" || p.hairName === "long" || p.hairName === "bun") {
    disk(g, 0, -52 + drop, 15, hex(p.hair));
    if (p.hairName === "bun") disk(g, 0, -66 + drop, 6, hex(p.hair));
  } else if (p.hairName !== "afro") disk(g, 0, -52 + drop, 14, hex(p.hair));

  if (!back) {
    disk(g, -5, -44 + drop, 2.2, INK, false);
    disk(g, 6, -44 + drop, 2.2, INK, false);
    g.rect(-4, -36 + drop, 8, 2);
    g.fill({ color: 0xa0505a });
    if (p.girl) {
      disk(g, -10, -38 + drop, 2.2, 0xf4a7b0, false);
      disk(g, 10, -38 + drop, 2.2, 0xf4a7b0, false);
    }
  }
}

export function guestContainer(fig: Figure, opts: { dir?: 0 | 1 | 2 | 3; sit?: boolean; lay?: boolean; walk?: 0 | 1 } = {}) {
  const c = new Container();
  const g = new Graphics();
  drawGuest(g, fig, opts);
  c.addChild(g);
  const flip = opts.dir === 0 || opts.dir === 3;
  if (flip) c.scale.x = -1;
  return c;
}
