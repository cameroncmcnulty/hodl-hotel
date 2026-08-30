/**
 * Habbo-style figure compositor.
 *
 * A look is a recipe, not an image:
 *   hd-{gender}-{skin}.hr-{style}-{color}.ch-{cut}-{color}.lg-{cut}-{color}.sh-{cut}-{color}
 *
 * Each frame: parse → look up the set → paint that slot on the locked rig →
 * palette-dye → blit in a fixed draw order. Swap `ch-0-0` for `ch-1-3` and
 * only the shirt layer changes.
 */
import type { Figure } from "../types";
import { hexMix, mix, Pix, rgb } from "./pix";

export const LOOK_W = 96;
export const LOOK_H = 176;
export const LOOK_SCALE = 1;
export const LOOK_N = 1;

export const SKIN = ["#f3d4c4", "#e8c4a8", "#d4a574", "#c48a56", "#b56c3a", "#8d4e24", "#6b3a20", "#3a1c10"];
export const HAIR_BOY_C = ["#8b5a2b", "#5c3317", "#1b1b1b", "#e8d07a", "#c45c26", "#4a2c0a"];
export const HAIR_GIRL_C = ["#8b5a2b", "#1a1a1a", "#111111", "#e8d07a", "#c45c26", "#ff8fab"];
export const HAIR_C = HAIR_BOY_C;

export const HAIR_BOY = ["messy", "side", "afro", "spikes", "mohawk"];
export const HAIR_GIRL = ["pony", "bob", "long", "pigtails", "bun"];
export const TOP_BOY = ["hoodie", "tee", "jacket", "tank"];
export const TOP_GIRL = ["hoodie", "tee", "jacket", "tank"];
export const BOT_BOY = ["pants", "shorts", "jeans"];
export const BOT_GIRL = ["skirt", "pants", "shorts"];
export const SHOE_BOY = ["sneakers", "boots", "slides"];
export const SHOE_GIRL = ["sneakers", "boots", "slides"];
export const HATS = ["none"];
export const HAIR_STYLES = HAIR_BOY;
export const TOP_CUTS = TOP_BOY;
export const BOT_CUTS = BOT_GIRL;
export const ACC = ["none"];
export const GENDERS = ["boy", "girl"];
export const SKIN_N = 8;
export const COLOR_N = 8;
export const HAIR_COLOR_N = 6;

/** One dye row for every garment. Color 0 is always white, 2 is always red. */
export const DYE = ["#f4f4f6", "#8a8f98", "#2a2a32", "#c41e3a", "#2563eb", "#166534", "#7c3aed", "#fb7185"];
export const TOPS = DYE;
export const BOTTOMS = DYE;
export const SHOES = DYE;

export function hairsFor(gender: number) {
  return gender === 1 ? HAIR_GIRL : HAIR_BOY;
}
export function topsFor(gender: number) {
  return gender === 1 ? TOP_GIRL : TOP_BOY;
}
export function botsFor(gender: number) {
  return gender === 1 ? BOT_GIRL : BOT_BOY;
}
export function shoesFor(gender: number) {
  return gender === 1 ? SHOE_GIRL : SHOE_BOY;
}
export function hatsFor(_gender?: number) {
  return HATS;
}
export function facesFor(_gender: number) {
  return ["oval"];
}
export function defaultHairName(gender: number) {
  return gender === 1 ? "pony" : "messy";
}
export function hairColors(gender: number) {
  return gender === 1 ? HAIR_GIRL_C : HAIR_BOY_C;
}
export function topColors(_gender?: number, _cut?: number) {
  return DYE;
}
export function botColors(_gender?: number, _cut?: number) {
  return DYE;
}
export function shoeColors(_gender?: number, _cut?: number) {
  return DYE;
}
export function hatColors(_gender?: number) {
  return DYE;
}

export const ITEM_LABEL: Record<string, string> = {
  messy: "Messy",
  side: "Side part",
  afro: "Afro",
  spikes: "Spikes",
  mohawk: "Mohawk",
  pony: "Ponytail",
  bob: "Bob",
  long: "Long",
  pigtails: "Pigtails",
  bun: "Bun",
  hoodie: "Hoodie",
  tee: "T-shirt",
  jacket: "Jacket",
  tank: "Tank",
  pants: "Pants",
  shorts: "Shorts",
  jeans: "Jeans",
  skirt: "Skirt",
  sneakers: "Sneakers",
  boots: "Boots",
  slides: "Slides",
};

export const DEFAULT_FIGURE: Figure = {
  gender: 0,
  look: 0,
  skin: 1,
  hair: 0,
  hairColor: 0,
  top: 1,
  bottom: 2,
  shoes: 3,
  acc: 0,
  topCut: 0,
  botCut: 0,
  shoeCut: 0,
  eyes: 0,
  face: 0,
  hat: 0,
  hatColor: 2,
};

