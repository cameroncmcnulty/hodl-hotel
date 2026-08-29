import type { Figure } from "../types";
import { Pix, rgb, mix, hexMix } from "./pix";

export const LOOK_W = 48;
export const LOOK_H = 72;
export const LOOK_SCALE = 2;

export const SKIN = ["#f3d4c4", "#e8c4a8", "#d4a574", "#c48a56", "#b56c3a", "#8d4e24", "#6b3a20", "#3a1c10"];
export const HAIR_BOY_C = ["#8b5a2b", "#5c3317", "#1b1b1b", "#e8d07a", "#c45c26", "#4a2c0a"];
export const HAIR_GIRL_C = ["#8b5a2b", "#1a1a1a", "#111111", "#e8d07a", "#c45c26", "#ff8fab"];
export const HAIR_C = HAIR_BOY_C;

export const HAIR_BOY = ["messy", "side", "afro", "undercut", "spikes"];
export const HAIR_GIRL = ["pony", "waves", "bob", "long", "pigtails"];
export const TOP_BOY = ["hoodie", "tee"];
export const TOP_GIRL = ["hoodie", "tee"];
export const BOT_BOY = ["pants", "shorts"];
export const BOT_GIRL = ["skirt", "pants", "shorts"];
export const SHOE_BOY = ["sneakers"];
export const SHOE_GIRL = ["sneakers", "flats"];
export const HAIR_STYLES = HAIR_BOY;
export const TOP_CUTS = TOP_BOY;
export const BOT_CUTS = BOT_GIRL;
export const ACC = ["none"];
export const GENDERS = ["boy", "girl"];
export const SKIN_N = 8;
export const COLOR_N = 5;
export const HAIR_COLOR_N = 6;

