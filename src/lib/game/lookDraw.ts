/**
 * Hotel figure compositor — same 2:1 iso lighting and 1px ink as furniture.
 * A look is a recipe, not an image. Parts share one locked 64×88 rig so a
 * standing guest is about one tile wide at the feet and two tiles tall.
 */
import type { Figure } from "../types";
import { hexMix, mix, Pix, rgb } from "./pix";

export const LOOK_W = 64;
export const LOOK_H = 88;
export const LOOK_SCALE = 1;
export const LOOK_N = 1;
/** Shoe soles. Plant this row on the tile (or on a seat surface). */
export const FOOT_Y = 78;

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
export const HAIR_COLOR_N = 6;

export const DYE = ["#f4f4f6", "#8a8f98", "#2a2a32", "#c41e3a", "#2563eb", "#166534", "#7c3aed", "#fb7185", "#f5c542"];
export const COLOR_N = DYE.length;
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
  top: 8,
  bottom: 2,
  shoes: 1,
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

export type LookOpts = { back?: boolean; walk?: 0 | 1; sit?: boolean; lay?: boolean; view?: 0 | 1 | 2 | 3 };

type RGB = [number, number, number];
const INK: RGB = [12, 8, 14];
const WHITE: RGB = [255, 255, 255];
const BASE = "#8c8c8c";
const CX = 32;

const R = {
  headX: 32,
  headY: 32,
  headR: 13,
  earL: 19,
  earR: 45,
  earY: 33,
  torsoX: 24,
  torsoY: 46,
  torsoW: 16,
  torsoH: 12,
  armW: 5,
  armH: 12,
  armLX: 18,
  armLY: 47,
  armRX: 41,
  armRY: 46,
  handLX: 19,
  handLY: 58,
  handRX: 42,
  handRY: 57,
  legW: 6,
  legH: 12,
  legLX: 24,
  legLY: 57,
  legRX: 34,
  legRY: 56,
  shoeW: 9,
  shoeH: 6,
  shoeLX: 22,
  shoeLY: 68,
  shoeRX: 34,
  shoeRY: 67,
};

function onFace(x: number, y: number) {
  const dx = (x - CX) / 10;
  const dy = (y - (R.headY + 2)) / 10;
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
  const drop = sit ? 10 : 0;
  const a = sit ? 0 : walk ? 2 : 0;
  const b = sit ? 0 : walk ? -2 : 0;
  return { drop, a, b, sit };
}

function blob(p: Pix, cx: number, cy: number, rx: number, ry: number, hex: string) {
  p.discShade(cx, cy, rx, ry, hex);
}

function tuft(p: Pix, cx: number, cy: number, ang: number, len: number, w: number, hex: string) {
  const dx = Math.sin(ang) * len;
  const dy = -Math.cos(ang) * len;
  const steps = Math.max(3, Math.round(len));
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const r = Math.max(1.1, w * (1 - t * 0.7));
    blob(p, cx + dx * t, cy + dy * t, r, r * 1.1, hex);
  }
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

function partBd(girl: boolean, walk: number, sit: boolean): Pix {
  const p = blank();
  const { drop, a, b } = pose(walk, sit);
  const tw = girl ? 15 : 16;
  const tx = CX - Math.floor(tw / 2);
  p.capsule(R.armLX, R.armLY + drop, R.armW, sit ? 10 : R.armH, BASE);
  p.capsule(R.armRX, R.armRY + drop, R.armW, sit ? 10 : R.armH, BASE);
  p.trap(tx + 2, tx + tw - 2, R.torsoY + drop, tx, tx + tw, R.torsoY + drop + (sit ? 12 : R.torsoH), BASE);
  if (sit) {
    p.roundBlock(R.legLX - 1, R.legLY + drop - 4, 12, 8, 2, BASE);
    p.roundBlock(R.legRX - 1, R.legRY + drop - 3, 12, 8, 2, BASE);
  } else {
    p.capsule(R.legLX, R.legLY + drop + a, R.legW, R.legH, BASE);
    p.capsule(R.legRX, R.legRY + drop + b, R.legW, R.legH, BASE);
  }
  return p;
}

function partHd(): Pix {
  const p = blank();
  p.discShade(R.headX, R.headY, R.headR, R.headR, BASE);
  p.discShade(R.earL, R.earY, 2.4, 2.8, BASE);
  p.discShade(R.earR, R.earY, 2.4, 2.8, BASE);
  return p;
}

function partFc(girl: boolean): Pix {
  const p = blank();
  const ey = R.headY + 1;
  p.disc(27, ey, 1.6, 2.1, INK);
  p.disc(37, ey, 1.6, 2.1, INK);
  p.rect(29, R.headY + 9, 5, 1, [160, 80, 90]);
  if (girl) {
    p.disc(23, ey + 6, 1.6, 1.1, rgb("#f4a7b0"));
    p.disc(41, ey + 6, 1.6, 1.1, rgb("#f4a7b0"));
  }
  return p;
}

