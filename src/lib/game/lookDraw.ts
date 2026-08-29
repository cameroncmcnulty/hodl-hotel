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
const HEAD = { cx: 24, cy: 18, rx: 12, ry: 13 };
const FACE_Y = 16;

function inHead(x: number, y: number, pad = 0) {
  const dx = x - HEAD.cx;
  const dy = y - HEAD.cy;
  const rx = HEAD.rx + pad;
  const ry = HEAD.ry + pad;
  return (dx * dx) / (rx * rx) + (dy * dy) / (ry * ry) <= 1.02;
}

function drawHead(p: Pix, skin: string, girl: boolean) {
  p.discShade(HEAD.cx, HEAD.cy, HEAD.rx, HEAD.ry, skin);
  p.discShade(HEAD.cx, HEAD.cy + 2, HEAD.rx - 1, HEAD.ry - 2, skin);
  p.discShade(11, 20, 2.8, 3.6, skin);
  p.discShade(37, 20, 2.8, 3.6, skin);
  p.block(21, 30, 6, 4, skin);
  if (girl) {
    p.disc(17, 24, 1.7, 1.2, mix("#e89aa8", 8));
    p.disc(31, 24, 1.7, 1.2, mix("#e89aa8", 8));
  }
}

function drawTorso(p: Pix, skin: string, girl: boolean, walk: 0 | 1) {
  const wob = walk ? 1 : 0;
  if (girl) p.trap(16, 32, 33, 18, 30, 48, skin);
  else p.trap(15, 33, 33, 17, 31, 48, skin);
  p.discShade(CX, 47, girl ? 7 : 8, 3, skin);
  p.capsule(10, 34, 5, 16, skin);
  p.capsule(33, 34, 5, 16, skin);
  p.capsule(16 + wob, 47, 6, 15, skin);
  p.capsule(26 - wob, 47, 6, 15, skin);
}

function drawEye(p: Pix, cx: number, cy: number, girl: boolean) {
  const ink: [number, number, number] = [22, 16, 26];
  const white: [number, number, number] = [255, 252, 250];
  const shine: [number, number, number] = [255, 255, 255];
  p.disc(cx, cy, 3.8, 4.3, ink);
  p.disc(cx, cy, 3.0, 3.5, white);
  p.disc(cx, cy + 0.4, 2.55, 2.85, ink);
  p.set(cx - 1, cy - 1, shine);
  p.set(cx, cy - 1, shine);
  if (girl) {
    p.set(cx - 3, cy - 3, ink);
    p.set(cx + 3, cy - 3, ink);
  }
}

function drawFace(p: Pix, girl: boolean, back: boolean) {
  if (back) return;
  drawEye(p, 19, 19, girl);
  drawEye(p, 29, 19, girl);
}

function hairCap(p: Pix, hex: string, extra = 1, hem = FACE_Y) {
  p.discShade(HEAD.cx, HEAD.cy - 2, HEAD.rx + extra, HEAD.ry + extra - 1, hex, (x, y) => y <= hem + 1 || !inHead(x, y, -1));
  p.discShade(HEAD.cx, HEAD.cy - 5, HEAD.rx + extra, HEAD.ry - 3, hex);
}

function drawHairBack(p: Pix, s: Style, hair: string, back: boolean) {
  if (s.hair === "pony") {
    p.discShade(38, 22, 4, 4, hair);
    p.discShade(40, 30, 4, 7, hair);
    p.discShade(40, 40, 3.5, 7, hair);
    p.discShade(39, 48, 3, 4, hair);
  }
  if (s.hair === "pigtails") {
    p.discShade(8, 18, 5, 5, hair);
    p.discShade(40, 18, 5, 5, hair);
    p.discShade(7, 26, 4.5, 6, hair);
    p.discShade(41, 26, 4.5, 6, hair);
  }
  if (s.hair === "long" || s.hair === "waves") {
    p.trap(10, 17, 18, 10, 16, 48, hair);
    p.trap(31, 38, 18, 32, 38, 48, hair);
    p.discShade(12, 48, 4, 3.5, hair);
    p.discShade(36, 48, 4, 3.5, hair);
    if (s.hair === "waves") {
      p.discShade(12, 26, 5, 6, hair);
      p.discShade(12, 38, 5, 6, hair);
      p.discShade(36, 26, 5, 6, hair);
      p.discShade(36, 38, 5, 6, hair);
    }
  }
  if (back) p.discShade(CX, 22, 9, 9, hair);
}

function drawHoodBack(p: Pix, top: string, isHoodie: boolean) {
  if (!isHoodie) return;
  p.discShade(CX, 18, 14, 13, top, (x, y) => y >= 10 && y <= 33 && (x <= 12 || x >= 36));
  p.discShade(CX, 30, 9, 5, top, (x, y) => y >= 27 && y <= 34 && Math.abs(x - CX) >= 5);
}