export function clampFigure(f: Partial<Figure> | undefined): Figure {
  const n = (v: unknown, max: number) => Math.max(0, Math.min(max, Number(v) || 0));
  const gender = n(f?.gender, GENDERS.length - 1);
  return {
    gender,
    look: n(f?.look, Math.max(0, LOOK_N - 1)),
    skin: n(f?.skin, SKIN_N - 1),
    hair: n(f?.hair, hairsFor(gender).length - 1),
    hairColor: n(f?.hairColor, HAIR_COLOR_N - 1),
    top: n(f?.top, COLOR_N - 1),
    bottom: n(f?.bottom, COLOR_N - 1),
    shoes: n(f?.shoes, COLOR_N - 1),
    acc: n(f?.hat ?? f?.acc, HATS.length - 1),
    topCut: n(f?.topCut, topsFor(gender).length - 1),
    botCut: n(f?.botCut, botsFor(gender).length - 1),
    shoeCut: n(f?.shoeCut, shoesFor(gender).length - 1),
    eyes: 0,
    face: 0,
    hat: n(f?.hat ?? f?.acc, HATS.length - 1),
    hatColor: n(f?.hatColor, COLOR_N - 1),
  };
}

export type LookOpts = { back?: boolean; walk?: 0 | 1; sit?: boolean; view?: 0 | 1 | 2 | 3 };

type RGB = [number, number, number];
const INK: RGB = [12, 8, 14];
const WHITE: RGB = [255, 255, 255];
const BASE = "#8c8c8c";
const CX = 48;

/**
 * Style lock: the 8-view isometric hotel sprites (compact 3/4, strand hair,
 * zip hoodie, chunky boots). Same 2:1 dimetric lighting as the furniture.
 * Feet stay near the canvas bottom so the sprite plants on a tile.
 */
const R = {
  headX: 48,
  headY: 72,
  headRx: 22,
  headRy: 22,
  earLX: 26,
  earLY: 74,
  earRX: 70,
  earRY: 72,
  torsoX: 38,
  torsoY: 96,
  torsoW: 20,
  torsoH: 14,
  armW: 6,
  armH: 14,
  armLX: 30,
  armLY: 98,
  armRX: 60,
  armRY: 96,
  handLX: 32,
  handLY: 112,
  handRX: 62,
  handRY: 110,
  legW: 7,
  legH: 14,
  legLX: 38,
  legLY: 108,
  legRX: 50,
  legRY: 106,
  shoeW: 11,
  shoeH: 7,
  shoeLX: 36,
  shoeLY: 120,
  shoeRX: 50,
  shoeRY: 118,
};

function onFace(x: number, y: number) {
  const dx = (x - CX) / 16;
  const dy = (y - (R.headY + 2)) / 16;
  return dx * dx + dy * dy < 1;
}

const partCache = new Map<string, Pix>();

export function figureString(fig: Figure) {
  const f = clampFigure(fig);
  const g = f.gender ?? 0;
  return [
    `hd-${g}-${f.skin}`,
    `hr-${f.hair}-${f.hairColor}`,
    `ch-${f.topCut ?? 0}-${f.top}`,
    `lg-${f.botCut ?? 0}-${f.bottom}`,
    `sh-${f.shoeCut ?? 0}-${f.shoes}`,
    `ha-${f.hat ?? 0}-${f.hatColor ?? 0}`,
  ].join(".");
}

function palOf(f: Figure) {
  const g = f.gender ?? 0;
  return {
    skin: SKIN[f.skin] || SKIN[1],
    hair: hairColors(g)[f.hairColor] || HAIR_BOY_C[0],
    top: topColors(g, f.topCut ?? 0)[f.top] || TOPS[0],
    bot: botColors(g, f.botCut ?? 0)[f.bottom] || BOTTOMS[0],
    shoe: shoeColors()[f.shoes] || SHOES[0],
    hat: hatColors()[f.hatColor ?? 0] || DYE[2],
  };
}

function lum(r: number, g: number, b: number) {
  return r * 0.3 + g * 0.54 + b * 0.16;
}

