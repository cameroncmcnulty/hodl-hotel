import type { Figure } from "../types";
import { mix, Pix, rgb } from "./pix";

export const LOOK_W = 96;
export const LOOK_H = 176;
export const LOOK_SCALE = 1;
export const LOOK_SRC_W = 128;
export const LOOK_SRC_H = 264;

export const SKIN = ["#f3d4c4", "#e8c4a8", "#d4a574", "#c48a56", "#b56c3a", "#8d4e24", "#6b3a20", "#3a1c10"];
export const HAIR_BOY_C = ["#8b5a2b", "#5c3317", "#1b1b1b", "#e8d07a", "#c45c26", "#4a2c0a"];
export const HAIR_GIRL_C = ["#8b5a2b", "#1a1a1a", "#111111", "#e8d07a", "#c45c26", "#ff8fab"];
export const HAIR_C = HAIR_BOY_C;

export const HAIR_BOY = ["messy", "side", "afro", "undercut", "spikes", "mohawk"];
export const HAIR_GIRL = ["pony", "waves", "bob", "long", "pigtails", "bun"];
export const TOP_BOY = ["hoodie", "tee", "jacket", "tank", "sweater"];
export const TOP_GIRL = ["hoodie", "tee", "jacket", "tank", "sweater"];
export const BOT_BOY = ["pants", "shorts", "jeans", "cargo", "joggers"];
export const BOT_GIRL = ["skirt", "pants", "shorts", "jeans", "pleat"];
export const SHOE_BOY = ["sneakers", "hightops", "boots", "skate", "slides"];
export const SHOE_GIRL = ["sneakers", "hightops", "boots", "skate", "flats"];
export const HAIR_STYLES = HAIR_BOY;
export const TOP_CUTS = TOP_BOY;
export const BOT_CUTS = BOT_GIRL;
export const ACC = ["none"];
export const GENDERS = ["boy", "girl"];
export const SKIN_N = 8;
export const COLOR_N = 5;
export const HAIR_COLOR_N = 6;

const TOP_PAL: Record<string, string[]> = {
  "0-hoodie": ["#8a8f98", "#1e3a8a", "#2a2a32", "#c41e3a", "#166534"],
  "0-tee": ["#e8b931", "#c41e3a", "#f4f4f6", "#3b82f6", "#2a2a32"],
  "0-jacket": ["#3a3a44", "#6d4c2f", "#c41e3a", "#1e3a5f", "#6b7280"],
  "0-tank": ["#2a2a32", "#f4f4f6", "#c41e3a", "#6b7280", "#1e3a8a"],
  "0-sweater": ["#c4a574", "#1e3a5f", "#7f1d1d", "#6b7280", "#166534"],
  "1-hoodie": ["#ff8fab", "#7c3aed", "#f4f4f6", "#8a8f98", "#3b82f6"],
  "1-tee": ["#f4f4f6", "#ff8fab", "#e8b931", "#c41e3a", "#2a2a32"],
  "1-jacket": ["#3a3a44", "#ff8fab", "#7c3aed", "#f4f4f6", "#c41e3a"],
  "1-tank": ["#2a2a32", "#ff8fab", "#f4f4f6", "#7c3aed", "#c41e3a"],
  "1-sweater": ["#f3e0c8", "#ff8fab", "#c4b5fd", "#8a8f98", "#c41e3a"],
};
const BOT_PAL: Record<string, string[]> = {
  "0-pants": ["#2a2a32", "#1e3a5f", "#6d4c2f", "#8a8f98", "#c4a574"],
  "0-shorts": ["#8a8f98", "#1e3a5f", "#2a2a32", "#c41e3a", "#166534"],
  "0-jeans": ["#2563eb", "#1e3a5f", "#2a2a32", "#6b7280", "#93c5fd"],
  "0-cargo": ["#c4a574", "#3f4f2f", "#2a2a32", "#6d4c2f", "#8a8f98"],
  "0-joggers": ["#2a2a32", "#6b7280", "#1e3a5f", "#c41e3a", "#3f4f2f"],
  "1-skirt": ["#1e3a8a", "#ff8fab", "#2a2a32", "#8a8f98", "#c41e3a"],
  "1-pants": ["#2a2a32", "#1e3a5f", "#3b82f6", "#8a8f98", "#6d4c2f"],
  "1-shorts": ["#ff8fab", "#2a2a32", "#f4f4f6", "#1e3a8a", "#8a8f98"],
  "1-jeans": ["#3b82f6", "#2a2a32", "#6b7280", "#93c5fd", "#1e3a5f"],
  "1-pleat": ["#2a2a32", "#ff8fab", "#f4f4f6", "#1e3a8a", "#c41e3a"],
};
const SHOE_PAL: Record<string, string[]> = {
  "0-sneakers": ["#c41e3a", "#f4f4f6", "#2a2a32", "#3b82f6", "#8a8f98"],
  "0-hightops": ["#2a2a32", "#c41e3a", "#f4f4f6", "#7c3aed", "#6b7280"],
  "0-boots": ["#2a2a32", "#6d4c2f", "#c41e3a", "#6b7280", "#f4f4f6"],
  "0-skate": ["#2a2a32", "#f4f4f6", "#c41e3a", "#3b82f6", "#6b7280"],
  "0-slides": ["#2a2a32", "#f4f4f6", "#c41e3a", "#3b82f6", "#6b7280"],
  "1-sneakers": ["#c41e3a", "#f4f4f6", "#2a2a32", "#ff8fab", "#3b82f6"],
  "1-hightops": ["#2a2a32", "#ff8fab", "#f4f4f6", "#7c3aed", "#c41e3a"],
  "1-boots": ["#2a2a32", "#6d4c2f", "#c41e3a", "#ff8fab", "#f4f4f6"],
  "1-skate": ["#2a2a32", "#f4f4f6", "#ff8fab", "#3b82f6", "#c41e3a"],
  "1-flats": ["#ff8fab", "#c41e3a", "#f4f4f6", "#2a2a32", "#7c3aed"],
};