function partHrb(style: string): Pix {
  const p = blank();
  if (style === "pony") {
    blob(p, 14, R.headY, 5, 6, BASE);
    tuft(p, 13, R.headY + 5, -2.4, 18, 3.2, BASE);
    blob(p, 12, R.headY + 22, 5, 5, BASE);
  } else if (style === "pigtails") {
    blob(p, 12, R.headY + 2, 4.5, 4.5, BASE);
    blob(p, 52, R.headY + 1, 4.5, 4.5, BASE);
    tuft(p, 12, R.headY + 6, -2.3, 12, 2.6, BASE);
    tuft(p, 52, R.headY + 5, 2.3, 12, 2.6, BASE);
  } else if (style === "long") {
    tuft(p, 14, R.headY + 4, -2.1, 24, 3.4, BASE);
    tuft(p, 50, R.headY + 4, 2.1, 24, 3.4, BASE);
  }
  return p;
}

function partHr(style: string, back: boolean): Pix {
  const raw = blank();
  if (style === "afro") {
    blob(raw, CX, R.headY - 4, 18, 16, BASE);
  } else if (style === "mohawk") {
    tuft(raw, CX, R.headY - 12, 0, 14, 3.2, BASE);
    tuft(raw, CX - 2, R.headY - 10, -0.15, 12, 2.4, BASE);
    tuft(raw, CX + 2, R.headY - 10, 0.15, 12, 2.4, BASE);
  } else if (style === "spikes") {
    tuft(raw, 22, R.headY - 6, -0.7, 12, 2.6, BASE);
    tuft(raw, 28, R.headY - 10, -0.25, 14, 3, BASE);
    tuft(raw, 32, R.headY - 12, 0, 15, 3.2, BASE);
    tuft(raw, 36, R.headY - 10, 0.25, 14, 3, BASE);
    tuft(raw, 42, R.headY - 6, 0.7, 12, 2.6, BASE);
  } else if (style === "side") {
    blob(raw, CX, R.headY - 8, 14, 10, BASE);
    blob(raw, 20, R.headY - 4, 8, 8, BASE);
    tuft(raw, 18, R.headY - 6, -0.9, 10, 3, BASE);
  } else if (style === "bob") {
    blob(raw, CX, R.headY - 8, 15, 11, BASE);
    blob(raw, 18, R.headY + 1, 6, 7, BASE);
    blob(raw, 46, R.headY, 6, 7, BASE);
  } else if (style === "bun") {
    blob(raw, CX, R.headY - 8, 13, 10, BASE);
    blob(raw, CX, R.headY - 20, 6, 5, BASE);
  } else if (style === "pony" || style === "pigtails" || style === "long") {
    blob(raw, CX, R.headY - 9, 14, 10, BASE);
    blob(raw, 20, R.headY - 6, 6, 6, BASE);
    blob(raw, 44, R.headY - 7, 6, 6, BASE);
  } else {
    blob(raw, CX, R.headY - 9, 15, 11, BASE);
    tuft(raw, 24, R.headY - 12, -0.45, 10, 2.8, BASE);
    tuft(raw, 32, R.headY - 14, 0.05, 11, 3.2, BASE);
    tuft(raw, 40, R.headY - 12, 0.4, 10, 2.8, BASE);
  }
  raw.rect(24, R.headY - 10, 1, 6, WHITE);
  return back ? raw : maskFace(raw);
}

function partLg(name: string, girl: boolean, walk: number, sit: boolean): Pix {
  const p = blank();
  const { drop, a, b } = pose(walk, sit);
  const skirt = girl && name === "skirt";
  const short = name === "shorts";
  const h = sit ? 10 : short ? 10 : 18;
  if (skirt) {
    const y0 = R.torsoY + drop + 10;
    p.trap(CX - 8, CX + 8, y0, CX - 14, CX + 14, y0 + 16, BASE);
    p.rect(CX - 6, y0 + 1, 12, 1, mix(BASE, 48));
    return p;
  }
  if (sit) {
    p.roundBlock(R.legLX - 1, R.legLY + drop - 6, 12, 10, 2, BASE);
    p.roundBlock(R.legRX - 1, R.legRY + drop - 5, 12, 10, 2, BASE);
    return p;
  }
  p.capsule(R.legLX - 1, R.legLY + drop + a, R.legW + 1, h, BASE);
  p.capsule(R.legRX - 1, R.legRY + drop + b, R.legW + 1, h, BASE);
  p.roundBlock(R.legLX - 1, R.legLY + drop - 3, 20, 8, 2, BASE);
  p.rect(31, R.legLY + drop - 1, 1, 6, INK);
  if (name === "jeans") {
    p.rect(26, R.legLY + drop + 2, 1, 12, mix(BASE, 48));
    p.rect(38, R.legLY + drop + 1, 1, 12, mix(BASE, 48));
  }
  return p;
}