function dye(src: Pix, hex: string) {
  const [tr, tg, tb] = rgb(hex);
  const out = new Pix(src.w, src.h);
  for (let i = 0; i < src.d.length; i += 4) {
    if (src.d[i + 3] < 8) continue;
    const r = src.d[i],
      g = src.d[i + 1],
      b = src.d[i + 2];
    const L = lum(r, g, b);
    if (L < 40) {
      out.d[i] = INK[0];
      out.d[i + 1] = INK[1];
      out.d[i + 2] = INK[2];
      out.d[i + 3] = 255;
      continue;
    }
    if (L > 235) {
      out.d[i] = 255;
      out.d[i + 1] = 255;
      out.d[i + 2] = 255;
      out.d[i + 3] = 255;
      continue;
    }
    const k = Math.max(0.22, Math.min(1.25, L / 155));
    out.d[i] = Math.max(0, Math.min(255, Math.round(tr * k)));
    out.d[i + 1] = Math.max(0, Math.min(255, Math.round(tg * k)));
    out.d[i + 2] = Math.max(0, Math.min(255, Math.round(tb * k)));
    out.d[i + 3] = 255;
  }
  return out;
}

function finish(p: Pix) {
  return p;
}

function blank() {
  return new Pix(LOOK_W, LOOK_H);
}

function flipH(src: Pix) {
  const p = new Pix(src.w, src.h);
  for (let y = 0; y < src.h; y++) {
    for (let x = 0; x < src.w; x++) {
      const i = (y * src.w + (src.w - 1 - x)) * 4;
      if (src.d[i + 3] < 8) continue;
      p.set(x, y, [src.d[i], src.d[i + 1], src.d[i + 2]], src.d[i + 3]);
    }
  }
  return p;
}

function pose(walk: number, sit: boolean) {
  const drop = sit ? 16 : 0;
  const a = sit ? 0 : walk ? 3 : 0;
  const b = sit ? 0 : walk ? -3 : 0;
  return { drop, a, b, sit };
}

/** Soft sticker ball: mostly mid, thin NW light / SE shade, one highlight. */
function ball(p: Pix, cx: number, cy: number, rx: number, ry: number, hex: string) {
  const lit = mix(hex, 28);
  const mid = rgb(hex);
  const dim = mix(hex, -30);
  const hi = mix(hex, 52);
  const rx2 = rx * rx || 1;
  const ry2 = ry * ry || 1;
  for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++) {
    for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) {
      const dx = x - cx;
      const dy = y - cy;
      const n = (dx * dx) / rx2 + (dy * dy) / ry2;
      if (n > 1.02) continue;
      const t = dx / (rx * 2) + dy / (ry * 2);
      p.set(x, y, t < -0.52 ? lit : t > 0.5 ? dim : mid);
    }
  }
  p.disc(cx - rx * 0.4, cy - ry * 0.44, Math.max(2, rx * 0.14), Math.max(1.5, ry * 0.1), hi);
}

function blob(p: Pix, cx: number, cy: number, rx: number, ry: number, hex: string) {
  p.disc(cx, cy, rx, ry, rgb(hex));
}

/** Tapered hair strand. ang=0 is straight up. */
function tuft(p: Pix, cx: number, cy: number, ang: number, len: number, w: number, hex: string) {
  const dx = Math.sin(ang) * len;
  const dy = -Math.cos(ang) * len;
  const steps = Math.max(4, Math.round(len));
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const r = Math.max(1.1, w * (1 - t * 0.7));
    blob(p, cx + dx * t, cy + dy * t, r, r * 1.15, hex);
  }
}

function bangs(p: Pix, hex: string) {
  tuft(p, 36, R.headY - 14, -2.7, 7, 2.6, hex);
  tuft(p, 42, R.headY - 16, -2.95, 8, 2.8, hex);
  tuft(p, 48, R.headY - 17, 3.14, 7, 2.6, hex);
  tuft(p, 54, R.headY - 16, 2.95, 8, 2.8, hex);
  tuft(p, 60, R.headY - 14, 2.7, 7, 2.6, hex);
}

/** One rim pass over a merged silhouette — furniture lighting, no inner rings. */
function rimShade(p: Pix, hex: string) {
  const lit = mix(hex, 24);
  const dim = mix(hex, -28);
  const mid = rgb(hex);
  for (let y = 0; y < p.h; y++) {
    for (let x = 0; x < p.w; x++) {
      if (p.a(x, y) < 8) continue;
      const nw = p.a(x - 1, y) < 8 || p.a(x, y - 1) < 8;
      const se = p.a(x + 1, y) < 8 || p.a(x, y + 1) < 8;
      p.set(x, y, nw ? lit : se ? dim : mid);
    }
  }
}

function chunk(p: Pix, x: number, y: number, w: number, h: number, hex: string) {
  p.roundBlock(x, y, w, h, Math.min(4, Math.floor(w / 3)), hex);
}

function maskFace(src: Pix) {
  const p = blank();
  for (let y = 0; y < src.h; y++) {
    for (let x = 0; x < src.w; x++) {
      if (src.a(x, y) < 8) continue;
      if (onFace(x, y)) continue;
      const i = (y * src.w + x) * 4;
      p.set(x, y, [src.d[i], src.d[i + 1], src.d[i + 2]], src.d[i + 3]);
    }
  }
  return p;
}

