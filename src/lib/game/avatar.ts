import type { Figure } from "../types";

export const SKIN = ["#fbe0c8", "#f0c3a0", "#d29b6b", "#a86b3c", "#6e4320", "#3d2614"];
export const HAIR_C = ["#1b1b1b", "#4a2c0a", "#c45c26", "#e8d07a", "#6b3fa0", "#14F195", "#ff6b5a", "#f5c542", "#2ec4b6", "#dfe7ff"];
export const TOPS = ["#ff6b5a", "#9945FF", "#14F195", "#2ec4b6", "#f5c542", "#24143d", "#ffffff", "#ff8fab", "#3b82f6", "#111111"];
export const BOTTOMS = ["#24143d", "#1e3a5f", "#4b5563", "#7c3aed", "#0f766e", "#9a3412", "#111111", "#f5c542"];
export const SHOES = ["#111111", "#ffffff", "#9945FF", "#ff6b5a", "#2ec4b6", "#f5c542"];
export const HAIR_STYLES = ["buzz", "tuft", "bob", "spike", "curl", "cap", "long", "mohawk"];
export const ACC = ["none", "glasses", "shades", "headphones", "scarf", "pack", "visor", "bow"];

export const DEFAULT_FIGURE: Figure = {
  skin: 1,
  hair: 2,
  hairColor: 1,
  top: 1,
  bottom: 0,
  shoes: 0,
  acc: 0,
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
  };
}

function cell(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, fill: string) {
  const ix = Math.round(x);
  const iy = Math.round(y);
  if (w < 1 || h < 1) return;
  ctx.fillStyle = "#0d0814";
  ctx.fillRect(ix, iy, w, h);
  ctx.fillStyle = fill;
  ctx.fillRect(ix + 1, iy + 1, Math.max(1, w - 2), Math.max(1, h - 2));
}

export function shade(hex: string, amt: number) {
  const n = parseInt(hex.replace("#", ""), 16);
  const r = Math.max(0, Math.min(255, ((n >> 16) & 255) + amt));
  const g = Math.max(0, Math.min(255, ((n >> 8) & 255) + amt));
  const b = Math.max(0, Math.min(255, (n & 255) + amt));
  return `rgb(${r},${g},${b})`;
}

function hairIso(
  ctx: CanvasRenderingContext2D,
  style: number,
  color: string,
  facingBack: boolean
) {
  const dark = shade(color, -40);
  if (style === 0) {
    cell(ctx, -13, -36, 26, 10, color);
  } else if (style === 1) {
    cell(ctx, -14, -38, 28, 12, color);
    cell(ctx, -8, -42, 16, 6, color);
  } else if (style === 2) {
    cell(ctx, -15, -36, 30, 14, color);
    cell(ctx, -16, -28, 8, 12, color);
    cell(ctx, 8, -28, 8, 12, color);
  } else if (style === 3) {
    cell(ctx, -14, -36, 28, 10, color);
    cell(ctx, -10, -48, 6, 14, color);
    cell(ctx, -2, -50, 6, 16, color);
    cell(ctx, 6, -46, 6, 12, color);
  } else if (style === 4) {
    cell(ctx, -16, -40, 12, 12, color);
    cell(ctx, 4, -40, 12, 12, color);
    cell(ctx, -6, -44, 12, 10, color);
    cell(ctx, -14, -34, 28, 8, color);
  } else if (style === 5) {
    cell(ctx, -16, -38, 32, 12, color);
    cell(ctx, -8, -44, 16, 8, color);
    cell(ctx, -4, -48, 8, 6, dark);
  } else if (style === 6) {
    cell(ctx, -14, -36, 28, 12, color);
    if (facingBack) cell(ctx, -8, -24, 16, 22, color);
    else cell(ctx, -6, -10, 10, 20, color);
  } else {
    cell(ctx, -4, -54, 8, 22, color);
    cell(ctx, -14, -36, 28, 10, color);
  }
}