export const TOPS = TOP_PAL["0-hoodie"];
export const BOTTOMS = BOT_PAL["0-pants"];
export const SHOES = SHOE_PAL["0-sneakers"];

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
export function facesFor(_gender: number) {
  return ["oval"];
}
export function defaultHairName(gender: number) {
  return gender === 1 ? "pony" : "messy";
}
export function hairColors(gender: number) {
  return gender === 1 ? HAIR_GIRL_C : HAIR_BOY_C;
}
export function topColors(gender: number, cut: number) {
  const name = topsFor(gender)[cut] || "hoodie";
  return TOP_PAL[`${gender}-${name}`] || TOP_PAL["0-hoodie"];
}
export function botColors(gender: number, cut: number) {
  const name = botsFor(gender)[cut] || (gender === 1 ? "skirt" : "pants");
  return BOT_PAL[`${gender}-${name}`] || BOT_PAL["0-pants"];
}
export function shoeColors(gender: number, cut: number) {
  const name = shoesFor(gender)[cut] || "sneakers";
  return SHOE_PAL[`${gender}-${name}`] || SHOE_PAL["0-sneakers"];
}

export const DEFAULT_FIGURE: Figure = {
  gender: 0,
  skin: 1,
  hair: 0,
  hairColor: 0,
  top: 0,
  bottom: 0,
  shoes: 0,
  acc: 0,
  topCut: 0,
  botCut: 0,
  shoeCut: 0,
  eyes: 0,
  face: 0,
};

export function clampFigure(f: Partial<Figure> | undefined): Figure {
  const n = (v: unknown, max: number) => Math.max(0, Math.min(max, Number(v) || 0));
  const gender = n(f?.gender, GENDERS.length - 1);
  return {
    gender,
    skin: n(f?.skin, SKIN_N - 1),
    hair: n(f?.hair, hairsFor(gender).length - 1),
    hairColor: n(f?.hairColor, HAIR_COLOR_N - 1),
    top: n(f?.top, COLOR_N - 1),
    bottom: n(f?.bottom, COLOR_N - 1),
    shoes: n(f?.shoes, COLOR_N - 1),
    acc: 0,
    topCut: n(f?.topCut, topsFor(gender).length - 1),
    botCut: n(f?.botCut, botsFor(gender).length - 1),
    shoeCut: n(f?.shoeCut, shoesFor(gender).length - 1),
    eyes: 0,
    face: 0,
  };
}

