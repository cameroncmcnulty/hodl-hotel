import type { Figure } from "../types";
import { mix, Pix, rgb } from "./pix";

export const SKIN = ["#fbe0c8", "#f0c3a0", "#d29b6b", "#a86b3c", "#6e4320", "#3d2614"];
export const HAIR_C = ["#1b1b1b", "#4a2c0a", "#c45c26", "#e8d07a", "#6b3fa0", "#14F195", "#ff6b5a", "#f5c542", "#2ec4b6", "#dfe7ff"];
export const TOPS = ["#ff6b5a", "#9945FF", "#14F195", "#2ec4b6", "#f5c542", "#24143d", "#ffffff", "#ff8fab", "#3b82f6", "#111111"];
export const BOTTOMS = ["#24143d", "#1e3a5f", "#4b5563", "#7c3aed", "#0f766e", "#9a3412", "#111111", "#f5c542"];
export const SHOES = ["#111111", "#ffffff", "#9945FF", "#ff6b5a", "#2ec4b6", "#f5c542"];
export const HAIR_STYLES = ["buzz", "tuft", "bob", "spike", "curl", "cap", "long", "mohawk", "pony", "bun", "fluff", "band"];
export const TOP_CUTS = ["tee", "hoodie", "vest", "tank", "sweater", "shirt"];
export const BOT_CUTS = ["pants", "shorts", "skirt", "cargo"];
export const ACC = ["none", "glasses", "shades", "headphones", "scarf", "pack", "visor", "bow"];

export const DEFAULT_FIGURE: Figure = {
  skin: 1,
  hair: 2,
  hairColor: 1,
  top: 1,
  bottom: 0,
  shoes: 0,
  acc: 0,
  topCut: 0,
  botCut: 0,
};

export function clampFigure(f: Partial<Figure> | undefined): Figure {
  const n = (v: unknown, max: number) => Math.max(0, Math.min(max, Number(v) || 0));
  return {
    skin: n(f?.skin, SKIN.length - 1),
    hair: n(f?.hair, HAIR_STYLES.length - 1),
    hairColor: n(f?.hairColor, HAIR_C.length - 1),
    top: n(f?.top, TOPS.length - 1),
    bottom: n(f?.bottom, BOTTOMS.length - 1),
    shoes: n(f?.shoes, SHOES.length - 1),
    acc: n(f?.acc, ACC.length - 1),
    topCut: n(f?.topCut, TOP_CUTS.length - 1),
    botCut: n(f?.botCut, BOT_CUTS.length - 1),
  };
}

const W = 44;
const H = 72;
const cache = new Map<string, HTMLCanvasElement>();

function tuft(p: Pix, x: number, y: number, col: string) {
  p.block(x, y, 4, 5, col);
  p.rect(x + 1, y - 2, 2, 3, mix(col, -20));
}