/** bd — stubby torso, arms, legs. No head. Clothes cover this. */
function partBd(girl: boolean, walk: number, sit: boolean): Pix {
  const p = blank();
  const { drop, a, b } = pose(walk, sit);
  const tw = girl ? 24 : 26;
  const tx = CX - Math.floor(tw / 2);
  p.capsule(R.armLX, R.armLY + drop, R.armW, sit ? 16 : R.armH, BASE);
  p.capsule(R.armRX, R.armRY + drop, R.armW, sit ? 16 : R.armH, BASE);
  p.trap(tx + 2, tx + tw - 2, R.torsoY + drop, tx - 1, tx + tw + 1, R.torsoY + drop + (sit ? 16 : R.torsoH), BASE);
  if (sit) {
    chunk(p, R.legLX - 2, R.legLY + drop - 8, 16, 12, BASE);
    chunk(p, R.legRX - 2, R.legRY + drop - 6, 16, 12, BASE);
    p.capsule(R.legLX + 1, R.legLY + drop + 2, 9, 16, BASE);
    p.capsule(R.legRX + 1, R.legRY + drop + 4, 9, 16, BASE);
  } else {
    p.capsule(R.legLX, R.legLY + drop + a, R.legW, R.legH, BASE);
    p.capsule(R.legRX, R.legRY + drop + b, R.legW, R.legH, BASE);
  }
  return finish(p);
}

/** hd — giant round skull. Chin sits on the collar. */
function partHd(): Pix {
  const p = blank();
  p.discShade(R.headX, R.headY, R.headRx, R.headRy, BASE);
  p.discShade(R.earLX, R.earLY, 3, 3.4, BASE);
  p.discShade(R.earRX, R.earRY, 3, 3.4, BASE);
  return finish(p);
}

/** fc — small hotel-guest eyes and a tiny smile. Never dyed. */
function partFc(girl: boolean): Pix {
  const p = blank();
  const ey = R.headY + 2;
  p.disc(42, ey, 2.2, 2.6, WHITE);
  p.disc(54, ey, 2.2, 2.6, WHITE);
  p.disc(42, ey + 0.4, 1.1, 1.3, INK);
  p.disc(54, ey + 0.4, 1.1, 1.3, INK);
  const my = R.headY + 12;
  p.rect(45, my, 6, 1, [180, 90, 100]);
  if (girl) {
    p.disc(36, ey + 7, 2, 1.4, rgb("#f4a7b0"));
    p.disc(60, ey + 7, 2, 1.4, rgb("#f4a7b0"));
  }
  return p;
}

/** hrb — hair behind the skull (tails). */
function partHrb(style: string): Pix {
  const p = blank();
  if (style === "pony") {
    blob(p, 22, R.headY - 2, 7, 8, BASE);
    tuft(p, 20, R.headY + 6, -2.4, 28, 4.2, BASE);
    tuft(p, 24, R.headY + 8, -2.2, 26, 3.4, BASE);
    blob(p, 20, R.headY + 34, 7, 7, BASE);
  } else if (style === "pigtails") {
    blob(p, 18, R.headY + 2, 6, 6, BASE);
    blob(p, 78, R.headY, 6, 6, BASE);
    tuft(p, 18, R.headY + 8, -2.3, 18, 3.4, BASE);
    tuft(p, 78, R.headY + 6, 2.3, 18, 3.4, BASE);
    blob(p, 16, R.headY + 26, 6, 6, BASE);
    blob(p, 80, R.headY + 24, 6, 6, BASE);
  } else if (style === "long") {
    tuft(p, 22, R.headY + 6, -2.2, 36, 4.5, BASE);
    tuft(p, 26, R.headY + 10, -2.0, 34, 3.6, BASE);
    tuft(p, 70, R.headY + 6, 2.2, 36, 4.5, BASE);
    tuft(p, 66, R.headY + 10, 2.0, 34, 3.6, BASE);
    blob(p, 24, R.headY + 42, 7, 7, BASE);
    blob(p, 72, R.headY + 42, 7, 7, BASE);
  }
  rimShade(p, BASE);
  return finish(p);
}

