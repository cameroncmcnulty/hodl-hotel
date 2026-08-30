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

function poly(g: Graphics, pts: { sx: number; sy: number }[], fill: number, stroke = true) {
  const flat: number[] = [];
  for (const p of pts) {
    flat.push(Math.round(p.sx), Math.round(p.sy));
  }
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
  const s = 0.14;
  const wood = "#6d4c2f";
  isoBox(g, x, y, z, s, s, hh, "#8a6a3e", wood, "#4a331c");
  isoBox(g, x + w - s, y, z, s, s, hh, "#8a6a3e", wood, "#4a331c");
  isoBox(g, x, y + d - s, z, s, s, hh, "#8a6a3e", wood, "#4a331c");
  isoBox(g, x + w - s, y + d - s, z, s, s, hh, "#8a6a3e", wood, "#4a331c");
}

export function drawFurni(g: Graphics, def: FurnDef, x: number, y: number, z: number, rot: 0 | 1 | 2 | 3) {
  const { w, d } = footprint(def, rot);
  const c = def.colors;
  const h = Math.max(0.2, def.h);
  const shape = def.shape;

  if (shape === "rug" || def.finish) {
    for (let dy = 0; dy < d; dy++) for (let dx = 0; dx < w; dx++) isoDiamond(g, x + dx, y + dy, z + 0.02, (dx + dy) % 2 ? c.right : c.top);
    return;
  }
  if (shape === "sofa" || shape === "bench") {
    legs(g, x, y, z, w, d, 0.16);
    isoBox(g, x, y, z + 0.16, w, d, 0.42, c.top, c.left, c.right);
    const t = 0.28;
    if (rot === 0) isoBox(g, x, y, z + 0.58, w, t, 0.88, tintHex(c.top, -8), c.left, c.right);
    else if (rot === 1) isoBox(g, x, y, z + 0.58, t, d, 0.88, tintHex(c.top, -8), c.left, c.right);
    else if (rot === 2) isoBox(g, x, y + d - t, z + 0.58, w, t, 0.88, tintHex(c.top, -8), c.left, c.right);
    else isoBox(g, x + w - t, y, z + 0.58, t, d, 0.88, tintHex(c.top, -8), c.left, c.right);
    return;
  }
  if (shape === "chair" || shape === "armchair" || shape === "throne") {
    legs(g, x, y, z, w, d, 0.18);
    isoBox(g, x + 0.1, y + 0.1, z + 0.18, w - 0.2, d - 0.2, 0.4, c.top, c.left, c.right);
    const bh = shape === "throne" ? 1.5 : shape === "armchair" ? 1.2 : 1.05;
    const t = 0.26;
    if (rot === 0) isoBox(g, x, y, z + 0.58, w, t, bh, tintHex(c.top, -10), c.left, c.right);
    else if (rot === 1) isoBox(g, x, y, z + 0.58, t, d, bh, tintHex(c.top, -10), c.left, c.right);
    else if (rot === 2) isoBox(g, x, y + d - t, z + 0.58, w, t, bh, tintHex(c.top, -10), c.left, c.right);
    else isoBox(g, x + w - t, y, z + 0.58, t, d, bh, tintHex(c.top, -10), c.left, c.right);
    if (shape !== "chair") {
      isoBox(g, x, y, z + 0.58, 0.16, d, 0.45, c.top, c.left, c.right);
      isoBox(g, x + w - 0.16, y, z + 0.58, 0.16, d, 0.45, c.top, c.left, c.right);
    }
    return;
  }
  if (shape === "stool") {
    legs(g, x + 0.22, y + 0.22, z, w - 0.44, d - 0.44, 0.7);
    isoBox(g, x + 0.18, y + 0.18, z + 0.7, w - 0.36, d - 0.36, 0.22, c.top, c.left, c.right);
    return;
  }
  if (shape === "bean") {
    isoBox(g, x + 0.12, y + 0.12, z, w - 0.24, d - 0.24, 0.55, c.top, c.left, c.right);
    return;
  }
  if (shape === "bed" || shape === "canopy") {
    legs(g, x, y, z, w, d, 0.2);
    isoBox(g, x, y, z + 0.2, w, d, 0.28, "#8a6a3e", "#6d4c2f", "#4a331c");
    isoBox(g, x + 0.06, y + 0.06, z + 0.48, w - 0.12, d - 0.12, 0.22, c.top, c.left, c.right);
    const acc = c.accent || "#ff6b5a";
    if (rot === 0) isoBox(g, x + 0.1, y + 0.08, z + 0.7, w - 0.2, 0.32, 0.2, acc, c.left, c.right);
    else if (rot === 1) isoBox(g, x + 0.08, y + 0.1, z + 0.7, 0.32, d - 0.2, 0.2, acc, c.left, c.right);
    else if (rot === 2) isoBox(g, x + 0.1, y + d - 0.4, z + 0.7, w - 0.2, 0.32, 0.2, acc, c.left, c.right);
    else isoBox(g, x + w - 0.4, y + 0.1, z + 0.7, 0.32, d - 0.2, 0.2, acc, c.left, c.right);
    return;
  }
  if (shape === "lamp" || shape === "solamp") {
    isoBox(g, x + 0.4, y + 0.4, z, 0.2, 0.2, 1.5, c.left, c.left, c.right);
    isoBox(g, x + 0.22, y + 0.22, z + 1.45, 0.56, 0.56, 0.45, c.top, tintHex(c.top, -22), c.right);
    return;
  }
  if (shape === "palm" || shape === "cactus" || shape === "hedge" || shape === "flower" || shape === "tree") {
    isoBox(g, x + 0.28, y + 0.28, z, 0.44, 0.44, 0.38, c.left, tintHex(c.left, -20), c.left);
    isoBox(g, x + 0.42, y + 0.42, z + 0.38, 0.16, 0.16, 0.7, tintHex(c.left, -10), tintHex(c.left, -28), c.left);
    isoBox(g, x + 0.1, y + 0.22, z + 1.05, 0.8, 0.36, 0.28, c.top, tintHex(c.top, -25), c.right);
    isoBox(g, x + 0.22, y + 0.08, z + 1.15, 0.36, 0.72, 0.22, tintHex(c.top, 12), tintHex(c.top, -20), c.right);
    return;
  }
  if (shape === "table" || shape === "desk" || shape === "chess") {
    legs(g, x, y, z, w, d, Math.max(0.45, h - 0.18));
    isoBox(g, x, y, z + Math.max(0.45, h - 0.18), w, d, 0.16, c.top, c.left, c.right);
    return;
  }
  isoBox(g, x, y, z, w, d, h, c.top, c.left, c.right);
}

function tintHex(s: string, amt: number) {
  const [r, g, b] = mix(s, amt);
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
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

  // hair behind
  if (p.hairName === "afro") disk(g, 0, -40, 18, hex(p.hair));
  else if (p.hairName === "pigtails") {
    disk(g, -16, -36, 6, hex(p.hair));
    disk(g, 16, -36, 6, hex(p.hair));
  } else if (p.hairName === "pony") disk(g, -14 * hx, -32, 7, hex(p.hair));

  // legs / shoes
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

  // torso + arms
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

  // hands
  disk(g, -12, -20 + drop + a, 4, hex(p.skin));
  disk(g, 12, -20 + drop + b, 4, hex(p.skin));

  // head
  disk(g, 0, -44 + drop, 14, hex(p.skin));
  disk(g, -13, -42 + drop, 3, hex(p.skin));
  disk(g, 13, -42 + drop, 3, hex(p.skin));

  // hair front
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
