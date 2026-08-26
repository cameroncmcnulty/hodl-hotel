import type { Figure } from "../types";
import { mix } from "./pix";

export const SKIN = ["#fbe0c8", "#f0c3a0", "#d29b6b", "#a86b3c", "#6e4320", "#3d2614"];
export const HAIR_C = [
  "#1e5a68",
  "#1b1b1b",
  "#4a2c0a",
  "#c45c26",
  "#e8d07a",
  "#6b3fa0",
  "#14F195",
  "#ff6b5a",
  "#f5c542",
  "#2ec4b6",
  "#dfe7ff",
  "#f4e4d4",
];
export const TOPS = ["#1a1a1e", "#ff6b5a", "#9945FF", "#14F195", "#2ec4b6", "#f5c542", "#ffffff", "#ff8fab", "#3b82f6", "#24143d"];
export const BOTTOMS = ["#2a3340", "#1e3a5f", "#4b5563", "#7c3aed", "#0f766e", "#9a3412", "#111111", "#f5c542"];
export const SHOES = ["#f4f4f6", "#111111", "#9945FF", "#ff6b5a", "#2ec4b6", "#f5c542"];
export const HAIR_STYLES = ["spike", "buzz", "bob", "pony", "bun", "mohawk", "curl", "long"];
export const TOP_CUTS = ["hoodie", "tee", "jacket", "sweater", "tank", "shirt"];
export const BOT_CUTS = ["pants", "shorts", "skirt", "cargo", "dress"];
export const ACC = ["none", "glasses", "shades", "headphones", "scarf", "pack", "visor", "bow"];
export const GENDERS = ["boy", "girl"];

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
};

export const AVATAR_DRAW_H = 128;
export const AVATAR_NAME_LIFT = 138;
export const SPRITE_W = 384;
export const SPRITE_H = 576;

const sprites = new Map<string, HTMLCanvasElement>();
let loadPromise: Promise<void> | null = null;