/** hr — hair that actually reads as hair: strands, bangs, shine. */
function partHr(style: string, back: boolean): Pix {
  const raw = blank();
  if (back) {
    blob(raw, CX, R.headY - 4, 24, 24, BASE);
    tuft(raw, 28, R.headY - 8, -0.9, 14, 4, BASE);
    tuft(raw, 48, R.headY - 18, 0, 12, 4.5, BASE);
    tuft(raw, 68, R.headY - 8, 0.9, 14, 4, BASE);
  }
  if (style === "afro") {
    blob(raw, CX, R.headY - 8, 26, 24, BASE);
    const spots = [
      [24, -6, 9],
      [72, -8, 9],
      [36, -24, 8],
      [60, -24, 8],
      [48, -28, 9],
      [20, 6, 7],
      [76, 4, 7],
      [30, -16, 7],
      [66, -16, 7],
    ];
    for (const [x, dy, r] of spots) blob(raw, x, R.headY + dy, r, r, BASE);
  } else if (style === "mohawk") {
    raw.rect(44, R.headY - 18, 8, 16, rgb(BASE));
    tuft(raw, CX, R.headY - 18, 0, 22, 4.2, BASE);
    tuft(raw, CX - 3, R.headY - 16, -0.15, 18, 3.2, BASE);
    tuft(raw, CX + 3, R.headY - 16, 0.15, 18, 3.2, BASE);
  } else if (style === "spikes") {
    blob(raw, CX, R.headY - 12, 14, 8, BASE);
    tuft(raw, 32, R.headY - 8, -0.7, 18, 3.4, BASE);
    tuft(raw, 42, R.headY - 14, -0.25, 20, 3.8, BASE);
    tuft(raw, 48, R.headY - 16, 0, 22, 4.2, BASE);
    tuft(raw, 54, R.headY - 14, 0.25, 20, 3.8, BASE);
    tuft(raw, 64, R.headY - 8, 0.7, 18, 3.4, BASE);
  } else if (style === "side") {
    blob(raw, CX, R.headY - 12, 20, 14, BASE);
    blob(raw, 30, R.headY - 8, 12, 12, BASE);
    tuft(raw, 28, R.headY - 10, -0.9, 16, 4.2, BASE);
    tuft(raw, 34, R.headY - 16, -0.4, 14, 3.6, BASE);
    tuft(raw, 48, R.headY - 18, 0.1, 10, 3.2, BASE);
    bangs(raw, BASE);
  } else if (style === "bob") {
    blob(raw, CX, R.headY - 12, 22, 15, BASE);
    blob(raw, 26, R.headY - 2, 9, 10, BASE);
    blob(raw, 70, R.headY - 4, 9, 10, BASE);
    bangs(raw, BASE);
  } else if (style === "bun") {
    blob(raw, CX, R.headY - 12, 20, 14, BASE);
    blob(raw, CX, R.headY - 30, 9, 8, BASE);
    tuft(raw, 44, R.headY - 28, -0.5, 8, 2.4, BASE);
    tuft(raw, 52, R.headY - 28, 0.5, 8, 2.4, BASE);
    bangs(raw, BASE);
  } else if (style === "pony" || style === "pigtails" || style === "long") {
    blob(raw, CX, R.headY - 14, 21, 14, BASE);
    blob(raw, 28, R.headY - 10, 9, 9, BASE);
    blob(raw, 68, R.headY - 12, 9, 9, BASE);
    bangs(raw, BASE);
  } else {
    blob(raw, CX, R.headY - 14, 22, 15, BASE);
    blob(raw, 28, R.headY - 10, 10, 10, BASE);
    blob(raw, 68, R.headY - 12, 10, 10, BASE);
    tuft(raw, 36, R.headY - 18, -0.45, 14, 3.6, BASE);
    tuft(raw, 48, R.headY - 22, 0.05, 16, 4, BASE);
    tuft(raw, 58, R.headY - 18, 0.4, 14, 3.6, BASE);
    tuft(raw, 30, R.headY - 8, -0.85, 12, 3.2, BASE);
    bangs(raw, BASE);
  }
  raw.rect(36, R.headY - 16, 1, 8, WHITE);
  raw.rect(40, R.headY - 18, 1, 6, WHITE);
  rimShade(raw, BASE);
  return finish(back ? raw : maskFace(raw));
}

