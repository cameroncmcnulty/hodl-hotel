import type { Figure } from "../types";
import { hexMix, mix, Pix, rgb } from "./pix";

export const LOOK_W = 96;
export const LOOK_H = 176;
export const LOOK_SCALE = 1;

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
  "0-sneakers": ["#8a8f98", "#f4f4f6", "#2a2a32", "#3b82f6", "#c41e3a"],
  "0-hightops": ["#2a2a32", "#c41e3a", "#f4f4f6", "#7c3aed", "#6b7280"],
  "0-boots": ["#2a2a32", "#6d4c2f", "#c41e3a", "#6b7280", "#f4f4f6"],
  "0-skate": ["#2a2a32", "#f4f4f6", "#c41e3a", "#3b82f6", "#6b7280"],
  "0-slides": ["#2a2a32", "#f4f4f6", "#c41e3a", "#3b82f6", "#6b7280"],
  "1-sneakers": ["#8a8f98", "#f4f4f6", "#2a2a32", "#ff8fab", "#3b82f6"],
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

type Pose = "se" | "ne";
type RGB = [number, number, number];

const INK: RGB = [16, 12, 18];
const WHITE: RGB = [255, 255, 255];
const CREAM = "#e8e2d6";

function palOf(f: Figure) {
  return {
    skin: SKIN[f.skin] || SKIN[1],
    hair: hairColors(f.gender ?? 0)[f.hairColor] || HAIR_BOY_C[0],
    top: topColors(f.gender ?? 0, f.topCut ?? 0)[f.top] || TOPS[0],
    bot: botColors(f.gender ?? 0, f.botCut ?? 0)[f.bottom] || BOTTOMS[0],
    shoe: shoeColors(f.gender ?? 0, f.shoeCut ?? 0)[f.shoes] || SHOES[0],
  };
}

function ball(p: Pix, cx: number, cy: number, rx: number, ry: number, hex: string) {
  const hi = mix(hex, 40);
  const mid = rgb(hex);
  const lo = mix(hex, -38);
  for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++) {
    for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) {
      const dx = (x - cx) / rx;
      const dy = (y - cy) / ry;
      if (dx * dx + dy * dy > 1.02) continue;
      const n = dx * 0.55 + dy * 0.65;
      p.set(x, y, n < -0.42 ? hi : n > 0.4 ? lo : mid);
    }
  }
}

function faceFill(p: Pix, cx: number, cy: number, rx: number, ry: number, hex: string) {
  const hi = mix(hex, 16);
  const mid = rgb(hex);
  const lo = mix(hex, -14);
  for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++) {
    for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) {
      const dx = (x - cx) / rx;
      const dy = (y - cy) / ry;
      if (dx * dx + dy * dy > 1.02) continue;
      const n = dx * 0.35 + dy * 0.4;
      p.set(x, y, n < -0.55 ? hi : n > 0.6 ? lo : mid);
    }
  }
}

function iso(p: Pix, x: number, y: number, w: number, h: number, hex: string, rad = 4) {
  const x0 = Math.round(x);
  const y0 = Math.round(y);
  const ww = Math.round(w);
  const hh = Math.round(h);
  const r = Math.max(0, Math.min(rad, Math.floor(ww / 2) - 1, Math.floor(hh / 2) - 1));
  const hi = mix(hex, 36);
  const mid = rgb(hex);
  const lo = mix(hex, -34);
  const dk = mix(hex, -54);
  const split = Math.floor(ww * 0.55);
  for (let j = 0; j < hh; j++) {
    for (let i = 0; i < ww; i++) {
      if (r > 0) {
        const rr = r * r;
        if (i < r && j < r && (r - i) * (r - i) + (r - j) * (r - j) > rr) continue;
        if (i > ww - 1 - r && j < r && (i - (ww - 1 - r)) * (i - (ww - 1 - r)) + (r - j) * (r - j) > rr) continue;
        if (i < r && j > hh - 1 - r && (r - i) * (r - i) + (j - (hh - 1 - r)) * (j - (hh - 1 - r)) > rr) continue;
        if (i > ww - 1 - r && j > hh - 1 - r && (i - (ww - 1 - r)) * (i - (ww - 1 - r)) + (j - (hh - 1 - r)) * (j - (hh - 1 - r)) > rr)
          continue;
      }
      let c: RGB = mid;
      if (i < split) c = j === 0 || i <= 1 ? hi : mid;
      else c = i >= ww - 2 ? dk : lo;
      if (j >= hh - 2) c = i < split ? lo : dk;
      p.set(x0 + i, y0 + j, c);
    }
  }
}