function hairBack(p: Pix, hx: number, hy: number, style: number, col: string, back: boolean) {
  const c = rgb(col);
  const d = mix(col, -42);
  const lit = mix(col, 28);
  if (style === 0) {
    p.disc(hx + 1, hy - 2, 10, 8, c);
    p.rect(hx - 6, hy - 8, 14, 4, lit);
  } else if (style === 1) {
    p.disc(hx + 1, hy - 3, 11, 9, c);
    p.rect(hx - 5, hy - 12, 12, 5, c);
    p.rect(hx - 3, hy - 14, 8, 3, lit);
  } else if (style === 2) {
    p.disc(hx + 1, hy - 2, 12, 11, c);
    p.disc(hx - 10, hy + 3, 6, 8, c);
    p.disc(hx + 11, hy + 2, 6, 9, c);
    p.rect(hx - 8, hy - 10, 18, 5, lit);
  } else if (style === 3) {
    p.disc(hx + 1, hy - 1, 11, 8, c);
    for (const [ox, oy, h] of [
      [-7, -14, 8],
      [-3, -17, 10],
      [1, -18, 11],
      [5, -16, 9],
      [8, -13, 7],
    ] as [number, number, number][]) {
      p.rect(hx + ox, hy + oy, 3, h, c);
      p.rect(hx + ox + 1, hy + oy, 1, 2, lit);
    }
  } else if (style === 4) {
    p.disc(hx - 8, hy - 5, 7, 7, c);
    p.disc(hx + 8, hy - 6, 7, 7, c);
    p.disc(hx, hy - 10, 7, 7, c);
    p.disc(hx + 1, hy - 2, 11, 9, c);
    p.rect(hx - 2, hy - 12, 4, 3, lit);
  } else if (style === 5) {
    p.block(hx - 11, hy - 9, 24, 10, col);
    p.rect(hx - 7, hy - 14, 16, 6, d);
    p.rect(hx - 5, hy - 16, 12, 3, mix(col, 20));
    p.disc(hx + 1, hy - 2, 11, 6, c);
  } else if (style === 6) {
    p.disc(hx + 1, hy - 2, 12, 10, c);
    p.block(hx - 13, hy + 2, 6, 22, col);
    p.block(hx + 9, hy + 1, 6, 24, col);
    p.rect(hx - 12, hy + 20, 5, 4, d);
    p.rect(hx + 10, hy + 22, 5, 4, d);
  } else if (style === 7) {
    p.disc(hx + 1, hy - 1, 10, 7, c);
    p.block(hx - 3, hy - 22, 8, 18, col);
    p.rect(hx - 2, hy - 24, 6, 3, lit);
    p.rect(hx - 1, hy - 8, 6, 4, d);
  } else if (style === 8) {
    p.disc(hx + 1, hy - 2, 11, 9, c);
    p.rect(hx - 6, hy - 9, 14, 4, lit);
    if (back) {
      p.block(hx - 2, hy + 8, 5, 14, col);
      p.disc(hx, hy + 22, 4, 5, c);
    } else {
      p.block(hx + 11, hy + 2, 5, 16, col);
      p.disc(hx + 13, hy + 18, 4, 5, c);
    }
  } else if (style === 9) {
    p.disc(hx + 1, hy - 2, 11, 9, c);
    const bx = back ? hx : hx + 9;
    p.disc(bx, hy - 12, 6, 6, c);
    p.disc(bx, hy - 14, 5, 4, d);
    p.rect(bx - 1, hy - 8, 3, 4, c);
  } else if (style === 10) {
    p.disc(hx + 1, hy - 3, 13, 11, c);
    tuft(p, hx - 14, hy - 2, col);
    tuft(p, hx + 12, hy - 4, col);
    tuft(p, hx - 12, hy - 8, col);
    p.rect(hx - 8, hy - 12, 16, 5, lit);
  } else {
    p.disc(hx + 1, hy - 2, 11, 9, c);
    p.block(hx - 11, hy - 6, 24, 5, col);
    p.rect(hx - 9, hy - 8, 20, 3, d);
  }
}

function hairFront(p: Pix, hx: number, hy: number, style: number, col: string, back: boolean) {
  if (back) return;
  const c = rgb(col);
  const d = mix(col, -30);
  if (style === 1 || style === 2 || style === 4 || style === 10) {
    p.rect(hx - 6, hy - 7, 15, 4, c);
    p.rect(hx - 5, hy - 5, 5, 4, d);
    p.rect(hx + 4, hy - 6, 6, 3, c);
  }
  if (style === 6) {
    p.rect(hx - 8, hy - 6, 7, 5, c);
    p.rect(hx + 3, hy - 6, 7, 5, c);
  }
  if (style === 8 || style === 9) p.rect(hx - 5, hy - 6, 12, 3, c);
  if (style === 0) p.rect(hx - 5, hy - 8, 12, 3, c);
}