/** lg — trousers / skirt with pockets, stitch, waistband. */
function partLg(name: string, girl: boolean, walk: number, sit: boolean): Pix {
  const p = blank();
  const { drop, a, b } = pose(walk, sit);
  const skirt = girl && name === "skirt";
  const short = name === "shorts";
  const h = sit ? 14 : short ? 14 : 26;
  const stitch = mix(BASE, 48);
  if (skirt) {
    const y0 = R.torsoY + drop + 16;
    p.trap(CX - 11, CX + 11, y0, CX - 20, CX + 20, y0 + 22, BASE);
    chunk(p, CX - 13, y0, 26, 5, hexMix(BASE, -18));
    p.rect(38, y0 + 6, 1, 14, mix(BASE, -46));
    p.rect(44, y0 + 6, 1, 16, mix(BASE, -46));
    p.rect(52, y0 + 6, 1, 16, mix(BASE, -46));
    p.rect(58, y0 + 6, 1, 14, mix(BASE, -46));
    p.rect(CX - 8, y0 + 1, 16, 1, stitch);
    return finish(p);
  }
  if (sit) {
    chunk(p, R.legLX - 2, R.legLY + drop - 10, 16, 14, BASE);
    chunk(p, R.legRX - 2, R.legRY + drop - 8, 16, 14, BASE);
    p.capsule(R.legLX, R.legLY + drop + 2, 10, 14, BASE);
    p.capsule(R.legRX, R.legRY + drop + 4, 10, 14, BASE);
    return finish(p);
  }
  p.capsule(R.legLX - 1, R.legLY + drop + a, R.legW + 2, h, BASE);
  p.capsule(R.legRX - 1, R.legRY + drop + b, R.legW + 2, h, BASE);
  chunk(p, R.legLX - 1, R.legLY + drop - 4, 28, 10, BASE);
  p.rect(47, R.legLY + drop - 2, 1, 8, INK);
  chunk(p, R.legLX + 1, R.legLY + drop + 2, 7, 6, hexMix(BASE, -14));
  if (name === "jeans") {
    p.rect(40, R.legLY + drop + 2, 1, 18, stitch);
    p.rect(56, R.legLY + drop, 1, 18, stitch);
    p.rect(R.legLX + 2, R.legLY + drop + 3, 5, 1, stitch);
  }
  if (short) {
    p.rect(R.legLX, R.legLY + drop + h - 2, R.legW + 2, 2, mix(BASE, -20));
    p.rect(R.legRX, R.legRY + drop + h - 2, R.legW + 2, 2, mix(BASE, -20));
  }
  return finish(p);
}

/** ch — real garments: hood, pocket, cuffs, zipper, collar. */
function partCh(name: string, back: boolean, sit: boolean): Pix {
  const p = blank();
  const drop = sit ? 16 : 0;
  const sleeveH = sit ? 14 : name === "tee" ? 12 : 20;
  const y = R.torsoY + drop;
  p.trap(R.torsoX + 2, R.torsoX + R.torsoW - 2, y, R.torsoX - 1, R.torsoX + R.torsoW + 1, y + (sit ? 18 : R.torsoH + 2), BASE);
  ball(p, CX, y + 3, 10, 5, BASE);
  if (name !== "tank") {
    p.capsule(R.armLX, R.armLY + drop, R.armW, sleeveH, BASE);
    p.capsule(R.armRX, R.armRY + drop, R.armW, sleeveH, BASE);
  }
  if (name === "hoodie") {
    blob(p, CX, y - 4, 8, 5, hexMix(BASE, -12));
    if (!back) {
      p.rect(47, y, 1, 14, INK);
      for (let i = 0; i < 4; i++) p.set(47, y + 2 + i * 3, WHITE);
      chunk(p, 40, y + 8, 16, 6, hexMix(BASE, -18));
    }
    p.rect(R.armLX, R.armLY + drop + sleeveH - 2, R.armW, 2, mix(BASE, -22));
    p.rect(R.armRX, R.armRY + drop + sleeveH - 2, R.armW, 2, mix(BASE, -22));
    if (back) blob(p, CX, y - 8, 11, 8, hexMix(BASE, -14));
  } else if (name === "tee") {
    blob(p, CX, y + 2, 8, 4, hexMix(BASE, -16));
    p.rect(R.armLX, R.armLY + drop + sleeveH - 2, R.armW, 2, mix(BASE, -20));
    p.rect(R.armRX, R.armRY + drop + sleeveH - 2, R.armW, 2, mix(BASE, -20));
    p.rect(42, y + 10, 12, 1, mix(BASE, -30));
  } else if (name === "jacket") {
    chunk(p, 44, y, 8, 22, "#d8d0c4");
    p.rect(47, y + 2, 1, 18, INK);
    for (let i = 0; i < 6; i++) p.set(47, y + 4 + i * 3, WHITE);
    chunk(p, R.torsoX, y + 12, 7, 6, hexMix(BASE, -18));
    chunk(p, R.torsoX + R.torsoW - 7, y + 12, 7, 6, hexMix(BASE, -18));
    blob(p, CX, y + 2, 6, 3, hexMix(BASE, -12));
  } else if (name === "tank") {
    chunk(p, 37, y - 2, 6, 10, hexMix(BASE, -14));
    chunk(p, 53, y - 2, 6, 10, hexMix(BASE, -14));
    blob(p, CX, y + 2, 7, 3, hexMix(BASE, -10));
  }
  return finish(p);
}