function drawHairFront(p: Pix, s: Style, hair: string, back: boolean) {
  const hem = back ? 28 : FACE_Y;
  if (s.hair === "afro") {
    p.discShade(CX, 16, 16, 15, hair);
    const bumps: [number, number, number, number][] = [
      [12, 10, 5, 18],
      [18, 6, 5, -16],
      [24, 4, 6, 12],
      [30, 6, 5, -20],
      [36, 10, 5, 14],
      [10, 16, 5, -14],
      [38, 16, 5, 10],
      [13, 22, 4, -18],
      [35, 22, 4, 16],
      [16, 9, 4, 20],
      [32, 9, 4, -12],
      [24, 9, 4, 8],
      [20, 14, 3, -10],
      [28, 13, 3, 14],
    ];
    for (const [x, y, r, amt] of bumps) p.discShade(x, y, r, r * 0.9, hexMix(hair, amt));
    return;
  }
  if (s.hair === "undercut") {
    p.discShade(CX, 10, 9, 7, hair);
    p.discShade(CX + 1, 8, 8, 6, hair);
    p.discShade(22, 9, 4, 4, hair, (x, y) => y <= 13);
    p.discShade(28, 8, 5, 5, hair, (x, y) => y <= 13);
    p.discShade(18, 11, 3, 3, hair, (x, y) => y <= 12);
    return;
  }
  if (s.hair === "spikes") {
    hairCap(p, hair, 0, 14);
    p.spike(15, 3, 12, 2.2, hair);
    p.spike(19, 1, 12, 2.5, hair);
    p.spike(23, 0, 12, 2.8, hair);
    p.spike(27, 1, 12, 2.5, hair);
    p.spike(31, 2, 12, 2.3, hair);
    p.spike(34, 4, 12, 2, hair);
    p.discShade(14, 12, 3, 4, hair, (x, y) => y <= 16);
    p.discShade(34, 12, 3, 4, hair, (x, y) => y <= 16);
    return;
  }
  if (s.hair === "messy") {
    hairCap(p, hair, 1, 15);
    p.discShade(16, 7, 4, 4, hair);
    p.discShade(21, 5, 4, 4, hair);
    p.discShade(26, 4, 4.5, 4.5, hair);
    p.discShade(31, 6, 4, 4, hair);
    p.discShade(34, 11, 4, 5, hair, (x, y) => y <= 17);
    p.discShade(14, 13, 3.5, 4, hair, (x, y) => y <= 17);
    p.trap(22, 36, 8, 26, 37, 16, hair);
    return;
  }
  if (s.hair === "side") {
    p.discShade(CX + 3, HEAD.cy - 3, HEAD.rx, HEAD.ry - 2, hair, (x, y) => y <= 15);
    p.discShade(29, 9, 8, 7, hair, (x, y) => y <= 16);
    p.discShade(33, 13, 5, 6, hair, (x, y) => y <= 18);
    p.trap(18, 36, 6, 22, 37, 15, hair);
    p.discShade(20, 10, 4, 3, hair, (x, y) => y <= 13);
    return;
  }
  if (s.hair === "pony") {
    hairCap(p, hair, 1, 15);
    p.discShade(22, 11, 7, 4, hair, (x, y) => y <= 16);
    p.discShade(16, 13, 4, 3, hair, (x, y) => y <= 16);
    p.trap(32, 38, 16, 36, 42, 24, hair);
    p.rect(35, 20, 5, 2, mix(hair, 40));
    return;
  }
  if (s.hair === "waves") {
    hairCap(p, hair, 2, 15);
    p.discShade(13, 18, 6, 9, hair, (x, y) => x <= 18 || y <= hem);
    p.discShade(35, 18, 6, 9, hair, (x, y) => x >= 30 || y <= hem);
    p.discShade(15, 14, 5, 4, hair, (x, y) => y <= 16);
    p.discShade(33, 14, 5, 4, hair, (x, y) => y <= 16);
    return;
  }
  if (s.hair === "bob") {
    hairCap(p, hair, 2, 16);
    p.discShade(CX, 19, 13, 12, hair, (x, y) => y <= 28 && (y <= hem || !inHead(x, y, -1)));
    p.discShade(12, 20, 4.5, 7, hair);
    p.discShade(36, 20, 4.5, 7, hair);
    p.discShade(18, 13, 5, 3, hair, (x, y) => y <= 16);
    p.discShade(30, 13, 4, 3, hair, (x, y) => y <= 16);
    return;
  }
  if (s.hair === "long") {
    hairCap(p, hair, 1, 15);
    p.trap(10, 17, 16, 10, 16, 48, hair);
    p.trap(31, 38, 16, 32, 38, 48, hair);
    p.discShade(18, 13, 6, 3, hair, (x, y) => y <= 16);
    p.discShade(12, 22, 4, 6, hair);
    p.discShade(36, 22, 4, 6, hair);
    return;
  }
  if (s.hair === "pigtails") {
    hairCap(p, hair, 1, 15);
    p.discShade(8, 16, 5.5, 5, hair);
    p.discShade(40, 16, 5.5, 5, hair);
    p.discShade(7, 24, 5, 6, hair);
    p.discShade(41, 24, 5, 6, hair);
    const band = mix(hair, 48);
    p.rect(6, 19, 5, 2, band);
    p.rect(37, 19, 5, 2, band);
    p.discShade(18, 13, 5, 3, hair, (x, y) => y <= 16);
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
    p.trap(17, 31, 46, 11, 37, 58, bot);
    p.discShade(CX, 57, 12, 3, bot);
    p.rect(17, 46, 14, 2, belt);
    p.rect(19, 49, 1, 8, mix(bot, -22));
    p.rect(23, 49, 1, 8, mix(bot, 18));
    p.rect(27, 49, 1, 8, mix(bot, -18));
    p.rect(31, 49, 1, 7, mix(bot, 12));
    return;
  }
  if (s.bot === "shorts") {
    if (s.girl) {
      p.trap(17, 31, 46, 13, 35, 55, bot);
      p.rect(17, 46, 14, 2, belt);
      p.rect(21, 48, 1, 6, mix(bot, -18));
      p.rect(26, 48, 1, 6, mix(bot, 14));
      return;
    }
    p.capsule(15 + wob, 46, 7, 10, bot);
    p.capsule(26 - wob, 46, 7, 10, bot);
    p.rect(16, 46, 16, 2, belt);
    return;
  }
  p.capsule(15 + wob, 46, 7, 16, bot);
  p.capsule(26 - wob, 46, 7, 16, bot);
  p.rect(16, 46, 16, 2, belt);
}