const TOP_PAL: Record<string, string[]> = {
  "0-hoodie": ["#9a9a9a", "#1e3a8a", "#1a1a1e", "#c41e3a", "#166534"],
  "0-tee": ["#e8b931", "#c41e3a", "#f4f4f6", "#3b82f6", "#1a1a1e"],
  "1-hoodie": ["#ff8fab", "#7c3aed", "#f4f4f6", "#9a9a9a", "#3b82f6"],
  "1-tee": ["#ff8fab", "#f4f4f6", "#e8b931", "#c41e3a", "#1a1a1e"],
};
const BOT_PAL: Record<string, string[]> = {
  "0-pants": ["#1a1a1e", "#1e3a5f", "#6d4c2f", "#9a9a9a", "#c4a574"],
  "0-shorts": ["#9a9a9a", "#1e3a5f", "#1a1a1e", "#c41e3a", "#166534"],
  "1-skirt": ["#1e3a8a", "#ff8fab", "#1a1a1e", "#9a9a9a", "#c41e3a"],
  "1-pants": ["#1a1a1e", "#1e3a5f", "#3b82f6", "#9a9a9a", "#6d4c2f"],
  "1-shorts": ["#ff8fab", "#1a1a1e", "#f4f4f6", "#1e3a8a", "#9a9a9a"],
};
const SHOE_PAL: Record<string, string[]> = {
  "0-sneakers": ["#c41e3a", "#f4f4f6", "#1a1a1e", "#3b82f6", "#9a9a9a"],
  "1-sneakers": ["#c41e3a", "#f4f4f6", "#1a1a1e", "#ff8fab", "#3b82f6"],
  "1-flats": ["#ff8fab", "#c41e3a", "#f4f4f6", "#1a1a1e", "#7c3aed"],
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
  skin: 2,
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

export type LookOpts = { back?: boolean; walk?: 0 | 1; sit?: boolean };

type Pal = { skin: string; hair: string; top: string; bot: string; shoe: string };
type Style = { hair: string; top: string; bot: string; shoe: string; girl: boolean };

function palOf(f: Figure): Pal {
  return {
    skin: SKIN[f.skin] || SKIN[2],
    hair: hairColors(f.gender ?? 0)[f.hairColor] || HAIR_BOY_C[0],
    top: topColors(f.gender ?? 0, f.topCut ?? 0)[f.top] || TOPS[0],
    bot: botColors(f.gender ?? 0, f.botCut ?? 0)[f.bottom] || BOTTOMS[0],
    shoe: shoeColors(f.gender ?? 0, f.shoeCut ?? 0)[f.shoes] || SHOES[0],
  };
}

function styleOf(f: Figure): Style {
  const g = f.gender ?? 0;
  return {
    hair: hairsFor(g)[f.hair] || defaultHairName(g),
    top: topsFor(g)[f.topCut ?? 0] || "hoodie",
    bot: botsFor(g)[f.botCut ?? 0] || (g === 1 ? "skirt" : "pants"),
    shoe: shoesFor(g)[f.shoeCut ?? 0] || "sneakers",
    girl: g === 1,
  };
}

const CX = 24;
const HEAD = { cx: 24, cy: 17, rx: 11, ry: 12 };
const FACE_Y = 14;

function inHead(x: number, y: number, pad = 0) {
  const dx = x - HEAD.cx;
  const dy = y - HEAD.cy;
  const rx = HEAD.rx + pad;
  const ry = HEAD.ry + pad;
  return (dx * dx) / (rx * rx) + (dy * dy) / (ry * ry) <= 1.02;
}

function drawHead(p: Pix, skin: string, girl: boolean) {
  p.discShade(HEAD.cx, HEAD.cy, HEAD.rx, HEAD.ry, skin);
  p.discShade(12, 19, 2.6, 3.4, skin);
  p.discShade(36, 19, 2.6, 3.4, skin);
  p.block(21, 28, 6, 4, skin);
  if (girl) {
    p.disc(17, 23, 1.6, 1.1, mix("#e89aa8", 0));
    p.disc(31, 23, 1.6, 1.1, mix("#e89aa8", 0));
  }
}

function drawTorso(p: Pix, skin: string, girl: boolean, walk: 0 | 1) {
  const wob = walk ? 1 : 0;
  if (girl) p.trap(16, 32, 31, 18, 30, 47, skin);
  else p.trap(15, 33, 31, 17, 31, 47, skin);
  p.trap(13, 18, 32, 10, 14, 50, skin);
  p.trap(30, 35, 32, 34, 38, 50, skin);
  p.block(17 + wob, 46, 5, 16, skin);
  p.block(26 - wob, 46, 5, 16, skin);
}

function drawFace(p: Pix, girl: boolean, back: boolean) {
  if (back) return;
  const white: [number, number, number] = [252, 250, 255];
  const ink: [number, number, number] = [20, 16, 24];
  const shine: [number, number, number] = [255, 255, 255];
  p.disc(19, 18, 3.5, 4, white);
  p.disc(29, 18, 3.5, 4, white);
  p.disc(19, 19, 2.5, 2.9, ink);
  p.disc(29, 19, 2.5, 2.9, ink);
  p.set(18, 17, shine);
  p.set(28, 17, shine);
  if (girl) {
    p.set(16, 15, ink);
    p.set(17, 14, ink);
    p.set(21, 15, ink);
    p.set(27, 15, ink);
    p.set(31, 14, ink);
    p.set(32, 15, ink);
  }
}

function hairCap(p: Pix, hex: string, extra = 1, hem = FACE_Y) {
  p.discShade(HEAD.cx, HEAD.cy - 2, HEAD.rx + extra, HEAD.ry + extra - 1, hex, (x, y) => y <= hem + 1 || !inHead(x, y, -1));
  p.discShade(HEAD.cx, HEAD.cy - 4, HEAD.rx + extra, HEAD.ry - 3, hex);
}

function drawHairBack(p: Pix, s: Style, hair: string, back: boolean) {
  if (s.hair === "pony") {
    p.discShade(11, 24, 4, 5, hair);
    p.discShade(9, 32, 4, 7, hair);
    p.discShade(9, 40, 3.5, 6, hair);
  }
  if (s.hair === "pigtails") {
    p.discShade(9, 20, 5, 5, hair);
    p.discShade(39, 20, 5, 5, hair);
    p.discShade(8, 27, 4.5, 5, hair);
    p.discShade(40, 27, 4.5, 5, hair);
  }
  if (s.hair === "long" || s.hair === "waves") {
    p.trap(11, 16, 18, 10, 16, 46, hair);
    p.trap(32, 37, 18, 32, 38, 46, hair);
    p.discShade(12, 46, 4, 3, hair);
    p.discShade(36, 46, 4, 3, hair);
    if (s.hair === "waves") {
      p.discShade(12, 28, 4, 5, hair);
      p.discShade(12, 38, 4, 5, hair);
      p.discShade(36, 28, 4, 5, hair);
      p.discShade(36, 38, 4, 5, hair);
    }
  }
  if (back) p.discShade(CX, 22, 8, 8, hair);
}

function drawHoodBack(p: Pix, top: string, isHoodie: boolean) {
  if (!isHoodie) return;
  p.discShade(CX, 16, 13, 13, top, (x, y) => y >= 6 && y <= 30 && (x <= 13 || x >= 35));
  p.discShade(CX, 28, 8, 4, top, (x, y) => y >= 26 && y <= 32 && Math.abs(x - CX) >= 4);
}

function drawHairFront(p: Pix, s: Style, hair: string, back: boolean) {
  const hem = back ? 26 : FACE_Y;
  if (s.hair === "afro") {
    p.discShade(CX, 14, 17, 16, hair);
    p.discShade(12, 12, 6, 6, hair);
    p.discShade(36, 12, 6, 6, hair);
    p.discShade(24, 4, 8, 6, hair);
    p.discShade(16, 7, 5, 5, hair);
    p.discShade(32, 7, 5, 5, hair);
    p.discShade(18, 8, 4, 4, hexMix(hair, 22));
    p.discShade(29, 10, 4, 4, hexMix(hair, -24));
    p.discShade(24, 6, 4, 3, hexMix(hair, 16));
    return;
  }
  if (s.hair === "undercut") {
    p.discShade(CX, 10, 9, 7, hair);
    p.discShade(CX, 8, 8, 5, hair);
    p.discShade(20, 10, 4, 4, hair, (x, y) => y <= 13);
    p.discShade(28, 10, 4, 4, hair, (x, y) => y <= 13);
    return;
  }
  if (s.hair === "spikes") {
    hairCap(p, hair, 0, 13);
    p.spike(17, 2, 11, 2.4, hair);
    p.spike(21, 1, 11, 2.6, hair);
    p.spike(24, 0, 11, 3, hair);
    p.spike(27, 1, 11, 2.6, hair);
    p.spike(31, 2, 11, 2.4, hair);
    return;
  }
  if (s.hair === "messy") {
    hairCap(p, hair, 1, 14);
    p.discShade(15, 7, 3.5, 4, hair);
    p.discShade(20, 5, 3.5, 4, hair);
    p.discShade(25, 4, 4, 4, hair);
    p.discShade(30, 6, 3.5, 4, hair);
    p.discShade(34, 10, 3, 4, hair);
    p.discShade(14, 13, 3.5, 4, hair, (x, y) => y <= 16);
    p.discShade(34, 14, 3.5, 5, hair, (x, y) => y <= 18);
    return;
  }
  if (s.hair === "side") {
    p.discShade(CX + 2, HEAD.cy - 3, HEAD.rx + 1, HEAD.ry - 2, hair, (x, y) => y <= 14);
    p.discShade(28, 9, 8, 7, hair, (x, y) => y <= 16);
    p.discShade(32, 13, 5, 6, hair, (x, y) => y <= 17);
    p.trap(20, 36, 6, 24, 37, 15, hair);
    return;
  }
  if (s.hair === "pony") {
    hairCap(p, hair, 1, 14);
    p.discShade(21, 11, 6, 4, hair, (x, y) => y <= 15);
    p.discShade(16, 13, 4, 3, hair, (x, y) => y <= 15);
    p.trap(12, 16, 16, 8, 13, 24, hair);
    return;
  }
  if (s.hair === "waves") {
    hairCap(p, hair, 2, 14);
    p.discShade(13, 18, 5, 8, hair, (x, y) => x <= 17 || y <= hem);
    p.discShade(35, 18, 5, 8, hair, (x, y) => x >= 31 || y <= hem);
    p.discShade(14, 16, 4, 4, hair, (x, y) => y <= 16);
    p.discShade(34, 16, 4, 4, hair, (x, y) => y <= 16);
    return;
  }
  if (s.hair === "bob") {
    hairCap(p, hair, 2, 15);
    p.discShade(CX, 18, 12, 11, hair, (x, y) => y <= 26 && (y <= hem || !inHead(x, y, -1)));
    p.discShade(13, 20, 4, 6, hair);
    p.discShade(35, 20, 4, 6, hair);
    p.discShade(18, 12, 5, 3, hair, (x, y) => y <= 15);
    return;
  }
  if (s.hair === "long") {
    hairCap(p, hair, 1, 14);
    p.trap(11, 17, 16, 10, 16, 46, hair);
    p.trap(31, 37, 16, 32, 38, 46, hair);
    p.discShade(18, 12, 5, 3, hair, (x, y) => y <= 15);
    return;
  }
  if (s.hair === "pigtails") {
    hairCap(p, hair, 1, 14);
    p.discShade(9, 16, 5, 4.5, hair);
    p.discShade(39, 16, 5, 4.5, hair);
    p.rect(7, 19, 5, 2, mix(hair, 45));
    p.rect(36, 19, 5, 2, mix(hair, 45));
    return;
  }
  hairCap(p, hair, 1, hem);
}

function punchFace(p: Pix, skin: string, back: boolean) {
  if (back) return;
  p.discShade(HEAD.cx, HEAD.cy, HEAD.rx, HEAD.ry, skin, (x, y) => y >= FACE_Y && inHead(x, y, 0));
}

function drawBottom(p: Pix, s: Style, bot: string, walk: 0 | 1) {
  const wob = walk ? 1 : 0;
  const belt = mix(bot, -28);
  if (s.bot === "skirt") {
    p.trap(17, 31, 45, 12, 36, 57, bot);
    p.rect(17, 45, 14, 2, belt);
    p.rect(20, 48, 1, 8, mix(bot, -20));
    p.rect(24, 48, 1, 8, mix(bot, 16));
    p.rect(28, 48, 1, 8, mix(bot, -20));
    return;
  }
  if (s.bot === "shorts") {
    if (s.girl) {
      p.trap(17, 31, 45, 14, 34, 55, bot);
      p.rect(17, 45, 14, 2, belt);
      return;
    }
    p.trap(16 + wob, 23 + wob, 45, 16 + wob, 22 + wob, 55, bot);
    p.trap(25 - wob, 32 - wob, 45, 26 - wob, 32 - wob, 55, bot);
    p.rect(16, 45, 16, 2, belt);
    return;
  }
  p.trap(16 + wob, 22 + wob, 45, 16 + wob, 22 + wob, 62, bot);
  p.trap(26 - wob, 32 - wob, 45, 26 - wob, 32 - wob, 62, bot);
  p.rect(16, 45, 16, 2, belt);
}

function drawShoes(p: Pix, s: Style, shoe: string, walk: 0 | 1) {
  const wob = walk ? 1 : 0;
  const white = rgb("#f4f4f6");
  const sole = mix(shoe, -42);
  const lx = 16 + wob;
  const rx = 32 - wob;
  if (s.shoe === "flats") {
    p.discShade(lx, 64, 5.5, 3.2, shoe);
    p.discShade(rx, 64, 5.5, 3.2, shoe);
    p.rect(lx - 5, 65, 10, 2, sole);
    p.rect(rx - 5, 65, 10, 2, sole);
    p.rect(lx - 2, 62, 5, 1, mix(shoe, 24));
    p.rect(rx - 2, 62, 5, 1, mix(shoe, 24));
    return;
  }
  p.discShade(lx, 63, 5.5, 3.6, shoe);
  p.discShade(rx, 63, 5.5, 3.6, shoe);
  p.block(lx - 5, 61, 10, 5, shoe);
  p.block(rx - 5, 61, 10, 5, shoe);
  p.rect(lx - 5, 65, 10, 2, sole);
  p.rect(rx - 5, 65, 10, 2, sole);
  const cap = shoe.toLowerCase() === "#f4f4f6" ? mix(shoe, -55) : white;
  p.rect(lx - 5, 63, 3, 2, cap);
  p.rect(rx + 2, 63, 3, 2, cap);
  p.rect(lx - 1, 61, 3, 1, white);
  p.rect(rx - 1, 61, 3, 1, white);
}

function drawTop(p: Pix, s: Style, top: string) {
  if (s.top === "hoodie") {
    if (s.girl) p.trap(15, 33, 31, 17, 31, 47, top);
    else p.trap(14, 34, 31, 16, 32, 47, top);
    p.trap(12, 18, 32, 9, 14, 49, top);
    p.trap(30, 36, 32, 34, 39, 49, top);
    p.discShade(CX, 31, 6, 4, top);
    p.block(19, 41, 10, 5, hexMix(top, -16));
    p.rect(22, 33, 1, 4, mix(top, 42));
    p.rect(25, 33, 1, 4, mix(top, 42));
    return;
  }
  if (s.girl) p.trap(16, 32, 32, 18, 30, 47, top);
  else p.trap(15, 33, 32, 17, 31, 47, top);
  p.trap(12, 18, 33, 11, 16, 42, top);
  p.trap(30, 36, 33, 32, 37, 42, top);
}

function drawHands(p: Pix, skin: string) {
  p.discShade(11, 51, 3.2, 3.2, skin);
  p.discShade(37, 51, 3.2, 3.2, skin);
}

export function paintLook(fig: Figure, opts: LookOpts = {}): Pix {
  const f = clampFigure(fig);
  const pal = palOf(f);
  const s: Style = { ...styleOf(f), girl: (f.gender ?? 0) === 1 };
  const back = !!opts.back;
  const walk = (opts.walk ?? 0) as 0 | 1;
  const p = new Pix(LOOK_W, LOOK_H);

  drawHoodBack(p, pal.top, s.top === "hoodie");
  drawHairBack(p, { ...s, girl: s.girl }, pal.hair, back);
  drawHead(p, pal.skin, s.girl);
  drawTorso(p, pal.skin, s.girl, walk);
  drawBottom(p, s, pal.bot, walk);
  drawShoes(p, s, pal.shoe, walk);
  drawTop(p, s, pal.top);
  drawHands(p, pal.skin);
  drawHairFront(p, s, pal.hair, back);
  punchFace(p, pal.skin, back);
  drawFace(p, s.girl, back);
  p.outline([22, 16, 26]);
  return p;
}

export function lookKey(fig: Figure, opts: LookOpts = {}) {
  const f = clampFigure(fig);
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
    opts.back ? 1 : 0,
    opts.walk ?? 0,
    opts.sit ? 1 : 0,
  ].join(".");
}