function partCh(name: string, back: boolean, sit: boolean): Pix {
  const p = blank();
  const drop = sit ? 10 : 0;
  const sleeveH = sit ? 10 : name === "tee" ? 8 : 14;
  const y = R.torsoY + drop;
  p.trap(R.torsoX + 2, R.torsoX + R.torsoW - 2, y, R.torsoX, R.torsoX + R.torsoW, y + (sit ? 14 : R.torsoH + 2), BASE);
  if (name !== "tank") {
    p.capsule(R.armLX, R.armLY + drop, R.armW, sleeveH, BASE);
    p.capsule(R.armRX, R.armRY + drop, R.armW, sleeveH, BASE);
  }
  if (name === "hoodie") {
    blob(p, CX, y - 3, 6, 4, hexMix(BASE, -12));
    if (!back) {
      p.rect(31, y, 1, 10, INK);
      p.roundBlock(26, y + 6, 12, 5, 1, hexMix(BASE, -18));
    }
    if (back) blob(p, CX, y - 6, 8, 6, hexMix(BASE, -14));
  } else if (name === "tee") {
    blob(p, CX, y + 1, 6, 3, hexMix(BASE, -16));
  } else if (name === "jacket") {
    p.roundBlock(29, y, 6, 14, 1, "#d8d0c4");
    p.rect(31, y + 1, 1, 12, INK);
  } else if (name === "tank") {
    p.roundBlock(24, y - 1, 5, 7, 1, hexMix(BASE, -14));
    p.roundBlock(35, y - 1, 5, 7, 1, hexMix(BASE, -14));
  }
  return p;
}

function partRh(walk: number, sit: boolean): Pix {
  const p = blank();
  const { drop, a, b } = pose(walk, sit);
  const hy = sit ? -4 : 0;
  blob(p, R.handLX, R.handLY + drop + a + hy, 3.4, 3, BASE);
  blob(p, R.handRX, R.handRY + drop + b + hy, 3.4, 3, BASE);
  return p;
}

function partSh(name: string, walk: number, sit: boolean): Pix {
  const p = blank();
  const { drop, a, b } = pose(walk, sit);
  const yL = R.shoeLY + drop + (sit ? -4 : 0);
  const yR = R.shoeRY + drop + (sit ? -4 : 0);
  if (name === "slides") {
    blob(p, 26, yL + a + 3, 6, 3.2, BASE);
    blob(p, 38, yR + b + 3, 6, 3.2, BASE);
    return p;
  }
  const lift = name === "boots" ? 6 : 0;
  p.roundBlock(R.shoeLX, yL + a - lift, R.shoeW, R.shoeH + lift, 1, BASE);
  p.roundBlock(R.shoeRX, yR + b - lift, R.shoeW, R.shoeH + lift, 1, BASE);
  p.roundBlock(R.shoeLX, yL + a + R.shoeH - 2, R.shoeW, 2, 1, "#f2f2f4");
  p.roundBlock(R.shoeRX, yR + b + R.shoeH - 2, R.shoeW, 2, 1, "#f2f2f4");
  if (name === "sneakers") {
    p.rect(R.shoeLX + 2, yL + a + 1, 5, 1, WHITE);
    p.rect(R.shoeRX + 2, yR + b + 1, 5, 1, WHITE);
  }
  return p;
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

function paintLay(fig: Figure, back: boolean): Pix {
  const f = clampFigure(fig);
  const pal = palOf(f);
  const girl = (f.gender ?? 0) === 1;
  const p = blank();
  p.discShade(16, 36, 11, 9, pal.hair);
  if (!back) p.discShade(20, 40, 11, 11, pal.skin);
  else p.discShade(20, 40, 11, 11, pal.hair);
  p.trap(30, 34, 36, 52, 56, 48, pal.top);
  p.capsule(50, 38, 6, 16, pal.bot);
  p.roundBlock(52, 50, 10, 5, 1, pal.shoe);
  if (!back) {
    p.disc(16, 38, 1.4, 1.8, INK);
    p.rect(18, 44, 4, 1, [160, 80, 90]);
    if (girl) p.disc(14, 44, 1.5, 1, rgb("#f4a7b0"));
  }
  p.outline(INK);
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
  const sit = !!opts.sit && !opts.lay;
  if (opts.lay) {
    const laid = paintLay(f, back);
    if (view === 0 || view === 3) return flipH(laid);
    return laid;
  }
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
  head: { x: 10, y: 14, w: 44, h: 40 },
  chest: { x: 12, y: 42, w: 40, h: 24 },
  legs: { x: 12, y: 54, w: 40, h: 26 },
  full: { x: 8, y: 14, w: 48, h: 68 },
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
  return [figureString(f), view, opts.walk ?? 0, opts.sit ? 1 : 0, opts.lay ? 1 : 0].join(".");
}

export function premadeId(fig: Figure) {
  return figureString(fig);
}

export function setChibi(_id: string, _pix: Pix) {}
export function hasChibi(_id?: string) {
  return true;
}
export function allChibiIds() {
  return [] as string[];
}
export function chibiIds() {
  return [] as string[];
}