/** rh — hands over cuffs so sleeves never swallow them. */
function partRh(walk: number, sit: boolean): Pix {
  const p = blank();
  const { drop, a, b } = pose(walk, sit);
  const hy = sit ? -6 : 0;
  ball(p, R.handLX, R.handLY + drop + a + hy, 5, 4.4, BASE);
  ball(p, R.handRX, R.handRY + drop + b + hy, 5, 4.4, BASE);
  return finish(p);
}

/** sh — sneakers with laces, boots with cuff, slides with strap. */
function partSh(name: string, walk: number, sit: boolean): Pix {
  const p = blank();
  const { drop, a, b } = pose(walk, sit);
  const yL = R.shoeLY + drop + (sit ? -6 : 0);
  const yR = R.shoeRY + drop + (sit ? -6 : 0);
  if (name === "slides") {
    ball(p, 40, yL + a + 4, 8, 4.5, BASE);
    ball(p, 56, yR + b + 4, 8, 4.5, BASE);
    p.rect(34, yL + a + 2, 12, 3, mix(BASE, -18));
    p.rect(50, yR + b + 2, 12, 3, mix(BASE, -18));
    return finish(p);
  }
  const lift = name === "boots" ? 10 : 0;
  chunk(p, R.shoeLX, yL + a - lift, R.shoeW, R.shoeH + lift, BASE);
  chunk(p, R.shoeRX, yR + b - lift, R.shoeW, R.shoeH + lift, BASE);
  ball(p, R.shoeLX + 10, yL + a + 4, 6, 3.5, BASE);
  ball(p, R.shoeRX + 10, yR + b + 4, 6, 3.5, BASE);
  p.roundBlock(R.shoeLX, yL + a + R.shoeH - 3, R.shoeW, 3, 1, "#f2f2f4");
  p.roundBlock(R.shoeRX, yR + b + R.shoeH - 3, R.shoeW, 3, 1, "#f2f2f4");
  if (name === "sneakers") {
    p.rect(R.shoeLX + 3, yL + a + 1, 6, 1, WHITE);
    p.rect(R.shoeLX + 3, yL + a + 3, 6, 1, WHITE);
    p.rect(R.shoeRX + 3, yR + b + 1, 6, 1, WHITE);
    p.rect(R.shoeRX + 3, yR + b + 3, 6, 1, WHITE);
  }
  if (name === "boots") {
    p.rect(R.shoeLX, yL + a - 2, R.shoeW, 2, mix(BASE, -22));
    p.rect(R.shoeRX, yR + b - 2, R.shoeW, 2, mix(BASE, -22));
    p.rect(R.shoeLX + 4, yL + a - 6, 5, 2, WHITE);
    p.rect(R.shoeRX + 4, yR + b - 6, 5, 2, WHITE);
  }
  return finish(p);
}

const HAT_HIDE = new Set(["beanie", "cap", "bucket"]);

/** ha — hats. Beanie/cap/bucket hide hair. */
function partHa(name: string, back: boolean): Pix {
  const p = blank();
  if (name === "none") return p;
  const y = R.headY;
  if (name === "beanie") {
    blob(p, CX, y - 16, 20, 14, BASE);
    chunk(p, 28, y - 8, 40, 7, hexMix(BASE, -16));
    for (let i = 0; i < 6; i++) p.rect(32 + i * 6, y - 22, 1, 10, mix(BASE, -36));
    p.disc(CX, y - 28, 3.5, 3, WHITE);
  } else if (name === "cap") {
    blob(p, CX, y - 16, 18, 11, BASE);
    if (!back) p.trap(32, 64, y - 8, 24, 72, y - 1, hexMix(BASE, -14));
    p.disc(CX, y - 24, 3, 2.6, WHITE);
  } else if (name === "bucket") {
    blob(p, CX, y - 14, 16, 11, BASE);
    p.disc(CX, y - 4, 26, 5, rgb(hexMix(BASE, -8)));
    p.rect(30, y - 10, 36, 1, mix(BASE, -36));
  } else if (name === "visor") {
    chunk(p, 30, y - 10, 36, 4, BASE);
    if (!back) p.trap(30, 66, y - 8, 22, 74, y - 1, hexMix(BASE, -12));
  } else if (name === "bow") {
    blob(p, 26, y - 8, 8, 6, BASE);
    blob(p, 38, y - 8, 8, 6, BASE);
    blob(p, 32, y - 6, 4, 4, hexMix(BASE, -20));
    tuft(p, 24, y - 6, -1.2, 8, 2.2, BASE);
    tuft(p, 40, y - 6, 1.2, 8, 2.2, BASE);
  }
  rimShade(p, BASE);
  return finish(p);
}

function cached(key: string, make: () => Pix) {
  const hit = partCache.get(key);
  if (hit) return hit;
  const p = make();
  if (partCache.size > 400) {
    const first = partCache.keys().next().value;
    if (first) partCache.delete(first);
  }
  partCache.set(key, p);
  return p;
}

