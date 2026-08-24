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

export function drawAvatarFront(ctx: CanvasRenderingContext2D, fig: Figure, cx: number, cy: number, scale = 1) {
  const f = clampFigure(fig);
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(scale, scale);
  const skin = SKIN[f.skin];
  const hair = HAIR_C[f.hairColor];
  const top = TOPS[f.top];
  const bot = BOTTOMS[f.bottom];
  const shoe = SHOES[f.shoes];

  ctx.imageSmoothingEnabled = false;
  const block = (x: number, y: number, w: number, h: number, fill: string) => {
    ctx.fillStyle = fill;
    ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = "#1a1020";
    ctx.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);
  };
  block(-10, 18, 8, 6, shoe);
  block(2, 18, 8, 6, shoe);
  block(-9, 6, 8, 14, bot);
  block(1, 6, 8, 14, bot);
  block(-13, -2, 26, 16, top);
  block(-16, 0, 7, 12, skin);
  block(9, 0, 7, 12, skin);
  block(-12, -22, 24, 24, skin);
  drawHair(ctx, f.hair, hair, 0);
  if (f.acc === 1) {
    ctx.strokeStyle = "#222";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(-6, -12, 5, 4, 0, 0, Math.PI * 2);
    ctx.ellipse(6, -12, 5, 4, 0, 0, Math.PI * 2);
    ctx.moveTo(-1, -12);
    ctx.lineTo(1, -12);
    ctx.stroke();
  }
  if (f.acc === 2) {
    round(ctx, -14, -14, 28, 6, 2, "#111");
  }
  if (f.acc === 3) {
    round(ctx, -16, -16, 8, 8, 4, "#222");
    round(ctx, 8, -16, 8, 8, 4, "#222");
    ctx.strokeStyle = "#14F195";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, -12, 14, Math.PI, 0);
    ctx.stroke();
  }
  if (f.acc === 6) {
    round(ctx, -14, -16, 28, 5, 2, "#14F195");
  }
  ctx.fillStyle = "#222";
  ctx.beginPath();
  ctx.arc(-5, -12, 2, 0, Math.PI * 2);
  ctx.arc(5, -12, 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawHair(ctx: CanvasRenderingContext2D, style: number, color: string, dir: number) {
  ctx.fillStyle = color;
  ctx.strokeStyle = "#111";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  if (style === 0) {
    ctx.ellipse(0, -24, 12, 6, 0, 0, Math.PI * 2);
  } else if (style === 1) {
    ctx.ellipse(0, -26, 13, 8, 0, 0, Math.PI * 2);
  } else if (style === 2) {
    ctx.ellipse(0, -22, 14, 10, 0, 0, Math.PI * 2);
  } else if (style === 3) {
    ctx.moveTo(-10, -22);
    ctx.lineTo(-6, -36);
    ctx.lineTo(-2, -22);
    ctx.lineTo(2, -38);
    ctx.lineTo(6, -22);
    ctx.lineTo(10, -34);
    ctx.lineTo(12, -20);
    ctx.closePath();
  } else if (style === 4) {
    ctx.arc(-6, -26, 7, 0, Math.PI * 2);
    ctx.arc(6, -26, 7, 0, Math.PI * 2);
    ctx.arc(0, -30, 7, 0, Math.PI * 2);
  } else if (style === 5) {
    round(ctx, -14, -30, 28, 10, 3, color);
    round(ctx, -6, -36, 12, 8, 2, color);
  } else if (style === 6) {
    ctx.ellipse(0, -20, 13, 10, 0, 0, Math.PI * 2);
    round(ctx, -4, -8, 8, 18, 3, color);
  } else {
    round(ctx, -4, -40, 8, 20, 2, color);
    ctx.ellipse(0, -22, 12, 6, 0, 0, Math.PI * 2);
  }
  ctx.fill();
  ctx.stroke();
  void dir;
}

export function drawAvatarIso(
  ctx: CanvasRenderingContext2D,
  fig: Figure,
  sx: number,
  sy: number,
  dir: 0 | 1 | 2 | 3,
  t: number,
  dance?: boolean
) {
  const f = clampFigure(fig);
  const bob = Math.round(dance ? Math.sin(t * 10) * 3 : Math.sin(t * 7) * 1);
  const flip = dir === 2 || dir === 3 ? -1 : 1;
  const skin = SKIN[f.skin];
  const hair = HAIR_C[f.hairColor];
  const top = TOPS[f.top];
  const bot = BOTTOMS[f.bottom];
  const shoe = SHOES[f.shoes];
  const step = Math.round((dance ? Math.sin(t * 10) : Math.sin(t * 7)) * 2);
  ctx.save();
  ctx.translate(Math.round(sx), Math.round(sy - 6 - bob));
  ctx.scale(flip, 1);
  ctx.imageSmoothingEnabled = false;
  const px = (x: number, y: number, w: number, h: number, fill: string) => {
    ctx.fillStyle = fill;
    ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = "#1a1020";
    ctx.lineWidth = 1;
    ctx.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);
  };
  px(-7, 14 + step, 7, 5, shoe);
  px(1, 14 - step, 7, 5, shoe);
  px(-6, 4, 6, 12, bot);
  px(0, 4, 6, 12, bot);
  px(-10, -6, 20, 14, top);
  px(-9, -26, 18, 18, skin);
  ctx.fillStyle = hair;
  ctx.fillRect(-10, -32, 20, 10);
  ctx.fillRect(-6, -36, 12, 6);
  ctx.strokeStyle = "#1a1020";
  ctx.strokeRect(-10.5, -32.5, 21, 11);
  ctx.fillStyle = "#1a1020";
  ctx.fillRect(flip > 0 ? 2 : -6, -20, 3, 3);
  if (f.acc === 2) px(-10, -22, 20, 4, "#111");
  if (f.acc === 1) {
    ctx.strokeStyle = "#111";
    ctx.strokeRect(-8, -21, 7, 5);
    ctx.strokeRect(1, -21, 7, 5);
  }
  ctx.restore();
}

function round(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
  fill: string
) {
  ctx.fillStyle = fill;
  ctx.strokeStyle = "#111";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
  ctx.fill();
  ctx.stroke();
}

export function shade(hex: string, amt: number) {
  const n = parseInt(hex.replace("#", ""), 16);
  const r = Math.max(0, Math.min(255, ((n >> 16) & 255) + amt));
  const g = Math.max(0, Math.min(255, ((n >> 8) & 255) + amt));
  const b = Math.max(0, Math.min(255, (n & 255) + amt));
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