function tube(p: Pix, x: number, y: number, w: number, h: number, hex: string) {
  const ww = Math.max(4, Math.round(w));
  const hh = Math.max(ww, Math.round(h));
  const r = ww / 2;
  ball(p, x + r, y + r, r, r * 0.9, hex);
  iso(p, x, y + r - 1, ww, Math.max(1, hh - ww + 2), hex, 0);
  ball(p, x + r, y + hh - r, r, r * 0.9, hex);
}

function ink(p: Pix, x: number, y: number, w = 1, h = 1) {
  p.rect(x, y, w, h, INK);
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

function sleeveOf(top: string): "none" | "short" | "long" {
  if (top === "tank") return "none";
  if (top === "tee") return "short";
  return "long";
}

function faceSE(p: Pix, girl: boolean) {
  p.disc(44, 80, 3.2, 3.6, WHITE);
  p.disc(55, 79, 2.9, 3.3, WHITE);
  p.disc(44, 81, 1.6, 1.9, INK);
  p.disc(55, 80, 1.5, 1.8, INK);
  p.set(45, 79, WHITE);
  p.set(56, 78, WHITE);
  ink(p, 41, 75, 5, 1);
  ink(p, 52, 74, 5, 1);
  if (girl) {
    p.disc(41, 86, 2.0, 1.4, [224, 144, 152]);
    p.disc(58, 85, 2.0, 1.4, [224, 144, 152]);
  }
  ink(p, 47, 90, 4, 1);
}

function hairBehind(p: Pix, style: string, col: string, girl: boolean, pose: Pose) {
  if (girl && (style === "pony" || style === "long" || style === "waves" || style === "pigtails")) {
    if (style === "pony") {
      ball(p, 28, 72, 8, 10, col);
      tube(p, 22, 74, 10, 28, col);
      ball(p, 27, 104, 7, 7, col);
    } else if (style === "pigtails") {
      ball(p, 24, 68, 7, 8, col);
      ball(p, 72, 66, 7, 8, col);
      tube(p, 20, 72, 8, 16, col);
      tube(p, 70, 70, 8, 16, col);
      ball(p, 24, 90, 6, 6, col);
      ball(p, 74, 88, 6, 6, col);
    } else {
      tube(p, 22, 78, 12, 36, col);
      tube(p, 62, 78, 12, 36, col);
      ball(p, 28, 114, 8, 8, col);
      ball(p, 68, 114, 8, 8, col);
      if (style === "waves") {
        ball(p, 24, 92, 8, 9, col);
        ball(p, 70, 92, 8, 9, col);
      }
    }
  }
  if (pose === "ne" && style === "afro") ball(p, 50, 68, 32, 30, col);
}

function hairOn(p: Pix, style: string, col: string, girl: boolean, pose: Pose) {
  if (pose === "ne") {
    ball(p, 50, 66, 26, 24, col);
    ball(p, 32, 70, 12, 14, col);
    ball(p, 68, 70, 12, 14, col);
    ball(p, 50, 46, 14, 12, col);
    if (style === "afro") {
      ball(p, 50, 64, 32, 30, col);
      ball(p, 26, 58, 12, 12, col);
      ball(p, 74, 58, 12, 12, col);
    }
    if (style === "mohawk") {
      iso(p, 46, 34, 8, 36, col, 2);
      p.spike(50, 30, 54, 5, col);
    }
    if (style === "spikes") {
      p.spike(36, 36, 62, 4, col);
      p.spike(46, 32, 60, 5, col);
      p.spike(56, 32, 60, 5, col);
      p.spike(66, 36, 62, 4, col);
    }
    if (girl && style === "bun") ball(p, 50, 38, 11, 10, col);
    if (girl && style === "bob") {
      ball(p, 32, 78, 10, 12, col);
      ball(p, 68, 78, 10, 12, col);
    }
    return;
  }

  if (style === "afro") {
    ball(p, 50, 64, 30, 28, col);
    ball(p, 26, 62, 12, 13, col);
    ball(p, 74, 60, 12, 13, col);
    ball(p, 40, 42, 12, 11, col);
    ball(p, 62, 40, 12, 11, col);
    return;
  }
  if (!girl && style === "mohawk") {
    iso(p, 46, 36, 8, 32, col, 2);
    p.spike(50, 32, 58, 5, col);
    return;
  }
  if (!girl && style === "spikes") {
    ball(p, 50, 52, 14, 10, col);
    p.spike(36, 38, 64, 4, col);
    p.spike(46, 34, 60, 5, col);
    p.spike(56, 34, 60, 5, col);
    p.spike(66, 38, 64, 4, col);
    return;
  }

  ball(p, 50, 54, 22, 16, col);
  ball(p, 32, 68, 11, 14, col);
  ball(p, 68, 66, 9, 12, col);
  ball(p, 50, 44, 12, 10, col);

  if (!girl && style === "side") {
    ball(p, 34, 52, 14, 14, col);
    ball(p, 62, 60, 8, 8, col);
  }
  if (!girl && style === "undercut") {
    iso(p, 36, 58, 28, 3, hexMix(col, -40), 0);
  }
  if (girl && style === "bob") {
    ball(p, 32, 76, 10, 12, col);
    ball(p, 68, 74, 10, 12, col);
  }
  if (girl && style === "bun") ball(p, 50, 36, 11, 10, col);

  ball(p, 42, 56, 7, 6, col);
  ball(p, 54, 54, 7, 6, col);
}

function punchFace(p: Pix, skin: string, pose: Pose, style: string) {
  if (pose === "ne") return;
  if (style === "mohawk") {
    faceFill(p, 50, 72, 24, 24, skin);
    return;
  }
  faceFill(p, 52, 82, 17, 16, skin);
}

function paintPose(f: Figure, pose: Pose, walk: number, sit: boolean) {
  const girl = (f.gender ?? 0) === 1;
  const pal = palOf(f);
  const hairName = hairsFor(f.gender ?? 0)[f.hair] || defaultHairName(f.gender ?? 0);
  const topName = topsFor(f.gender ?? 0)[f.topCut ?? 0] || "hoodie";
  const botName = botsFor(f.gender ?? 0)[f.botCut ?? 0] || (girl ? "skirt" : "pants");
  const shoeName = shoesFor(f.gender ?? 0)[f.shoeCut ?? 0] || "sneakers";
  const sleeve = sleeveOf(topName);
  const p = new Pix(LOOK_W, LOOK_H);
  const a = walk ? 3 : 0;
  const b = walk ? -3 : 0;
  const lift = sit ? -10 : 0;
  const skirt = girl && (botName === "skirt" || botName === "pleat");
  const short = botName === "shorts";

  hairBehind(p, hairName, pal.hair, girl, pose);

  if (sleeve === "none") tube(p, 30, 100, 9, 36, pal.skin);
  else if (sleeve === "short") {
    tube(p, 30, 100, 9, 14, pal.top);
    tube(p, 31, 112, 8, 24, pal.skin);
  } else tube(p, 30, 98, 9, 40, pal.top);

  tube(p, 38, 128 + a + lift, 11, 36, pal.skin);
  tube(p, 50, 126 + b + lift, 12, 38, pal.skin);

  if (skirt) {
    for (let y = 122; y <= 150; y++) {
      const t = (y - 122) / 28;
      const w = Math.round(12 + t * 11);
      iso(p, 50 - w, y + lift, w * 2, 1, pal.bot, 0);
    }
    iso(p, 38, 122 + lift, 24, 5, pal.bot, 2);
    if (botName === "pleat") {
      ink(p, 44, 128 + lift, 1, 16);
      ink(p, 50, 128 + lift, 1, 18);
      ink(p, 56, 128 + lift, 1, 16);
    }
  } else {
    const pantH = short ? 20 : 38;
    tube(p, 38, 124 + a + lift, 12, pantH, pal.bot);
    tube(p, 49, 122 + b + lift, 13, pantH + 2, pal.bot);
    iso(p, 36, 122 + lift, 28, 10, pal.bot, 3);
    if (botName === "cargo") {
      iso(p, 32, 136 + lift, 8, 10, hexMix(pal.bot, -16), 2);
      iso(p, 56, 136 + lift, 8, 10, hexMix(pal.bot, -16), 2);
    }
    if (botName === "joggers") {
      iso(p, 38, 150 + lift, 12, 5, hexMix(pal.bot, -20), 2);
      iso(p, 50, 150 + lift, 13, 5, hexMix(pal.bot, -20), 2);
    }
    if (botName === "jeans") {
      p.rect(44, 132 + lift, 1, 18, mix(pal.bot, 40));
      p.rect(56, 130 + lift, 1, 18, mix(pal.bot, 40));
    }
  }

  const shoeY = (shoeName === "boots" ? 142 : shoeName === "hightops" ? 146 : skirt ? 150 : 152) + lift;
  const shoeH = 166 + lift - shoeY;
  iso(p, 36, shoeY + a, 14, shoeH, pal.shoe, 3);
  iso(p, 51, shoeY - 2 + b, 15, shoeH + 2, pal.shoe, 3);
  if (shoeName !== "boots") {
    iso(p, 36, 162 + lift + a, 14, 4, "#f0f0f2", 2);
    iso(p, 51, 160 + lift + b, 15, 4, "#f0f0f2", 2);
  } else {
    iso(p, 36, 160 + lift + a, 14, 6, hexMix(pal.shoe, -24), 2);
    iso(p, 51, 158 + lift + b, 15, 6, hexMix(pal.shoe, -24), 2);
  }

  iso(p, 38, 94, 26, 38, pal.top, 6);
  ball(p, 50, 100, 11, 7, pal.top);

  if (topName === "hoodie") {
    ball(p, 50, 96, 12, 7, hexMix(pal.top, -18));
    if (pose === "ne") ball(p, 50, 88, 14, 10, hexMix(pal.top, -16));
  } else if (topName === "sweater") {
    iso(p, 42, 92, 16, 6, hexMix(pal.top, -18), 3);
  } else if (topName === "jacket") {
    iso(p, 48, 96, 5, 34, CREAM, 1);
    ink(p, 50, 98, 1, 30);
  } else if (topName === "tank") {
    iso(p, 42, 96, 4, 7, hexMix(pal.top, -20), 1);
    iso(p, 56, 96, 4, 7, hexMix(pal.top, -20), 1);
  } else {
    ball(p, 50, 96, 7, 4, hexMix(pal.top, -16));
  }

  if (sleeve === "none") tube(p, 58, 100, 10, 36, pal.skin);
  else if (sleeve === "short") {
    tube(p, 58, 100, 10, 15, pal.top);
    tube(p, 59, 113, 9, 22, pal.skin);
  } else tube(p, 58, 98, 10, 40, pal.top);

  ball(p, 35, 136, 5.2, 4.8, pal.skin);
  ball(p, 64, 134, 5.4, 5.0, pal.skin);

  ball(p, 50, 74, 25, 26, pal.skin);

  hairOn(p, hairName, pal.hair, girl, pose);
  punchFace(p, pal.skin, pose, hairName);
  if (pose === "se") {
    if (hairName !== "mohawk" && hairName !== "afro") {
      ball(p, 44, 62, 7, 6, pal.hair);
      ball(p, 56, 60, 7, 6, pal.hair);
    }
    if (hairName === "afro") {
      ball(p, 42, 58, 8, 7, pal.hair);
      ball(p, 62, 56, 8, 7, pal.hair);
    }
    faceSE(p, girl);
  }

  p.outline(INK);
  return p;
}

export function paintLook(fig: Figure, opts: LookOpts = {}): Pix {
  const f = clampFigure(fig);
  const view = opts.view ?? (opts.back ? 2 : 1);
  const walk = opts.walk ?? 0;
  const sit = !!opts.sit;
  if (view === 0) return flipH(paintPose(f, "se", walk, sit));
  if (view === 2) return paintPose(f, "ne", walk, sit);
  if (view === 3) return flipH(paintPose(f, "ne", walk, sit));
  return paintPose(f, "se", walk, sit);
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