export type LookOpts = { back?: boolean; walk?: 0 | 1; sit?: boolean; view?: 0 | 1 | 2 | 3 };

const INK: [number, number, number] = [16, 12, 18];
const layers = new Map<string, Pix>();

function gTag(gender: number) {
  return gender === 1 ? "f" : "m";
}

function palOf(f: Figure) {
  return {
    skin: SKIN[f.skin] || SKIN[1],
    hair: hairColors(f.gender ?? 0)[f.hairColor] || HAIR_BOY_C[0],
    top: topColors(f.gender ?? 0, f.topCut ?? 0)[f.top] || TOPS[0],
    bot: botColors(f.gender ?? 0, f.botCut ?? 0)[f.bottom] || BOTTOMS[0],
    shoe: shoeColors(f.gender ?? 0, f.shoeCut ?? 0)[f.shoes] || SHOES[0],
  };
}

function isMag(r: number, g: number, b: number, a: number) {
  if (a < 8) return true;
  if (g > 50) return false;
  if (r > 240 && b > 240 && Math.abs(r - b) < 25) return true;
  return false;
}

function lum(r: number, g: number, b: number) {
  return r * 0.3 + g * 0.54 + b * 0.16;
}

function layer(id: string) {
  if (layers.has(id)) return layers.get(id)!;
  const m = id.match(/^(.*)-(\d+)$/);
  if (m && m[2] !== "0") return layers.get(`${m[1]}-0`) || null;
  return null;
}

function tint(src: Pix, hex: string, kind: "skin" | "dye") {
  const [tr, tg, tb] = rgb(hex);
  const p = new Pix(src.w, src.h);
  for (let i = 0; i < src.d.length; i += 4) {
    const r = src.d[i],
      g = src.d[i + 1],
      b = src.d[i + 2],
      a = src.d[i + 3];
    if (isMag(r, g, b, a)) continue;
    if (lum(r, g, b) < 36) {
      p.d[i] = INK[0];
      p.d[i + 1] = INK[1];
      p.d[i + 2] = INK[2];
      p.d[i + 3] = 255;
      continue;
    }
    if (r > 210 && g > 210 && b > 210) {
      p.d[i] = r;
      p.d[i + 1] = g;
      p.d[i + 2] = b;
      p.d[i + 3] = 255;
      continue;
    }
    const L = lum(r, g, b) / 180;
    const k = Math.max(0.25, Math.min(1.35, L));
    p.d[i] = Math.max(0, Math.min(255, Math.round(tr * k)));
    p.d[i + 1] = Math.max(0, Math.min(255, Math.round(tg * k)));
    p.d[i + 2] = Math.max(0, Math.min(255, Math.round(tb * k)));
    p.d[i + 3] = 255;
  }
  return p;
}

function coverFace(src: Pix) {
  const p = new Pix(src.w, src.h);
  p.blit(src);
  let sr = 220,
    sg = 180,
    sb = 150;
  const sample = (x: number, y: number) => {
    const i = (y * src.w + x) * 4;
    if (src.d[i + 3] > 8 && !isMag(src.d[i], src.d[i + 1], src.d[i + 2], src.d[i + 3])) {
      sr = src.d[i];
      sg = src.d[i + 1];
      sb = src.d[i + 2];
    }
  };
  sample(64, 96);
  sample(50, 100);
  for (let y = 18; y < 88; y++) {
    for (let x = 32; x < 96; x++) {
      const dx = (x - 64) / 26;
      const dy = (y - 52) / 28;
      if (dx * dx + dy * dy > 1) continue;
      const i = (y * p.w + x) * 4;
      if (p.d[i + 3] < 8) continue;
      p.d[i] = sr;
      p.d[i + 1] = sg;
      p.d[i + 2] = sb;
    }
  }
  return p;
}