function paintDoll(
  fig: Figure,
  back: boolean,
  frame: number,
  sit: boolean,
  dance: boolean
) {
  const p = new Pix(W, H);
  const skin = SKIN[fig.skin];
  const hair = HAIR_C[fig.hairColor];
  const top = TOPS[fig.top];
  const bot = BOTTOMS[fig.bottom];
  const shoe = SHOES[fig.shoes];
  const cut = fig.topCut ?? 0;
  const bcut = fig.botCut ?? 0;
  const hx = 22;
  const hy = 18;
  const bob = dance ? (frame % 2 === 0 ? -2 : 0) : 0;
  const walk = frame % 4;
  const farKick = walk === 1 ? 3 : walk === 3 ? -2 : 0;
  const nearKick = walk === 3 ? 3 : walk === 1 ? -2 : 0;

  hairBack(p, hx, hy + bob, fig.hair, hair, back);

  p.discShade(hx, hy + bob, 10, 11, skin);
  p.block(hx - 12, hy + bob, 4, 6, skin);
  p.block(hx + 9, hy + 1 + bob, 4, 6, skin);

  hairFront(p, hx, hy + bob, fig.hair, hair, back);

  if (!back) {
    p.rect(hx - 5, hy - 4 + bob, 4, 1, mix(skin, -55));
    p.rect(hx + 3, hy - 4 + bob, 4, 1, mix(skin, -55));
    p.rect(hx - 4, hy - 1 + bob, 4, 4, [252, 252, 252]);
    p.rect(hx + 4, hy - 1 + bob, 4, 4, [252, 252, 252]);
    p.rect(hx - 3, hy + bob, 2, 2, [18, 12, 22]);
    p.rect(hx + 5, hy + bob, 2, 2, [18, 12, 22]);
    p.rect(hx + 6, hy - 1 + bob, 1, 1, [255, 255, 255]);
    p.rect(hx - 4, hy + 4 + bob, 3, 1, mix(skin, 22));
    p.rect(hx + 5, hy + 4 + bob, 3, 1, mix(skin, 22));
    p.rect(hx, hy + 6 + bob, 4, 1, mix(skin, -42));
    p.rect(hx + 1, hy + 7 + bob, 2, 1, mix(skin, -28));
    if (fig.acc === 1) {
      p.rect(hx - 6, hy - 3 + bob, 6, 5, [28, 28, 32]);
      p.rect(hx + 3, hy - 3 + bob, 6, 5, [28, 28, 32]);
      p.rect(hx - 5, hy - 2 + bob, 4, 3, [160, 210, 230]);
      p.rect(hx + 4, hy - 2 + bob, 4, 3, [160, 210, 230]);
    }
    if (fig.acc === 2) p.block(hx - 10, hy - 3 + bob, 22, 4, "#111111");
  }
  if (fig.acc === 3) {
    p.disc(hx - 12, hy - 1 + bob, 4, 4, [36, 36, 40]);
    p.disc(hx + 12, hy - 1 + bob, 4, 4, [36, 36, 40]);
    p.rect(hx - 8, hy - 6 + bob, 16, 2, mix("#14F195", 0));
  }
  if (fig.acc === 6) p.block(hx - 10, hy - 8 + bob, 22, 4, "#14F195");
  if (fig.acc === 7) p.disc(hx + 10, hy - 10 + bob, 4, 4, rgb("#ff6b5a"));

  p.block(hx - 2, 28 + bob, 5, 4, skin);

  const farArmX = 8;
  const nearArmX = 31;
  const armY = 32 + bob + (dance ? -4 : 0);
  p.block(farArmX, armY, 5, 14, skin);
  p.rect(farArmX, armY + 13, 5, 3, mix(skin, -22));
  p.rect(farArmX + 1, armY + 15, 4, 2, mix(skin, -10));

  const ty = 31 + bob;
  if (cut === 1) {
    p.block(hx - 10, ty - 2, 22, 16, top);
    p.rect(hx - 4, ty + 2, 3, 7, [245, 245, 248]);
    p.rect(hx + 2, ty + 2, 3, 7, [245, 245, 248]);
    p.disc(hx + 1, hy + 8 + bob, 9, 5, rgb(top));
    p.rect(hx - 8, ty - 2, 18, 4, mix(top, 24));
  } else if (cut === 2) {
    p.block(hx - 9, ty, 20, 14, top);
    p.rect(hx - 6, ty + 2, 14, 10, [248, 248, 248]);
    p.block(hx - 10, ty - 2, 6, 14, top);
    p.block(hx + 6, ty - 2, 6, 14, top);
    p.rect(hx - 5, ty + 1, 12, 2, mix(top, 18));
  } else if (cut === 3) {
    p.block(hx - 8, ty + 2, 18, 12, top);
    p.rect(hx - 9, ty, 4, 6, rgb(skin));
    p.rect(hx + 7, ty, 4, 6, rgb(skin));
    p.rect(hx - 7, ty + 2, 16, 3, mix(top, 26));
  } else if (cut === 4) {
    p.block(hx - 11, ty - 2, 24, 17, top);
    p.rect(hx - 9, ty, 20, 4, mix(top, 22));
    p.rect(hx - 3, ty + 8, 8, 2, mix(top, -28));
  } else if (cut === 5) {
    p.block(hx - 9, ty, 20, 15, top);
    p.rect(hx - 2, ty + 4, 7, 2, mix(top, -40));
    p.rect(hx - 8, ty, 18, 3, mix(top, 20));
  } else {
    p.block(hx - 9, ty, 20, 15, top);
    p.rect(hx - 8, ty, 18, 4, mix(top, 28));
    p.rect(hx - 8, ty + 12, 18, 2, mix(top, -24));
    p.block(farArmX, armY + 1, 6, 6, top);
    p.block(nearArmX, armY + 2, 6, 6, top);
  }

  p.block(nearArmX, armY + 1, 5, 14, skin);
  p.rect(nearArmX, armY + 14, 5, 3, mix(skin, -22));
  p.rect(nearArmX, armY + 16, 5, 2, mix(skin, -8));

  if (fig.acc === 4) p.block(hx - 7, ty - 2, 16, 5, "#ff6b5a");
  if (fig.acc === 5) p.block(hx - 6, ty + 5, 14, 10, "#3d2a18");

  const hip = sit ? 46 + bob : 46 + bob;
  const farLegX = 12 + (sit ? 0 : farKick);
  const nearLegX = 23 + (sit ? 0 : nearKick);
  const legH = sit ? 8 : 16;
  if (bcut === 2) {
    p.block(hx - 9, hip, 20, 10, bot);
    p.rect(hx - 8, hip, 18, 3, mix(bot, 22));
    p.block(farLegX, hip + 9, 6, sit ? 4 : 8, skin);
    p.block(nearLegX, hip + 10, 6, sit ? 4 : 8, skin);
  } else if (bcut === 1) {
    p.block(farLegX - 1, hip, 7, 9, bot);
    p.block(nearLegX - 1, hip + 1, 7, 9, bot);
    p.block(farLegX, hip + 9, 6, 7, skin);
    p.block(nearLegX, hip + 10, 6, 7, skin);
  } else if (bcut === 3) {
    p.block(farLegX - 1, hip, 8, legH, bot);
    p.block(nearLegX - 1, hip + 1, 8, legH, bot);
    p.rect(farLegX - 1, hip + 5, 8, 2, mix(bot, -32));
    p.rect(nearLegX - 1, hip + 6, 8, 2, mix(bot, -32));
  } else {
    p.block(farLegX - 1, hip, 7, legH, bot);
    p.block(nearLegX - 1, hip + 1, 7, legH, bot);
    p.rect(farLegX, hip, 5, 4, mix(bot, 20));
    p.rect(nearLegX, hip + 1, 5, 4, mix(bot, 20));
    p.rect(farLegX, hip + legH - 3, 5, 2, mix(bot, -28));
    p.rect(nearLegX, hip + legH - 2, 5, 2, mix(bot, -28));
  }

  const shoeY = sit ? 60 + bob : 63 + bob;
  p.block(farLegX - 1 + (sit ? 0 : farKick), shoeY, 8, 5, shoe);
  p.block(nearLegX - 1 + (sit ? 0 : nearKick), shoeY + 2, 8, 5, shoe);
  p.rect(farLegX + (sit ? 0 : farKick), shoeY, 6, 1, mix(shoe, 36));
  p.rect(nearLegX + (sit ? 0 : nearKick), shoeY + 2, 6, 1, mix(shoe, 36));
  p.rect(farLegX + 4 + (sit ? 0 : farKick), shoeY + 3, 3, 1, mix(shoe, -40));
  p.rect(nearLegX + 4 + (sit ? 0 : nearKick), shoeY + 5, 3, 1, mix(shoe, -40));

  p.outline([14, 8, 20]);
  return p;
}