export function paintLook(fig: Figure, opts: LookOpts = {}): Pix {
  const f = clampFigure(fig);
  const pal = palOf(f);
  const g = f.gender ?? 0;
  const girl = g === 1;
  const view = opts.view ?? (opts.back ? 2 : 1);
  const back = view === 2 || view === 3;
  const walk = opts.walk ?? 0;
  const sit = !!opts.sit;
  const hairName = hairsFor(g)[f.hair] || defaultHairName(g);
  const topName = topsFor(g)[f.topCut ?? 0] || "hoodie";
  const botName = botsFor(g)[f.botCut ?? 0] || (girl ? "skirt" : "pants");
  const shoeName = shoesFor(g)[f.shoeCut ?? 0] || "sneakers";
  const hrb = cached(`hrb.${hairName}`, () => dye(partHrb(hairName), pal.hair));
  const bd = cached(`bd.${pal.skin}.${girl}.${walk}.${sit}`, () => dye(partBd(girl, walk, sit), pal.skin));
  const sh = cached(`sh.${shoeName}.${pal.shoe}.${walk}.${sit}`, () => dye(partSh(shoeName, walk, sit), pal.shoe));
  const lg = cached(`lg.${botName}.${pal.bot}.${girl}.${walk}.${sit}`, () => dye(partLg(botName, girl, walk, sit), pal.bot));
  const ch = cached(`ch.${topName}.${pal.top}.${back}.${sit}`, () => dye(partCh(topName, back, sit), pal.top));
  const rh = cached(`rh.${pal.skin}.${walk}.${sit}`, () => dye(partRh(walk, sit), pal.skin));
  const hd = cached(`hd.${pal.skin}`, () => dye(partHd(), pal.skin));
  const hr = cached(`hr.${hairName}.${pal.hair}.${back}`, () => dye(partHr(hairName, back), pal.hair));
  const fc = cached(`fc.${girl}`, () => partFc(girl));

  const out = blank();
  out.blit(hrb);
  out.blit(bd);
  out.blit(sh);
  out.blit(lg);
  out.blit(ch);
  out.blit(rh);
  out.blit(hd);
  out.blit(hr);
  if (!back) out.blit(fc);
  out.outline(INK);
  if (view === 0 || view === 3) return flipH(out);
  return out;
}

export type ThumbZone = "head" | "chest" | "legs" | "full";
export const THUMB_BOX: Record<ThumbZone, { x: number; y: number; w: number; h: number }> = {
  head: { x: 22, y: 46, w: 52, h: 52 },
  chest: { x: 24, y: 88, w: 48, h: 32 },
  legs: { x: 24, y: 106, w: 48, h: 32 },
  full: { x: 16, y: 46, w: 64, h: 86 },
};

export function paintThumb(fig: Figure, zone: ThumbZone = "full"): Pix {
  const src = paintLook(fig);
  const b = THUMB_BOX[zone];
  const out = new Pix(b.w, b.h);
  for (let y = 0; y < b.h; y++) {
    for (let x = 0; x < b.w; x++) {
      const i = ((b.y + y) * src.w + (b.x + x)) * 4;
      if (i < 0 || b.y + y >= src.h || b.x + x >= src.w) continue;
      if (src.d[i + 3] < 8) continue;
      out.set(x, y, [src.d[i], src.d[i + 1], src.d[i + 2]], src.d[i + 3]);
    }
  }
  return out;
}

export function lookKey(fig: Figure, opts: LookOpts = {}) {
  const f = clampFigure(fig);
  const view = opts.view ?? (opts.back ? 2 : 1);
  return [
    figureString(f),
    view,
    opts.walk ?? 0,
    opts.sit ? 1 : 0,
  ].join(".");
}

export function premadeId(fig: Figure) {
  return figureString(fig);
}

export function setChibi(_id: string, _pix: Pix) {}
export function hasChibi(_id?: string) {
  return true;
}
export function chibiIds(_fig?: Figure) {
  return [] as string[];
}
export function allChibiIds() {
  return [] as string[];
}
export function pixFromRgba(w: number, h: number, data: ArrayLike<number>) {
  const p = new Pix(LOOK_W, LOOK_H);
  const cw = Math.min(w, LOOK_W);
  const ch = Math.min(h, LOOK_H);
  for (let y = 0; y < ch; y++) {
    for (let x = 0; x < cw; x++) {
      const i = (y * w + x) * 4;
      if (data[i + 3] < 8) continue;
      p.set(x, y, [data[i], data[i + 1], data[i + 2]], data[i + 3]);
    }
  }
  return p;
}