function blitFit(dst: Pix, src: Pix) {
  const sc = LOOK_H / src.h;
  const dw = src.w * sc;
  const ox = (LOOK_W - dw) / 2;
  for (let y = 0; y < LOOK_H; y++) {
    for (let x = 0; x < LOOK_W; x++) {
      const sx = Math.floor((x - ox) / sc);
      const sy = Math.floor(y / sc);
      if (sx < 0 || sy < 0 || sx >= src.w || sy >= src.h) continue;
      const i = (sy * src.w + sx) * 4;
      if (src.d[i + 3] < 8) continue;
      if (isMag(src.d[i], src.d[i + 1], src.d[i + 2], src.d[i + 3])) continue;
      dst.set(x, y, [src.d[i], src.d[i + 1], src.d[i + 2]]);
    }
  }
}

function blitShoes(dst: Pix, src: Pix) {
  let minx = src.w,
    miny = src.h,
    maxx = 0,
    maxy = 0;
  for (let y = 0; y < src.h; y++) {
    for (let x = 0; x < src.w; x++) {
      const i = (y * src.w + x) * 4;
      if (src.d[i + 3] < 8) continue;
      if (isMag(src.d[i], src.d[i + 1], src.d[i + 2], src.d[i + 3])) continue;
      if (x < minx) minx = x;
      if (y < miny) miny = y;
      if (x > maxx) maxx = x;
      if (y > maxy) maxy = y;
    }
  }
  if (maxx < minx) return;
  const bw = maxx - minx + 1;
  const bh = maxy - miny + 1;
  const sc = (LOOK_H / src.h) * 1.35;
  const dw = Math.round(bw * sc);
  const dh = Math.round(bh * sc);
  const dx = Math.round((LOOK_W - dw) / 2);
  const dy = LOOK_H - dh - 1;
  for (let y = 0; y < dh; y++) {
    for (let x = 0; x < dw; x++) {
      const sx = minx + Math.floor(x / sc);
      const sy = miny + Math.floor(y / sc);
      const i = (sy * src.w + sx) * 4;
      if (src.d[i + 3] < 8) continue;
      if (isMag(src.d[i], src.d[i + 1], src.d[i + 2], src.d[i + 3])) continue;
      dst.set(dx + x, dy + y, [src.d[i], src.d[i + 1], src.d[i + 2]]);
    }
  }
}