export function clampFigure(f: Partial<Figure> | undefined): Figure {
  const n = (v: unknown, max: number) => Math.max(0, Math.min(max, Number(v) || 0));
  return {
    gender: n(f?.gender, GENDERS.length - 1),
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

function loadImage(src: string) {
  return new Promise<HTMLImageElement | null>((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

export function loadAvatars() {
  if (!loadPromise) {
    loadPromise = (async () => {
      const man = (await fetch("/art/avatars/manifest.json?v=7")
        .then((r) => r.json())
        .catch(() => [])) as string[];
      await Promise.all(
        man.map(async (file) => {
          const img = await loadImage(`/art/avatars/${file}?v=7`);
          if (!img) return;
          const c = document.createElement("canvas");
          c.width = img.width;
          c.height = img.height;
          const ctx = c.getContext("2d")!;
          ctx.imageSmoothingEnabled = false;
          ctx.drawImage(img, 0, 0);
          sprites.set(file.replace(/\.png$/i, ""), c);
        })
      );
    })();
  }
  return loadPromise;
}

export function avatarsReady() {
  return sprites.size > 0;
}

function hexRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}

function lum(r: number, g: number, b: number) {
  return (r * 0.32 + g * 0.5 + b * 0.18) / 255;
}

function tint(r: number, g: number, b: number, target: [number, number, number]): [number, number, number] {
  const L = lum(r, g, b);
  const tL = Math.max(0.08, lum(target[0], target[1], target[2]));
  const k = L / tL;
  return [
    Math.max(0, Math.min(255, Math.round(target[0] * k))),
    Math.max(0, Math.min(255, Math.round(target[1] * k))),
    Math.max(0, Math.min(255, Math.round(target[2] * k))),
  ];
}

function isHairPx(r: number, g: number, b: number) {
  if (r > 140 && g > 90 && b > 60 && r > g + 12 && g > b - 8) return false;
  const L = r * 0.32 + g * 0.5 + b * 0.18;
  if (L < 32) return false;
  return g > r + 12 && g >= b - 6 && g > 45 && r < 130;
}

function isSkinPx(r: number, g: number, b: number) {
  return r > 125 && g > 75 && b > 40 && r > g && g >= b - 12 && r - b > 22 && b < 190 && g < 205;
}

function isPurplePx(r: number, g: number, b: number) {
  return r > 55 && b > 85 && g < 100 && b > g + 18 && Math.abs(r - b) < 90;
}

const recache = new Map<string, HTMLCanvasElement>();

function recolor(src: HTMLCanvasElement, fig: Figure, id: string) {
  const tagged = `${id}.${fig.skin}.${fig.hairColor}.${fig.top}.${fig.bottom}.${fig.shoes}`;
  const hit = recache.get(tagged);
  if (hit) return hit;
  const out = document.createElement("canvas");
  out.width = src.width;
  out.height = src.height;
  const ctx = out.getContext("2d")!;
  ctx.drawImage(src, 0, 0);
  const data = ctx.getImageData(0, 0, out.width, out.height);
  const d = data.data;
  const hairT = hexRgb(HAIR_C[fig.hairColor]);
  const skinT = hexRgb(SKIN[fig.skin]);
  const topT = hexRgb(TOPS[fig.top]);
  const botT = hexRgb(BOTTOMS[fig.bottom]);
  const shoeT = hexRgb(SHOES[fig.shoes]);
  const h = out.height;
  for (let i = 0, y = 0; i < d.length; i += 4) {
    const px = (i / 4) | 0;
    y = (px / out.width) | 0;
    const a = d[i + 3];
    if (a < 12) continue;
    const r = d[i],
      g = d[i + 1],
      b = d[i + 2];
    const yn = y / h;
    if (fig.hairColor !== 0 && isHairPx(r, g, b) && yn < 0.52) {
      const t = tint(r, g, b, hairT);
      d[i] = t[0];
      d[i + 1] = t[1];
      d[i + 2] = t[2];
      continue;
    }
    if (fig.skin !== 1 && isSkinPx(r, g, b)) {
      const t = tint(r, g, b, skinT);
      d[i] = t[0];
      d[i + 1] = t[1];
      d[i + 2] = t[2];
      continue;
    }
    if (isPurplePx(r, g, b)) continue;
    const mx = Math.max(r, g, b);
    const mn = Math.min(r, g, b);
    if (fig.shoes !== 0 && yn > 0.74 && mn > 165 && mx - mn < 55) {
      const t = tint(r, g, b, shoeT);
      d[i] = t[0];
      d[i + 1] = t[1];
      d[i + 2] = t[2];
      continue;
    }
    if (fig.bottom !== 0 && yn > 0.5 && yn < 0.82 && mx < 90) {
      const t = tint(r, g, b, botT);
      d[i] = t[0];
      d[i + 1] = t[1];
      d[i + 2] = t[2];
      continue;
    }
    if (fig.top !== 0 && yn > 0.3 && yn < 0.62 && !isSkinPx(r, g, b) && !isHairPx(r, g, b)) {
      if (mx < 95 || (mn > 150 && yn < 0.58) || (r > 140 && g > 120 && b > 90 && yn < 0.56)) {
        const t = tint(r, g, b, topT);
        d[i] = t[0];
        d[i + 1] = t[1];
        d[i + 2] = t[2];
      }
    }
  }
  ctx.putImageData(data, 0, 0);
  recache.set(tagged, out);
  if (recache.size > 220) {
    const first = recache.keys().next().value;
    if (first) recache.delete(first);
  }
  return out;
}

function gKey(fig: Figure) {
  return fig.gender === 1 ? "f" : "m";
}

function viewOf(dir: 0 | 1 | 2 | 3) {
  return dir === 2 || dir === 3 ? "ne" : "se";
}

/** Unflipped 3/4 faces SW (+y). Flip for SE (+x) and NE (-y). */
function flipOf(dir: 0 | 1 | 2 | 3) {
  return dir === 0 || dir === 3;
}

function spr(id: string) {
  return sprites.get(id) || null;
}

function firstSpr(ids: string[]) {
  for (const id of ids) {
    const s = sprites.get(id);
    if (s) return { id, src: s };
  }
  return null;
}

function hairLayerId(g: string, hair: string, view: string) {
  if (hair === "spike") return `${g}-${view}-idle-layer`;
  return `${g}-hair-${hair}-${view}-layer`;
}

function pickBody(fig: Figure, dir: 0 | 1 | 2 | 3, walking: boolean, sit: boolean, frame: number) {
  const g = gKey(fig);
  const view = viewOf(dir);
  const top = TOP_CUTS[fig.topCut ?? 0] || "hoodie";
  const bot = BOT_CUTS[fig.botCut ?? 0] || "pants";
  const defaultFit = top === "hoodie" && bot === "pants";

  if (sit) return firstSpr([`${g}-se-sit`, `${g}-se-idle`]);

  if (walking && defaultFit) {
    const stride = frame % 4 === 1 || frame % 4 === 3;
    if (stride) {
      const which = frame % 4 === 3 ? 1 : 0;
      const w = firstSpr([`${g}-${view}-walk${which}`, `${g}-${view}-walk0`, `${g}-${view}-walk1`]);
      if (w) return w;
    }
    const plant = firstSpr([`${g}-${view}-idle`]);
    if (plant) return plant;
  }

  if (bot !== "pants") {
    const b = firstSpr([`${g}-bot-${bot}-${view}`, `${g}-bot-${bot}-se`]);
    if (b) return b;
  }
  if (top !== "hoodie") {
    const t = firstSpr([`${g}-top-${top}-${view}`, `${g}-top-${top}-se`]);
    if (t) return t;
  }
  return firstSpr([`${g}-${view}-idle`, `${g}-se-idle`]);
}

function overlayHair(body: HTMLCanvasElement, layer: HTMLCanvasElement, scalp: HTMLCanvasElement | null) {
  const ctx = body.getContext("2d")!;
  const bd = ctx.getImageData(0, 0, body.width, body.height);
  const lctx = layer.getContext("2d")!;
  const ld = lctx.getImageData(0, 0, layer.width, layer.height);
  const sd = scalp ? scalp.getContext("2d")!.getImageData(0, 0, scalp.width, scalp.height) : null;
  const w = body.width;
  const h = body.height;
  const cut = Math.floor(h * 0.55);
  const b = bd.data;
  const l = ld.data;
  const s = sd?.data;
  const mark = new Uint8Array(w * h);
  for (let y = 0; y < cut; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      if (b[i + 3] > 12 && isHairPx(b[i], b[i + 1], b[i + 2])) mark[y * w + x] = 1;
    }
  }
  const grown = new Uint8Array(mark);
  for (let y = 1; y < cut - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const p = y * w + x;
      if (mark[p] || mark[p - 1] || mark[p + 1] || mark[p - w] || mark[p + w]) grown[p] = 1;
    }
  }
  for (let y = 0; y < cut; y++) {
    for (let x = 0; x < w; x++) {
      if (!grown[y * w + x]) continue;
      const i = (y * w + x) * 4;
      if (s && s[i + 3] > 12) {
        b[i] = s[i];
        b[i + 1] = s[i + 1];
        b[i + 2] = s[i + 2];
        b[i + 3] = s[i + 3];
      } else b[i + 3] = 0;
    }
  }
  const lw = layer.width;
  const lh = layer.height;
  const mw = Math.min(w, lw);
  const mh = Math.min(h, lh);
  for (let y = 0; y < mh; y++) {
    for (let x = 0; x < mw; x++) {
      const i = (y * w + x) * 4;
      const li = (y * lw + x) * 4;
      if (l[li + 3] > 18) {
        b[i] = l[li];
        b[i + 1] = l[li + 1];
        b[i + 2] = l[li + 2];
        b[i + 3] = l[li + 3];
      }
    }
  }
  ctx.putImageData(bd, 0, 0);
}

const composeCache = new Map<string, HTMLCanvasElement>();

function compose(fig: Figure, dir: 0 | 1 | 2 | 3, walking: boolean, sit: boolean, frame: number) {
  const g = gKey(fig);
  const view = viewOf(dir);
  const hair = HAIR_STYLES[fig.hair] || "spike";
  const top = TOP_CUTS[fig.topCut ?? 0] || "hoodie";
  const bot = BOT_CUTS[fig.botCut ?? 0] || "pants";
  const body = pickBody(fig, dir, walking, sit, frame);
  if (!body) return null;
  const layerName = hairLayerId(g, hair, view);
  const layerAlt = hairLayerId(g, hair, "se");
  const needHair = hair !== "spike" || top !== "hoodie" || bot !== "pants";
  const key = `${body.id}|${needHair ? layerName : "none"}|${frame}|${sit ? 1 : 0}`;
  const hit = composeCache.get(key);
  if (hit) return { id: key, src: hit };

  const out = document.createElement("canvas");
  out.width = body.src.width;
  out.height = body.src.height;
  const ctx = out.getContext("2d")!;
  ctx.drawImage(body.src, 0, 0);

  if (needHair && hair !== "spike") {
    const layer = spr(layerName) || spr(layerAlt);
    if (layer) {
      const scalp = spr(`${g}-hair-buzz-se`) || spr(`${g}-se-idle`);
      overlayHair(out, layer, scalp);
    }
  }

  composeCache.set(key, out);
  if (composeCache.size > 160) {
    const first = composeCache.keys().next().value;
    if (first) composeCache.delete(first);
  }
  return { id: key, src: out };
}

function blit(ctx: CanvasRenderingContext2D, src: HTMLCanvasElement, dx: number, dy: number, dw: number, dh: number, flip: boolean) {
  ctx.imageSmoothingEnabled = false;
  if (flip) {
    ctx.save();
    ctx.translate(dx + dw, dy);
    ctx.scale(-1, 1);
    ctx.drawImage(src, 0, 0, dw, dh);
    ctx.restore();
  } else {
    ctx.drawImage(src, dx, dy, dw, dh);
  }
}

function drawAcc(ctx: CanvasRenderingContext2D, fig: Figure, dx: number, dy: number, dw: number, dh: number) {
  if (!fig.acc) return;
  const x = dx + dw * 0.5;
  const y = dy + dh * 0.27;
  ctx.save();
  ctx.imageSmoothingEnabled = false;
  if (fig.acc === 1 || fig.acc === 2) {
    ctx.fillStyle = fig.acc === 2 ? "#111214" : "rgba(40,50,60,0.85)";
    ctx.fillRect(x - dw * 0.16, y, dw * 0.12, dh * 0.05);
    ctx.fillRect(x + dw * 0.02, y, dw * 0.12, dh * 0.05);
    ctx.fillRect(x - dw * 0.04, y + dh * 0.015, dw * 0.08, dh * 0.012);
    if (fig.acc === 1) {
      ctx.fillStyle = "rgba(170,215,230,0.45)";
      ctx.fillRect(x - dw * 0.14, y + 1, dw * 0.08, dh * 0.03);
      ctx.fillRect(x + dw * 0.04, y + 1, dw * 0.08, dh * 0.03);
    }
  } else if (fig.acc === 3) {
    ctx.fillStyle = "#222";
    ctx.beginPath();
    ctx.arc(x - dw * 0.2, y, dw * 0.07, 0, Math.PI * 2);
    ctx.arc(x + dw * 0.2, y, dw * 0.07, 0, Math.PI * 2);
    ctx.fill();
  } else if (fig.acc === 7) {
    ctx.fillStyle = "#ff6b5a";
    ctx.beginPath();
    ctx.arc(x + dw * 0.16, dy + dh * 0.16, dw * 0.06, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

export function drawAvatarFront(ctx: CanvasRenderingContext2D, fig: Figure, cx: number, cy: number, scale = 4, dir: 0 | 1 | 2 | 3 = 0) {
  const f = clampFigure(fig);
  const made = compose(f, dir, false, false, 0);
  const destH = Math.max(96, Math.round(28 * scale));
  const destW = Math.round((destH * SPRITE_W) / SPRITE_H);
  const dx = Math.round(cx - destW / 2);
  const dy = Math.round(cy - destH * 0.92);
  if (!made) {
    ctx.fillStyle = "#14F195";
    ctx.fillRect(dx + destW * 0.3, dy + destH * 0.2, destW * 0.4, destH * 0.7);
    return;
  }
  blit(ctx, recolor(made.src, f, made.id), dx, dy, destW, destH, flipOf(dir));
  if (dir === 0 || dir === 1) drawAcc(ctx, f, dx, dy, destW, destH);
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
  const frame = dance ? Math.floor(t * 8) % 4 : walking ? Math.floor((opts.dist || 0) * 2) % 4 : 0;
  const made = compose(f, dir, walking, sit, frame);
  const destH = sit ? AVATAR_DRAW_H - 10 : AVATAR_DRAW_H;
  const destW = Math.round((destH * SPRITE_W) / SPRITE_H);
  const stride = walking && (frame % 2 === 1);
  const bob = dance ? (frame % 2 === 0 ? -3 : 0) : stride ? -2 : 0;
  const dx = Math.round(sx - destW / 2);
  const dy = Math.round(sy - destH + 12 + bob);
  if (!made) return;
  blit(ctx, recolor(made.src, f, made.id), dx, dy, destW, destH, flipOf(dir));
  if (dir === 0 || dir === 1) drawAcc(ctx, f, dx, dy, destW, destH);
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
    ctx.lineTo(pts[1][0], pts[1][1]);
    ctx.lineTo(pts[2][0], pts[2][1]);
    ctx.lineTo(pts[3][0], pts[3][1]);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  };
  poly(topPts, top);
  poly(leftPts, left);
  poly(rightPts, right);
}