function raster(fig: Figure, dir: 0 | 1 | 2 | 3, frame: number, sit: boolean, dance: boolean) {
  const f = clampFigure(fig);
  const key = `${f.skin}.${f.hair}.${f.hairColor}.${f.top}.${f.bottom}.${f.shoes}.${f.acc}.${f.topCut}.${f.botCut}.${dir}.${frame}.${sit}.${dance}`;
  const hit = cache.get(key);
  if (hit) return hit;
  const back = dir === 2 || dir === 3;
  const pix = paintDoll(f, back, frame, sit, dance);
  const src = pix.canvas();
  const flip = dir === 1 || dir === 2;
  const out = document.createElement("canvas");
  out.width = W;
  out.height = H;
  const ctx = out.getContext("2d")!;
  ctx.imageSmoothingEnabled = false;
  if (flip) {
    ctx.translate(W, 0);
    ctx.scale(-1, 1);
  }
  ctx.drawImage(src, 0, 0);
  cache.set(key, out);
  if (cache.size > 400) {
    const first = cache.keys().next().value;
    if (first) cache.delete(first);
  }
  return out;
}

export function drawAvatarFront(ctx: CanvasRenderingContext2D, fig: Figure, cx: number, cy: number, scale = 3) {
  const spr = raster(fig, 0, 0, false, false);
  const s = Math.max(2, Math.round(scale));
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(spr, Math.round(cx - (W * s) / 2), Math.round(cy - H * s * 0.72), W * s, H * s);
}