function faceMarks(p: Pix, girl: boolean) {
  p.set(36, 32, [255, 255, 255]);
  p.set(37, 32, [255, 255, 255]);
  p.set(57, 32, [255, 255, 255]);
  p.set(58, 32, [255, 255, 255]);
  p.rect(43, 46, 10, 2, [48, 28, 32]);
  if (girl) {
    p.set(32, 44, [224, 150, 158]);
    p.set(63, 44, [224, 150, 158]);
  }
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

function keyed(src: Pix) {
  const p = new Pix(src.w, src.h);
  for (let i = 0; i < src.d.length; i += 4) {
    const r = src.d[i],
      g = src.d[i + 1],
      b = src.d[i + 2],
      a = src.d[i + 3];
    if (isMag(r, g, b, a)) continue;
    p.d[i] = r;
    p.d[i + 1] = g;
    p.d[i + 2] = b;
    p.d[i + 3] = 255;
  }
  return p;
}

function pick(id: string, hex: string, kind: "skin" | "dye") {
  const exact = layers.get(id);
  if (exact) return keyed(exact);
  const src = layer(id);
  if (!src) return null;
  return tint(src, hex, kind);
}

export function paintLook(fig: Figure, opts: LookOpts = {}): Pix {
  const f = clampFigure(fig);
  const g = gTag(f.gender ?? 0);
  const pal = palOf(f);
  const hairName = hairsFor(f.gender ?? 0)[f.hair] || defaultHairName(f.gender ?? 0);
  const topName = topsFor(f.gender ?? 0)[f.topCut ?? 0] || "hoodie";
  const botName = botsFor(f.gender ?? 0)[f.botCut ?? 0] || (f.gender === 1 ? "skirt" : "pants");
  const shoeName = shoesFor(f.gender ?? 0)[f.shoeCut ?? 0] || "sneakers";
  const view = opts.view ?? (opts.back ? 2 : 1);
  const back = view === 2 || view === 3;

  const out = new Pix(LOOK_W, LOOK_H);
  let skin = pick(`${g}-skin-${f.skin}`, pal.skin, "skin");
  if (skin && back) skin = coverFace(skin);
  if (skin) blitFit(out, skin);
  if (!back) faceMarks(out, (f.gender ?? 0) === 1);
  const bot = pick(`${g}-bot-${botName}-${f.bottom}`, pal.bot, "dye") || pick(`${g}-bot-${botName}-0`, pal.bot, "dye");
  if (bot) blitFit(out, bot);
  const shoe = pick(`${g}-shoe-${shoeName}-${f.shoes}`, pal.shoe, "dye") || pick(`${g}-shoe-${shoeName}-0`, pal.shoe, "dye");
  if (shoe) blitShoes(out, shoe);
  const top = pick(`${g}-top-${topName}-${f.top}`, pal.top, "dye") || pick(`${g}-top-${topName}-0`, pal.top, "dye");
  if (top) blitFit(out, top);
  const hair =
    pick(`${g}-hair-${hairName}-${f.hairColor}`, pal.hair, "dye") || pick(`${g}-hair-${hairName}-0`, pal.hair, "dye");
  if (hair) blitFit(out, hair);
  if (back && hair) blitFit(out, hair);

  if (view === 0 || view === 3) return flipH(out);
  return out;
}

export function lookKey(fig: Figure, opts: LookOpts = {}) {
  const f = clampFigure(fig);
  const view = opts.view ?? (opts.back ? 2 : 1);
  return [
    f.gender,
    f.skin,
    f.hair,
    f.hairColor,
    f.top,
    f.topCut,
    f.bottom,
    f.botCut,
    f.shoes,
    f.shoeCut,
    view,
    opts.walk ?? 0,
    opts.sit ? 1 : 0,
  ].join(".");
}

export function setChibi(id: string, pix: Pix) {
  layers.set(id, pix);
}

export function hasChibi(id?: string) {
  if (!id) return layers.size > 0;
  return layers.has(id);
}

export function chibiIds(fig?: Figure) {
  if (!fig) return allChibiIds();
  const f = clampFigure(fig);
  const g = gTag(f.gender ?? 0);
  const hairName = hairsFor(f.gender ?? 0)[f.hair] || defaultHairName(f.gender ?? 0);
  const topName = topsFor(f.gender ?? 0)[f.topCut ?? 0] || "hoodie";
  const botName = botsFor(f.gender ?? 0)[f.botCut ?? 0] || (f.gender === 1 ? "skirt" : "pants");
  const shoeName = shoesFor(f.gender ?? 0)[f.shoeCut ?? 0] || "sneakers";
  return [
    `${g}-skin-${f.skin}`,
    `${g}-hair-${hairName}-${f.hairColor}`,
    `${g}-hair-${hairName}-0`,
    `${g}-top-${topName}-${f.top}`,
    `${g}-top-${topName}-0`,
    `${g}-bot-${botName}-${f.bottom}`,
    `${g}-bot-${botName}-0`,
    `${g}-shoe-${shoeName}-${f.shoes}`,
    `${g}-shoe-${shoeName}-0`,
  ];
}

export function allChibiIds() {
  const ids: string[] = [];
  const add = (g: string, kind: string, names: string[], n: number) => {
    for (const name of names) for (let i = 0; i < n; i++) ids.push(`${g}-${kind}-${name}-${i}`);
  };
  for (const g of ["m", "f"]) for (let s = 0; s < 8; s++) ids.push(`${g}-skin-${s}`);
  add("m", "hair", HAIR_BOY, 6);
  add("f", "hair", HAIR_GIRL, 6);
  add("m", "top", TOP_BOY, 5);
  add("f", "top", TOP_GIRL, 5);
  add("m", "bot", BOT_BOY, 5);
  add("f", "bot", BOT_GIRL, 5);
  add("m", "shoe", SHOE_BOY, 5);
  add("f", "shoe", SHOE_GIRL, 5);
  return ids;
}

export function pixFromRgba(w: number, h: number, data: ArrayLike<number>) {
  const p = new Pix(w, h);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      if (data[i + 3] < 8) continue;
      if (isMag(data[i], data[i + 1], data[i + 2], data[i + 3])) continue;
      p.set(x, y, [data[i], data[i + 1], data[i + 2]], data[i + 3]);
    }
  }
  return p;
}
