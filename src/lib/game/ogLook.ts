/**
 * In-game guests are the approved OG pixel sprites — not the procedural blobs.
 * Mix-and-match recolors skin / hair / top / bottom / shoes on that art.
 */
import type { Figure } from "../types";
import { keyAndTrim } from "./sprites";
import { rgb } from "./pix";
import {
  clampFigure,
  DYE,
  hairColors,
  hairsFor,
} from "./lookDraw";

export const OG_H = 62;

const PATH: Record<string, string> = {
  "m-stand": "/art/avatars/og-guest.png",
  "m-sit": "/art/avatars/og-sit.png",
  "m-lay": "/art/avatars/og-lay.png",
  "m-back": "/art/avatars/og-back.png",
  "m-afro": "/art/avatars/og-afro.png",
  "f-stand": "/art/avatars/og-guest-f.png",
  "f-sit": "/art/avatars/og-sit-f.png",
  "f-lay": "/art/avatars/og-lay-f.png",
  "f-back": "/art/avatars/og-back-f.png",
};

const raw = new Map<string, HTMLCanvasElement>();
const dyed = new Map<string, HTMLCanvasElement>();
let pack: Promise<void> | null = null;

function loadImage(src: string) {
  return new Promise<HTMLImageElement | null>((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = `${src}?v=23`;
  });
}

export function loadOgPack() {
  if (pack) return pack;
  pack = (async () => {
    await Promise.all(
      Object.entries(PATH).map(async ([id, src]) => {
        const img = await loadImage(src);
        if (!img) return;
        raw.set(id, keyAndTrim(img));
      })
    );
  })();
  return pack;
}

export function ogReady() {
  return raw.size > 0;
}

export type OgOpts = { dir?: 0 | 1 | 2 | 3; sit?: boolean; lay?: boolean; walk?: 0 | 1 };

function poseId(fig: Figure, opts: OgOpts) {
  const g = (fig.gender ?? 0) === 1 ? "f" : "m";
  if (opts.lay) return `${g}-lay`;
  if (opts.sit) return `${g}-sit`;
  const dir = opts.dir ?? 1;
  if (dir === 2 || dir === 3) return `${g}-back`;
  if (g === "m" && (hairsFor(0)[fig.hair] || "") === "afro") return "m-afro";
  return `${g}-stand`;
}

function hsl(r: number, g: number, b: number) {
  const R = r / 255;
  const G = g / 255;
  const B = b / 255;
  const max = Math.max(R, G, B);
  const min = Math.min(R, G, B);
  const l = (max + min) / 2;
  if (max === min) return { h: 0, s: 0, l };
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  if (max === R) h = (G - B) / d + (G < B ? 6 : 0);
  else if (max === G) h = (B - R) / d + 2;
  else h = (R - G) / d + 4;
  return { h: h * 60, s, l };
}

function shadeHex(hex: string, srcL: number): [number, number, number] {
  const [tr, tg, tb] = rgb(hex);
  const k = Math.max(0.22, Math.min(1.35, srcL / 158));
  return [
    Math.max(0, Math.min(255, Math.round(tr * k))),
    Math.max(0, Math.min(255, Math.round(tg * k))),
    Math.max(0, Math.min(255, Math.round(tb * k))),
  ];
}

function flipH(src: HTMLCanvasElement) {
  const c = document.createElement("canvas");
  c.width = src.width;
  c.height = src.height;
  const ctx = c.getContext("2d")!;
  ctx.translate(c.width, 0);
  ctx.scale(-1, 1);
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(src, 0, 0);
  return c;
}

function recolor(src: HTMLCanvasElement, fig: Figure, pose: string) {
  const girl = (fig.gender ?? 0) === 1;
  const pal = {
    hair: hairColors(girl ? 1 : 0)[fig.hairColor] || "#8b5a2b",
    top: DYE[fig.top] || "#f5c542",
    bot: DYE[fig.bottom] || "#2a2a32",
    shoe: DYE[fig.shoes] || "#8a8f98",
  };
  const w = src.width;
  const h = src.height;
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d")!;
  ctx.drawImage(src, 0, 0);
  const img = ctx.getImageData(0, 0, w, h);
  const d = img.data;
  const lay = pose.endsWith("lay");
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      if (d[i + 3] < 12) continue;
      const r = d[i];
      const g = d[i + 1];
      const b = d[i + 2];
      const L = (r + g + b) / 3;
      if (L < 36) continue;
      if (L > 242 && Math.abs(r - g) < 18 && Math.abs(g - b) < 18) continue;
      const { h: hue, s } = hsl(r, g, b);
      const t = lay ? x / w : y / h;
      const upper = lay ? t < 0.38 : t < 0.46;
      const mid = lay ? t >= 0.28 && t < 0.68 : t >= 0.4 && t < 0.72;
      const legs = lay ? t >= 0.58 && t < 0.86 : t >= 0.62 && t < 0.88;
      const feet = lay ? t >= 0.8 : t >= 0.84;

      const yellow = hue > 36 && hue < 78 && s > 0.35 && L > 70;
      const pink = (hue > 300 || hue < 22) && s > 0.22 && L > 60 && L < 230;
      if ((yellow || pink) && (mid || upper)) {
        const [nr, ng, nb] = shadeHex(pal.top, L);
        d[i] = nr;
        d[i + 1] = ng;
        d[i + 2] = nb;
        continue;
      }
      if (upper && s > 0.18 && L < 160 && hue > 10 && hue < 55) {
        const [nr, ng, nb] = shadeHex(pal.hair, L);
        d[i] = nr;
        d[i + 1] = ng;
        d[i + 2] = nb;
        continue;
      }
      if (upper && girl && L < 95 && s < 0.28) {
        const [nr, ng, nb] = shadeHex(pal.hair, Math.max(70, L));
        d[i] = nr;
        d[i + 1] = ng;
        d[i + 2] = nb;
        continue;
      }
      if (feet && s < 0.22 && L > 80) {
        const [nr, ng, nb] = shadeHex(pal.shoe, L);
        d[i] = nr;
        d[i + 1] = ng;
        d[i + 2] = nb;
        continue;
      }
      if ((legs || mid) && s < 0.28 && L < 110) {
        const [nr, ng, nb] = shadeHex(pal.bot, Math.max(55, L));
        d[i] = nr;
        d[i + 1] = ng;
        d[i + 2] = nb;
      }
    }
  }
  ctx.putImageData(img, 0, 0);
  return c;
}

export function getOgCanvas(fig: Figure, opts: OgOpts = {}): HTMLCanvasElement | null {
  const f = clampFigure(fig);
  const pose = poseId(f, opts);
  const dir = opts.dir ?? 1;
  const flip = dir === 0 || dir === 3;
  const key = `${pose}:${f.gender}:${f.skin}:${f.hair}:${f.hairColor}:${f.top}:${f.bottom}:${f.shoes}:${flip ? 1 : 0}`;
  const hit = dyed.get(key);
  if (hit) return hit;
  const src = raw.get(pose) || raw.get(pose.startsWith("f") ? "f-stand" : "m-stand");
  if (!src) return null;
  let out = recolor(src, f, pose);
  if (flip) out = flipH(out);
  dyed.set(key, out);
  if (dyed.size > 240) {
    const first = dyed.keys().next().value;
    if (first) dyed.delete(first);
  }
  return out;
}

export function ogScale(canvas: HTMLCanvasElement, lay: boolean) {
  if (lay) return Math.max(0.08, 70 / Math.max(canvas.width, canvas.height));
  return Math.max(0.08, OG_H / canvas.height);
}