export type AvatarDrawOpts = { dance?: boolean; walking?: boolean; sit?: boolean; dist?: number };

export function drawAvatarIso(
  ctx: CanvasRenderingContext2D,
  fig: Figure,
  sx: number,
  sy: number,
  dir: 0 | 1 | 2 | 3,
  t: number,
  opts: AvatarDrawOpts = {}
) {
  const walking = !!opts.walking;
  const dance = !!opts.dance;
  const sit = !!opts.sit && !walking;
  const frame = dance ? Math.floor(t * 8) % 4 : walking ? Math.floor((opts.dist || 0) * 4) % 4 : 0;
  const spr = raster(fig, dir, frame, sit, dance);
  const scale = 2;
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(spr, Math.round(sx - (W * scale) / 2), Math.round(sy - H * scale + 18), W * scale, H * scale);
}

export function shade(hex: string, amt: number) {
  const [r, g, b] = mix(hex, amt);
  return `rgb(${r},${g},${b})`;
}

export function isoBox(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  d: number,
  h: number,
  top: string,
  left: string,
  right: string
) {
  const tw = w;
  const td = d;
  const topPts = [
    [x, y - h],
    [x + tw, y - h + tw * 0.5],
    [x + tw - td, y - h + (tw + td) * 0.5],
    [x - td, y - h + td * 0.5],
  ];
  const leftPts = [
    [x, y - h],
    [x - td, y - h + td * 0.5],
    [x - td, y + td * 0.5],
    [x, y],
  ];
  const rightPts = [
    [x, y - h],
    [x + tw, y - h + tw * 0.5],
    [x + tw, y + tw * 0.5],
    [x, y],
  ];
  const poly = (pts: number[][], fill: string) => {
    ctx.fillStyle = fill;
    ctx.strokeStyle = "rgba(0,0,0,0.45)";
    ctx.beginPath();
    ctx.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  };
  poly(topPts, top);
  poly(leftPts, left);
  poly(rightPts, right);
}
