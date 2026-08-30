import { CATALOG, furn } from "../catalog";
import { paintFurn } from "./furnDraw";

export const SPRITE_SRC: Record<string, string> = Object.fromEntries(
  CATALOG.filter((f) => f.id !== "ad_board").map((f) => [f.id, `/art/furn/${f.id}.png`])
);

function isMagenta(r: number, g: number, b: number) {
  const dist = Math.hypot(r - 255, g - 0, b - 255);
  if (dist < 170) return true;
  if (r > 145 && b > 140 && g < 155 && Math.abs(r - b) < 110) return true;
  if (r > 170 && b > 130 && g < 185 && r + b > g * 2) return true;
  return false;
}

export function keyAndTrim(img: HTMLImageElement) {
  const c = document.createElement("canvas");
  c.width = img.width;
  c.height = img.height;
  const ctx = c.getContext("2d")!;
  ctx.drawImage(img, 0, 0);
  const data = ctx.getImageData(0, 0, c.width, c.height);
  const d = data.data;
  const w = c.width;
  const h = c.height;
  const keyed = new Uint8Array(w * h);
  const stack: number[] = [];
  const tryKey = (x: number, y: number) => {
    if (x < 0 || y < 0 || x >= w || y >= h) return;
    const i = y * w + x;
    if (keyed[i]) return;
    const o = i * 4;
    if (d[o + 3] < 8) {
      keyed[i] = 1;
      return;
    }
    if (!isMagenta(d[o], d[o + 1], d[o + 2])) return;
    keyed[i] = 1;
    d[o + 3] = 0;
    stack.push(i);
  };
  for (let x = 0; x < w; x++) {
    tryKey(x, 0);
    tryKey(x, h - 1);
  }
  for (let y = 0; y < h; y++) {
    tryKey(0, y);
    tryKey(w - 1, y);
  }
  while (stack.length) {
    const i = stack.pop()!;
    const x = i % w;
    const y = (i / w) | 0;
    tryKey(x - 1, y);
    tryKey(x + 1, y);
    tryKey(x, y - 1);
    tryKey(x, y + 1);
  }
  for (let i = 0; i < d.length; i += 4) {
    if (d[i + 3] > 8 && isMagenta(d[i], d[i + 1], d[i + 2])) d[i + 3] = 0;
  }
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const o = (y * w + x) * 4;
      if (d[o + 3] < 8) continue;
      const edge =
        x === 0 ||
        y === 0 ||
        x === w - 1 ||
        y === h - 1 ||
        d[((y * w + x - 1) * 4) + 3] < 8 ||
        d[((y * w + x + 1) * 4) + 3] < 8 ||
        d[(((y - 1) * w + x) * 4) + 3] < 8 ||
        d[(((y + 1) * w + x) * 4) + 3] < 8;
      if (!edge) continue;
      const r = d[o],
        g = d[o + 1],
        b = d[o + 2];
      if (r > 150 && b > 130 && g < 190 && r + b > g * 1.7) d[o + 3] = 0;
    }
  }
  ctx.putImageData(data, 0, 0);

  const trimmed = ctx.getImageData(0, 0, c.width, c.height);
  const td = trimmed.data;
  let minX = c.width,
    minY = c.height,
    maxX = 0,
    maxY = 0;
  for (let y = 0; y < c.height; y++) {
    for (let x = 0; x < c.width; x++) {
      const i = (y * c.width + x) * 4;
      if (td[i + 3] > 12) {
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
      }
    }
  }
  if (maxX <= minX || maxY <= minY) return c;
  const pad = 2;
  minX = Math.max(0, minX - pad);
  minY = Math.max(0, minY - pad);
  maxX = Math.min(c.width - 1, maxX + pad);
  maxY = Math.min(c.height - 1, maxY + pad);
  const out = document.createElement("canvas");
  out.width = maxX - minX + 1;
  out.height = maxY - minY + 1;
  out.getContext("2d")!.drawImage(c, minX, minY, out.width, out.height, 0, 0, out.width, out.height);
  return inkOutline(out);
}

function inkOutline(src: HTMLCanvasElement) {
  const w = src.width;
  const h = src.height;
  const c = document.createElement("canvas");
  c.width = w + 2;
  c.height = h + 2;
  const ctx = c.getContext("2d")!;
  ctx.drawImage(src, 1, 1);
  const img = ctx.getImageData(0, 0, c.width, c.height);
  const d = img.data;
  const a = (x: number, y: number) => {
    if (x < 0 || y < 0 || x >= c.width || y >= c.height) return 0;
    return d[(y * c.width + x) * 4 + 3];
  };
  const marks: number[] = [];
  for (let y = 0; y < c.height; y++) {
    for (let x = 0; x < c.width; x++) {
      if (a(x, y) > 12) continue;
      if (
        a(x - 1, y) > 12 ||
        a(x + 1, y) > 12 ||
        a(x, y - 1) > 12 ||
        a(x, y + 1) > 12 ||
        a(x - 1, y - 1) > 12 ||
        a(x + 1, y - 1) > 12 ||
        a(x - 1, y + 1) > 12 ||
        a(x + 1, y + 1) > 12
      )
        marks.push(x, y);
    }
  }
  for (let i = 0; i < marks.length; i += 2) {
    const o = (marks[i + 1] * c.width + marks[i]) * 4;
    d[o] = 12;
    d[o + 1] = 8;
    d[o + 2] = 14;
    d[o + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
  return c;
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement | null>((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

const cache: Record<string, HTMLCanvasElement> = {};
const inflight: Record<string, Promise<HTMLCanvasElement | null>> = {};

export function loadSprite(id: string) {
  if (cache[id]) return Promise.resolve(cache[id]);
  if (id in inflight) return inflight[id];
  inflight[id] = (async () => {
    const png = await loadImage(`/art/furn/${id}.png?v=21`);
    const img = png || (await loadImage(`/art/furn/${id}.jpg?v=21`));
    if (!img) {
      const def = furn(id);
      if (!def) return null;
      const baked = paintFurn(def, 0);
      if (baked.width > 4) cache[id] = baked;
      return baked.width > 4 ? baked : null;
    }
    const canvas = keyAndTrim(img);
    if (canvas.width > 4) cache[id] = canvas;
    return canvas.width > 4 ? canvas : null;
  })();
  return inflight[id];
}

export async function loadSprites(ids?: string[]) {
  const list = ids ? ids.filter(Boolean) : Object.keys(SPRITE_SRC);
  await Promise.all(list.map((id) => loadSprite(id)));
  return cache;
}

export function spriteCache() {
  return cache;
}