export function drawAvatarFront(ctx: CanvasRenderingContext2D, fig: Figure, cx: number, cy: number, scale = 1) {
  const f = clampFigure(fig);
  ctx.save();
  ctx.translate(Math.round(cx), Math.round(cy));
  ctx.scale(scale, scale);
  ctx.imageSmoothingEnabled = false;
  const skin = SKIN[f.skin];
  const hair = HAIR_C[f.hairColor];
  const top = TOPS[f.top];
  const bot = BOTTOMS[f.bottom];
  const shoe = SHOES[f.shoes];

  cell(ctx, -11, 26, 10, 7, shoe);
  cell(ctx, 1, 26, 10, 7, shoe);
  cell(ctx, -10, 10, 10, 17, bot);
  cell(ctx, 0, 10, 10, 17, bot);
  cell(ctx, -15, -2, 30, 18, top);
  cell(ctx, -19, 2, 8, 14, skin);
  cell(ctx, 11, 2, 8, 14, skin);
  cell(ctx, -16, -32, 32, 32, skin);
  cell(ctx, -14, -30, 28, 12, shade(skin, 18));
  hairIso(ctx, f.hair, hair, false);
  ctx.fillStyle = "#fff";
  ctx.fillRect(-8, -18, 7, 6);
  ctx.fillRect(2, -18, 7, 6);
  ctx.fillStyle = "#1a1020";
  ctx.fillRect(-6, -16, 3, 3);
  ctx.fillRect(4, -16, 3, 3);
  ctx.fillStyle = shade(skin, -30);
  ctx.fillRect(-5, -8, 10, 3);
  if (f.acc === 1) {
    ctx.strokeStyle = "#222";
    ctx.lineWidth = 2;
    ctx.strokeRect(-9, -19, 8, 7);
    ctx.strokeRect(2, -19, 8, 7);
  }
  if (f.acc === 2) cell(ctx, -16, -20, 32, 7, "#111");
  if (f.acc === 3) {
    cell(ctx, -20, -22, 9, 9, "#222");
    cell(ctx, 11, -22, 9, 9, "#222");
  }
  if (f.acc === 6) cell(ctx, -16, -24, 32, 6, "#14F195");
  if (f.acc === 7) cell(ctx, 6, -36, 10, 8, "#ff6b5a");
  ctx.restore();
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
  const f = clampFigure(fig);
  const walking = !!opts.walking;
  const dance = !!opts.dance;
  const sit = !!opts.sit && !walking;
  const dist = opts.dist || t;
  const bob = dance ? Math.round(Math.sin(t * 12) * 3) : walking ? Math.round(Math.abs(Math.sin(dist * 9)) * 2) : 0;
  const step = walking || dance ? Math.round(Math.sin((walking ? dist : t) * (dance ? 12 : 9)) * 3) : 0;
  const flip = dir === 1 || dir === 2 ? -1 : 1;
  const facingBack = dir === 2 || dir === 3;
  const skin = SKIN[f.skin];
  const hair = HAIR_C[f.hairColor];
  const top = TOPS[f.top];
  const bot = BOTTOMS[f.bottom];
  const shoe = SHOES[f.shoes];

  ctx.save();
  ctx.translate(Math.round(sx), Math.round(sy - 8 - bob));
  ctx.scale(flip, 1);
  ctx.imageSmoothingEnabled = false;

  ctx.save();
  ctx.globalAlpha = 0.22;
  ctx.fillStyle = "#1a1020";
  ctx.beginPath();
  ctx.ellipse(0, sit ? 18 : 26, 12, 4, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  const legY = sit ? 8 : 16;
  const legH = sit ? 8 : 12;
  cell(ctx, -10, legY + step, 9, sit ? 7 : 8, shoe);
  cell(ctx, 1, legY - step, 9, sit ? 7 : 8, shoe);
  cell(ctx, -9, sit ? 2 : 6, 9, legH, bot);
  cell(ctx, 0, sit ? 2 : 6, 9, legH, bot);

  cell(ctx, -13, sit ? -10 : -8, 26, 18, top);
  cell(ctx, -12, sit ? -9 : -7, 24, 6, shade(top, 24));

  cell(ctx, -17, sit ? -6 : -4, 7, 13, skin);
  cell(ctx, 10, sit ? -6 : -4, 7, 13, skin);

  cell(ctx, -14, -34, 28, 28, skin);
  cell(ctx, -12, -32, 18, 10, shade(skin, 22));
  cell(ctx, 6, -30, 8, 22, shade(skin, -22));

  hairIso(ctx, f.hair, hair, facingBack);

  if (!facingBack) {
    ctx.fillStyle = "#fff";
    ctx.fillRect(2, -22, 7, 6);
    ctx.fillStyle = "#1a1020";
    ctx.fillRect(4, -20, 3, 3);
    ctx.fillStyle = shade(skin, -35);
    ctx.fillRect(1, -12, 8, 2);
  }

  if (f.acc === 1 && !facingBack) {
    ctx.strokeStyle = "#1a1020";
    ctx.lineWidth = 2;
    ctx.strokeRect(1, -23, 8, 7);
  }
  if (f.acc === 2) cell(ctx, -14, -24, 28, 6, "#111");
  if (f.acc === 3) {
    cell(ctx, -18, -26, 8, 8, "#222");
    cell(ctx, 10, -26, 8, 8, "#222");
  }
  if (f.acc === 6) cell(ctx, -14, -26, 28, 5, "#14F195");
  if (f.acc === 7) cell(ctx, 6, -38, 10, 8, "#ff6b5a");

  ctx.restore();
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
  poly(ctx, topPts, top);
  poly(ctx, leftPts, left);
  poly(ctx, rightPts, right);
}

function poly(ctx: CanvasRenderingContext2D, pts: number[][], fill: string) {
  ctx.fillStyle = fill;
  ctx.strokeStyle = "rgba(0,0,0,0.45)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
}
