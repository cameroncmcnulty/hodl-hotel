import type { Figure } from "../types";
import { mix } from "./pix";

export const SKIN = ["#f3d4c4", "#e8c4a8", "#d4a574", "#c48a56", "#b56c3a", "#8d4e24", "#6b3a20", "#3a1c10"];
export const HAIR_C = ["#8b5a2b", "#5c3317", "#1b1b1b", "#e8d07a", "#c45c26", "#4a2c0a"];
export const TOPS = ["#9a9a9a", "#1e3a8a", "#1a1a1e", "#c41e3a", "#166534"];
export const BOTTOMS = ["#1a1a1e", "#1e3a5f", "#6d4c2f", "#9a9a9a", "#c4a574"];
export const SHOES = ["#c41e3a", "#f4f4f6", "#1a1a1e", "#3b82f6", "#9a9a9a"];
export const HAIR_BOY = ["messy", "side", "afro", "undercut", "spikes"];
export const HAIR_GIRL = ["pony", "waves", "bob"];
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

export const AVATAR_DRAW_H = 128;
export const AVATAR_NAME_LIFT = 138;
export const SPRITE_W = 128;
export const SPRITE_H = 176;

const sprites = new Map<string, HTMLCanvasElement>();
let loadPromise: Promise<void> | null = null;
export const SPRITE_V = 30;
const inflight = new Map<string, Promise<HTMLCanvasElement | null>>();

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