function drawShoes(p: Pix, s: Style, shoe: string, walk: 0 | 1) {
  const wob = walk ? 1 : 0;
  const white = rgb("#f4f4f6");
  const soleCol = mix("#c8c4cc", -20);
  const lx = 16 + wob;
  const rx = 32 - wob;
  if (s.shoe === "flats") {
    p.discShade(lx, 64, 5.8, 3.4, shoe);
    p.discShade(rx, 64, 5.8, 3.4, shoe);
    p.rect(lx - 5, 65, 11, 2, mix(shoe, -40));
    p.rect(rx - 5, 65, 11, 2, mix(shoe, -40));
    p.rect(lx - 3, 62, 7, 1, mix(shoe, 28));
    p.rect(rx - 3, 62, 7, 1, mix(shoe, 28));
    p.disc(lx + 3, 63, 1.4, 1.4, mix(shoe, 40));
    p.disc(rx + 3, 63, 1.4, 1.4, mix(shoe, 40));
    return;
  }
  p.discShade(lx, 63, 5.8, 3.8, shoe);
  p.discShade(rx, 63, 5.8, 3.8, shoe);
  p.block(lx - 5, 61, 10, 5, shoe);
  p.block(rx - 5, 61, 10, 5, shoe);
  p.rect(lx - 6, 65, 12, 3, soleCol);
  p.rect(rx - 6, 65, 12, 3, soleCol);
  const cap = shoe.toLowerCase() === "#f4f4f6" ? mix(shoe, -50) : white;
  p.rect(lx - 5, 63, 4, 3, cap);
  p.rect(rx + 1, 63, 4, 3, cap);
  p.rect(lx - 1, 61, 3, 1, white);
  p.rect(rx - 1, 61, 3, 1, white);
  p.set(lx, 62, white);
  p.set(rx, 62, white);
}

function drawTop(p: Pix, s: Style, top: string, skin: string) {
  if (s.top === "hoodie") {
    if (s.girl) p.trap(15, 33, 33, 17, 31, 48, top);
    else p.trap(14, 34, 33, 16, 32, 48, top);
    p.discShade(CX, 47, 8, 3, top);
    p.capsule(9, 34, 6, 16, top);
    p.capsule(33, 34, 6, 16, top);
    p.block(9, 47, 6, 3, hexMix(top, -18));
    p.block(33, 47, 6, 3, hexMix(top, -18));
    p.trap(18, 30, 40, 19, 29, 47, hexMix(top, -14));
    p.discShade(CX, 33, 7, 4, top);
    p.rect(21, 34, 1, 5, mix(top, 44));
    p.rect(26, 34, 1, 5, mix(top, 44));
    p.discShade(CX, 32, 3.2, 2.4, skin, (x, y) => y >= 30 && y <= 34);
    return;
  }
  if (s.girl) p.trap(16, 32, 34, 18, 30, 48, top);
  else p.trap(15, 33, 34, 17, 31, 48, top);
  p.discShade(CX, 47, 7, 2.5, top);
  p.capsule(10, 34, 6, 9, top);
  p.capsule(32, 34, 6, 9, top);
  p.block(10, 41, 6, 2, hexMix(top, -16));
  p.block(32, 41, 6, 2, hexMix(top, -16));
  p.discShade(CX, 34, 4, 3, skin, (x, y) => y >= 32 && y <= 37);
}

function drawHands(p: Pix, skin: string) {
  p.discShade(11, 51, 3.4, 3.3, skin);
  p.discShade(37, 51, 3.4, 3.3, skin);
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
  drawTop(p, s, pal.top, pal.skin);
  drawHands(p, pal.skin);
  drawHairFront(p, s, pal.hair, back);
  punchFace(p, pal.skin, back);
  drawFace(p, s.girl, back);
  p.outline([18, 12, 22]);
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