function isMagenta(r: number, g: number, b: number) {
  if (r > 200 && b > 170 && g < 110) return true;
  return Math.hypot(r - 255, g - 0, b - 255) < 140 && g < 120;
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement | null>((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

function cacheCanvas(id: string, img: HTMLImageElement) {
  const c = document.createElement("canvas");
  c.width = img.width;
  c.height = img.height;
  const ctx = c.getContext("2d")!;
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(img, 0, 0);
  const data = ctx.getImageData(0, 0, c.width, c.height);
  const d = data.data;
  for (let i = 0; i < d.length; i += 4) {
    if (isMagenta(d[i], d[i + 1], d[i + 2])) d[i + 3] = 0;
  }
  ctx.putImageData(data, 0, 0);
  sprites.set(id, c);
  return c;
}

export async function loadSpriteId(id: string) {
  if (sprites.has(id)) return sprites.get(id)!;
  const hit = inflight.get(id);
  if (hit) return hit;
  const p = (async () => {
    const img = await loadImage(`/art/look/${id}.png?v=${SPRITE_V}`);
    if (!img) return null;
    return cacheCanvas(id, img);
  })();
  inflight.set(id, p);
  return p;
}

function gKey(fig: Figure) {
  return fig.gender === 1 ? "f" : "m";
}
function viewOf(dir: 0 | 1 | 2 | 3) {
  return dir === 2 || dir === 3 ? "ne" : "se";
}
function flipOf(dir: 0 | 1 | 2 | 3) {
  return dir === 0 || dir === 3;
}
function hairName(fig: Figure) {
  return hairsFor(fig.gender ?? 0)[fig.hair] || defaultHairName(fig.gender ?? 0);
}
function topName(fig: Figure) {
  return topsFor(fig.gender ?? 0)[fig.topCut ?? 0] || "hoodie";
}
function botName(fig: Figure) {
  return botsFor(fig.gender ?? 0)[fig.botCut ?? 0] || (fig.gender === 1 ? "skirt" : "pants");
}
function shoeName(fig: Figure) {
  return shoesFor(fig.gender ?? 0)[fig.shoeCut ?? 0] || "sneakers";
}

export function lookSpriteIds(fig: Figure, dir: 0 | 1 | 2 | 3 = 1) {
  const f = clampFigure(fig);
  const g = gKey(f);
  const view = viewOf(dir);
  const hair = hairName(f);
  const top = topName(f);
  const bot = botName(f);
  const shoe = shoeName(f);
  return [
    `${g}-skin-${f.skin}`,
    `${g}-hair-${hair}-${f.hairColor}`,
    `${g}-top-${top}-${f.top}`,
    `${g}-bot-${bot}-${f.bottom}`,
    `${g}-shoe-${shoe}-${f.shoes}`,
  ];
}

export async function loadLookSprites(fig: Figure, dir: 0 | 1 | 2 | 3 = 1) {
  await Promise.all(lookSpriteIds(fig, dir).map(loadSpriteId));
}

export function loadAvatars() {
  if (!loadPromise) {
    loadPromise = Promise.all(lookSpriteIds(DEFAULT_FIGURE, 1).map(loadSpriteId)).then(() => undefined);
  }
  return loadPromise;
}

export function lookReady(fig: Figure, dir: 0 | 1 | 2 | 3 = 1) {
  return lookSpriteIds(fig, dir).every((id) => sprites.has(id));
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

function tintPixel(r: number, g: number, b: number, target: [number, number, number]): [number, number, number] {
  const L = Math.max(0.08, lum(r, g, b));
  const tL = Math.max(0.08, lum(target[0], target[1], target[2]));
  const k = L / tL;
  return [
    Math.max(0, Math.min(255, Math.round(target[0] * k))),
    Math.max(0, Math.min(255, Math.round(target[1] * k))),
    Math.max(0, Math.min(255, Math.round(target[2] * k))),
  ];
}

function isSkinPx(r: number, g: number, b: number) {
  return r > 180 && g > 110 && g < 230 && b > 80 && b < 200 && r - b > 30 && r > g - 4;
}

function tintLayer(src: HTMLCanvasElement, hex: string) {
  const out = document.createElement("canvas");
  out.width = src.width;
  out.height = src.height;
  const ctx = out.getContext("2d")!;
  ctx.drawImage(src, 0, 0);
  const data = ctx.getImageData(0, 0, out.width, out.height);
  const d = data.data;
  const t = hexRgb(hex);
  for (let i = 0; i < d.length; i += 4) {
    if (d[i + 3] < 16) continue;
    const r = d[i],
      g = d[i + 1],
      b = d[i + 2];
    if (r < 28 && g < 28 && b < 28) continue;
    const n = tintPixel(r, g, b, t);
    d[i] = n[0];
    d[i + 1] = n[1];
    d[i + 2] = n[2];
  }
  ctx.putImageData(data, 0, 0);
  return out;
}

function mapSkin(src: HTMLCanvasElement, hex: string) {
  const out = document.createElement("canvas");
  out.width = src.width;
  out.height = src.height;
  const ctx = out.getContext("2d")!;
  ctx.drawImage(src, 0, 0);
  const data = ctx.getImageData(0, 0, out.width, out.height);
  const d = data.data;
  const t = hexRgb(hex);
  for (let i = 0; i < d.length; i += 4) {
    if (d[i + 3] < 16) continue;
    const r = d[i],
      g = d[i + 1],
      b = d[i + 2];
    if (!isSkinPx(r, g, b)) continue;
    const n = tintPixel(r, g, b, t);
    d[i] = n[0];
    d[i + 1] = n[1];
    d[i + 2] = n[2];
  }
  ctx.putImageData(data, 0, 0);
  return out;
}

function firstSpr(ids: string[]) {
  for (const id of ids) {
    const s = sprites.get(id);
    if (s) return s;
  }
  return null;
}

function stamp(dst: HTMLCanvasElement, src: HTMLCanvasElement | null) {
  if (!src) return;
  const dctx = dst.getContext("2d")!;
  dctx.drawImage(src, 0, 0);
}

const composeCache = new Map<string, HTMLCanvasElement>();

function compose(fig: Figure, dir: 0 | 1 | 2 | 3) {
  const ids = lookSpriteIds(fig, dir);
  const layers = ids.map((id) => sprites.get(id) || null);
  const body = layers[0];
  if (!body) return null;
  const key = `n3|${ids.join("|")}`;
  const hit = composeCache.get(key);
  if (hit) return hit;
  const out = document.createElement("canvas");
  out.width = body.width;
  out.height = body.height;
  stamp(out, body);
  stamp(out, layers[4]);
  stamp(out, layers[3]);
  stamp(out, layers[2]);
  stamp(out, layers[1]);
  composeCache.set(key, out);
  if (composeCache.size > 180) {
    const first = composeCache.keys().next().value;
    if (first) composeCache.delete(first);
  }
  return out;
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

export function drawAvatarFront(ctx: CanvasRenderingContext2D, fig: Figure, cx: number, cy: number, scale = 4, dir: 0 | 1 | 2 | 3 = 0) {
  const f = clampFigure(fig);
  const made = compose(f, dir);
  const destH = Math.max(120, Math.round(36 * scale));
  const destW = Math.round((destH * SPRITE_W) / SPRITE_H);
  const dx = Math.round(cx - destW / 2);
  const dy = Math.round(cy - destH * 0.92);
  if (!made) return;
  blit(ctx, made, dx, dy, destW, destH, flipOf(dir));
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
  const frame = dance ? Math.floor(t * 8) % 4 : walking ? Math.floor((opts.dist || 0) * 2) % 2 : 0;
  const made = compose(f, dir);
  const destH = sit ? AVATAR_DRAW_H - 14 : AVATAR_DRAW_H;
  const destW = Math.round((destH * SPRITE_W) / SPRITE_H);
  const bob = dance ? (frame % 2 === 0 ? -3 : 0) : walking ? (frame % 2 === 0 ? 0 : -4) : 0;
  const dx = Math.round(sx - destW / 2);
  const dy = Math.round(sy - destH + 12 + bob + (sit ? 10 : 0));
  if (!made) return;
  blit(ctx, made, dx, dy, destW, destH, flipOf(dir));
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
