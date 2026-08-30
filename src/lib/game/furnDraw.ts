/**
 * Tile-locked isometric furniture.
 *
 * Every item occupies a rectangle of whole floor diamonds — never an L that
 * cuts a tile corner. Legs sit on the outer corners of that rectangle. The
 * sprite is authored in the same iso() space as the floor (TW=64, TH=32,
 * ZH=16) so the blit plants on shared vertices, not a stretched PNG.
 */
import type { FurnDef } from "../catalog";
import { footprint } from "../catalog";
import { TH, TW, ZH } from "./iso";
import { mix, Pix, rgb } from "./pix";

export const FURN_PAD = 2;
const INK: [number, number, number] = [12, 8, 14];
const INK_HEX = "#0c080e";
const WOOD = "#6d4c2f";
const WOOD_L = "#8a6a3e";
const WOOD_R = "#4a331c";
const CREAM = "#f5e6cc";

type RGB = [number, number, number];
type Pt = { x: number; y: number };
type Rot = 0 | 1 | 2 | 3;

const cache = new Map<string, HTMLCanvasElement>();

function hex(h: string, amt = 0): RGB {
  return mix(h, amt);
}

class IsoSpr {
  p: Pix;
  ox: number;
  oy: number;
  w: number;
  d: number;
  h: number;

  constructor(w: number, d: number, h: number) {
    this.w = w;
    this.d = d;
    this.h = h;
    const pad = FURN_PAD;
    const cw = (w + d) * (TW / 2) + pad * 2;
    const ch = (w + d) * (TH / 2) + h * ZH + pad * 2;
    this.p = new Pix(Math.max(8, Math.round(cw)), Math.max(8, Math.round(ch)));
    this.ox = pad + d * (TW / 2);
    this.oy = pad + h * ZH;
  }

  pt(x: number, y: number, z: number): Pt {
    return {
      x: Math.round((x - y) * (TW / 2) + this.ox),
      y: Math.round((x + y) * (TH / 2) - z * ZH + this.oy),
    };
  }

  fillTri(a: Pt, b: Pt, c: Pt, col: RGB) {
    const minX = Math.max(0, Math.min(a.x, b.x, c.x));
    const maxX = Math.min(this.p.w - 1, Math.max(a.x, b.x, c.x));
    const minY = Math.max(0, Math.min(a.y, b.y, c.y));
    const maxY = Math.min(this.p.h - 1, Math.max(a.y, b.y, c.y));
    const area = (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
    if (area === 0) return;
    for (let y = minY; y <= maxY; y++) {
      for (let x = minX; x <= maxX; x++) {
        const w0 = (b.x - a.x) * (y - a.y) - (b.y - a.y) * (x - a.x);
        const w1 = (c.x - b.x) * (y - b.y) - (c.y - b.y) * (x - b.x);
        const w2 = (a.x - c.x) * (y - c.y) - (a.y - c.y) * (x - c.x);
        if (area > 0) {
          if (w0 >= 0 && w1 >= 0 && w2 >= 0) this.p.set(x, y, col);
        } else if (w0 <= 0 && w1 <= 0 && w2 <= 0) this.p.set(x, y, col);
      }
    }
  }

  fillQuad(a: Pt, b: Pt, c: Pt, d: Pt, col: RGB) {
    this.fillTri(a, b, c, col);
    this.fillTri(a, c, d, col);
  }

  line(a: Pt, b: Pt, col: RGB = INK) {
    let x0 = a.x;
    let y0 = a.y;
    const x1 = b.x;
    const y1 = b.y;
    const dx = Math.abs(x1 - x0);
    const dy = Math.abs(y1 - y0);
    const sx = x0 < x1 ? 1 : -1;
    const sy = y0 < y1 ? 1 : -1;
    let err = dx - dy;
    while (true) {
      this.p.set(x0, y0, col);
      if (x0 === x1 && y0 === y1) break;
      const e2 = 2 * err;
      if (e2 > -dy) {
        err -= dy;
        x0 += sx;
      }
      if (e2 < dx) {
        err += dx;
        y0 += sy;
      }
    }
  }

  strokeQuad(a: Pt, b: Pt, c: Pt, d: Pt) {
    this.line(a, b);
    this.line(b, c);
    this.line(c, d);
    this.line(d, a);
  }

  /** Near faces (south + east) plus top — the three sides you see in 2:1 iso. */
  box(x: number, y: number, z: number, w: number, d: number, h: number, top: string, left: string, right: string) {
    if (w <= 0 || d <= 0 || h <= 0) return;
    const A = this.pt(x, y + d, z + h);
    const B = this.pt(x + w, y + d, z + h);
    const C = this.pt(x + w, y, z + h);
    const E = this.pt(x, y, z + h);
    const A2 = this.pt(x, y + d, z);
    const B2 = this.pt(x + w, y + d, z);
    const C2 = this.pt(x + w, y, z);
    this.fillQuad(A, B, B2, A2, hex(left));
    this.strokeQuad(A, B, B2, A2);
    this.fillQuad(C, B, B2, C2, hex(right));
    this.strokeQuad(C, B, B2, C2);
    this.fillQuad(E, C, B, A, hex(top));
    this.strokeQuad(E, C, B, A);
  }

  diamond(x: number, y: number, z: number, fill: string) {
    const t = this.pt(x, y, z);
    const r = this.pt(x + 1, y, z);
    const b = this.pt(x + 1, y + 1, z);
    const l = this.pt(x, y + 1, z);
    this.fillQuad(t, r, b, l, hex(fill));
    this.strokeQuad(t, r, b, l);
  }

  /** Four legs on the outer corners of the occupied rectangle. */
  legs(x: number, y: number, w: number, d: number, h = 0.18, wood = WOOD) {
    const s = 0.14;
    this.box(x, y, 0, s, s, h, hexMix(wood, 18), wood, hexMix(wood, -22));
    this.box(x + w - s, y, 0, s, s, h, hexMix(wood, 18), wood, hexMix(wood, -22));
    this.box(x, y + d - s, 0, s, s, h, hexMix(wood, 18), wood, hexMix(wood, -22));
    this.box(x + w - s, y + d - s, 0, s, s, h, hexMix(wood, 18), wood, hexMix(wood, -22));
  }

  tuft(x: number, y: number, z: number, w: number, d: number, col: string) {
    const cx = x + w / 2;
    const cy = y + d / 2;
    const a = this.pt(cx, cy - d * 0.18, z);
    const b = this.pt(cx + w * 0.18, cy, z);
    const c = this.pt(cx, cy + d * 0.18, z);
    const e = this.pt(cx - w * 0.18, cy, z);
    this.fillQuad(a, b, c, e, hex(col, -28));
  }
}

function hexMix(h: string, amt: number) {
  const [r, g, b] = mix(h, amt);
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}

function backrest(s: IsoSpr, w: number, d: number, rot: Rot, z: number, h: number, c: FurnDef["colors"]) {
  const t = 0.28;
  if (rot === 0) s.box(0, 0, z, w, t, h, hexMix(c.top, -8), c.left, c.right);
  else if (rot === 1) s.box(0, 0, z, t, d, h, hexMix(c.top, -8), c.left, c.right);
  else if (rot === 2) s.box(0, d - t, z, w, t, h, hexMix(c.top, -8), c.left, c.right);
  else s.box(w - t, 0, z, t, d, h, hexMix(c.top, -8), c.left, c.right);
}

function arms(s: IsoSpr, w: number, d: number, rot: Rot, z: number, h: number, c: FurnDef["colors"]) {
  const t = 0.16;
  if (rot === 0 || rot === 2) {
    s.box(0, 0, z, t, d, h, hexMix(c.top, -4), c.left, c.right);
    s.box(w - t, 0, z, t, d, h, hexMix(c.top, -4), c.left, c.right);
  } else {
    s.box(0, 0, z, w, t, h, hexMix(c.top, -4), c.left, c.right);
    s.box(0, d - t, z, w, t, h, hexMix(c.top, -4), c.left, c.right);
  }
}

function pillows(s: IsoSpr, w: number, d: number, rot: Rot, z: number, c: FurnDef["colors"]) {
  const n = Math.max(1, Math.round(rot === 1 || rot === 3 ? d : w));
  for (let i = 0; i < n; i++) {
    if (rot === 0) s.box(0.12 + i * (w / n), 0.28, z, w / n - 0.18, Math.max(0.28, d - 0.42), 0.16, CREAM, hexMix(CREAM, -24), hexMix(CREAM, -10));
    else if (rot === 1) s.box(0.28, 0.12 + i * (d / n), z, Math.max(0.28, w - 0.42), d / n - 0.18, 0.16, CREAM, hexMix(CREAM, -24), hexMix(CREAM, -10));
    else if (rot === 2) s.box(0.12 + i * (w / n), 0.08, z, w / n - 0.18, Math.max(0.28, d - 0.42), 0.16, CREAM, hexMix(CREAM, -24), hexMix(CREAM, -10));
    else s.box(0.08, 0.12 + i * (d / n), z, Math.max(0.28, w - 0.42), d / n - 0.18, 0.16, CREAM, hexMix(CREAM, -24), hexMix(CREAM, -10));
  }
}

function paintShape(s: IsoSpr, def: FurnDef, rot: Rot) {
  const { w, d } = footprint(def, rot);
  const c = def.colors;
  const shape = def.shape;
  const h = Math.max(0.2, def.h);

  if (shape === "rug" || def.finish) {
    for (let y = 0; y < d; y++) {
      for (let x = 0; x < w; x++) {
        const fill = (x + y) % 2 === 0 ? c.top : c.right;
        s.diamond(x, y, 0.02, fill);
      }
    }
    return;
  }

  if (shape === "pad") {
    for (let y = 0; y < d; y++) for (let x = 0; x < w; x++) s.diamond(x, y, 0.02, c.top);
    s.box(0.18, 0.18, 0.02, w - 0.36, d - 0.36, 0.22, c.right, c.left, c.accent || c.right);
    return;
  }

  if (shape === "sofa" || shape === "bench") {
    s.legs(0, 0, w, d, 0.16, WOOD);
    s.box(0, 0, 0.16, w, d, 0.42, c.top, c.left, c.right);
    if (shape === "sofa") {
      backrest(s, w, d, rot, 0.58, 0.88, c);
      arms(s, w, d, rot, 0.58, 0.42, c);
      const seats = Math.max(1, Math.round(rot === 1 || rot === 3 ? d : w));
      for (let i = 0; i < seats; i++) {
        if (rot === 0 || rot === 2) {
          s.box(0.18 + i * (w / seats), 0.22, 0.58, w / seats - 0.28, d - 0.4, 0.08, hexMix(c.top, 14), c.left, c.right);
          s.tuft(0.18 + i * (w / seats), 0.22, 0.67, w / seats - 0.28, d - 0.4, c.top);
        } else {
          s.box(0.22, 0.18 + i * (d / seats), 0.58, w - 0.4, d / seats - 0.28, 0.08, hexMix(c.top, 14), c.left, c.right);
        }
      }
      pillows(s, w, d, rot, 0.66, c);
    }
    return;
  }

  if (shape === "chair" || shape === "armchair" || shape === "throne") {
    s.legs(0, 0, w, d, 0.18, WOOD);
    s.box(0.08, 0.08, 0.18, w - 0.16, d - 0.16, 0.4, c.top, c.left, c.right);
    const backH = shape === "throne" ? 1.7 : shape === "armchair" ? 1.35 : 1.15;
    backrest(s, w, d, rot, 0.58, backH, c);
    if (shape !== "chair") arms(s, w, d, rot, 0.58, 0.55, c);
    if (shape === "throne") {
      s.box(0.2, 0.2, 0.58 + backH, 0.16, 0.16, 0.2, c.accent || "#f5c542", WOOD, WOOD);
      s.box(w - 0.36, 0.2, 0.58 + backH, 0.16, 0.16, 0.2, c.accent || "#f5c542", WOOD, WOOD);
    }
    return;
  }

  if (shape === "stool") {
    s.legs(0.22, 0.22, w - 0.44, d - 0.44, Math.min(0.9, h - 0.2), WOOD);
    s.box(0.18, 0.18, Math.min(0.9, h - 0.2), w - 0.36, d - 0.36, 0.2, c.top, c.left, c.right);
    return;
  }

  if (shape === "bean") {
    s.box(0.12, 0.12, 0, w - 0.24, d - 0.24, 0.55, c.top, c.left, c.right);
    s.box(0.22, 0.22, 0.55, w - 0.44, d - 0.44, 0.22, hexMix(c.top, 16), c.left, c.right);
    return;
  }

  if (shape === "lounger") {
    s.legs(0, 0, w, d, 0.12, WOOD);
    s.box(0, 0, 0.12, w, d, 0.28, c.top, c.left, c.right);
    backrest(s, w, d, rot, 0.4, 0.28, c);
    return;
  }

  if (shape === "bed" || shape === "canopy") {
    s.legs(0, 0, w, d, 0.2, WOOD);
    s.box(0, 0, 0.2, w, d, 0.28, WOOD_L, WOOD, WOOD_R);
    s.box(0.06, 0.06, 0.48, w - 0.12, d - 0.12, 0.22, c.top, c.left, c.right);
    const ph = 0.22;
    if (rot === 0) s.box(0.1, 0.08, 0.7, w - 0.2, 0.32, ph, c.accent || "#ff6b5a", c.left, c.right);
    else if (rot === 1) s.box(0.08, 0.1, 0.7, 0.32, d - 0.2, ph, c.accent || "#ff6b5a", c.left, c.right);
    else if (rot === 2) s.box(0.1, d - 0.4, 0.7, w - 0.2, 0.32, ph, c.accent || "#ff6b5a", c.left, c.right);
    else s.box(w - 0.4, 0.1, 0.7, 0.32, d - 0.2, ph, c.accent || "#ff6b5a", c.left, c.right);
    if (shape === "canopy") {
      const post = 0.12;
      const topZ = Math.max(1.6, h - 0.3);
      s.box(0, 0, 0.48, post, post, topZ, c.right, c.left, c.right);
      s.box(w - post, 0, 0.48, post, post, topZ, c.right, c.left, c.right);
      s.box(0, d - post, 0.48, post, post, topZ, c.right, c.left, c.right);
      s.box(w - post, d - post, 0.48, post, post, topZ, c.right, c.left, c.right);
      s.box(0, 0, 0.48 + topZ, w, d, 0.1, c.top, c.left, c.right);
    }
    return;
  }

  if (shape === "table" || shape === "desk" || shape === "chess") {
    s.legs(0, 0, w, d, Math.max(0.45, h - 0.18), WOOD);
    s.box(0, 0, Math.max(0.45, h - 0.18), w, d, 0.16, c.top, c.left, c.right);
    if (shape === "chess") {
      for (let y = 0; y < 4; y++) {
        for (let x = 0; x < 4; x++) {
          const fill = (x + y) % 2 === 0 ? "#111111" : "#eeeeee";
          s.box(0.1 + x * ((w - 0.2) / 4), 0.1 + y * ((d - 0.2) / 4), Math.max(0.45, h - 0.18) + 0.16, (w - 0.2) / 4, (d - 0.2) / 4, 0.02, fill, fill, fill);
        }
      }
    }
    if (shape === "desk") s.box(0.08, 0.7, Math.max(0.45, h - 0.18) + 0.16, 0.4, 0.22, 0.08, c.accent || "#14F195", c.left, c.right);
    return;
  }

  if (shape === "box") {
    s.box(0.08, 0.08, 0, w - 0.16, d - 0.16, h, c.top, c.left, c.right);
    return;
  }

  if (shape === "lamp" || shape === "solamp" || shape === "lava") {
    s.box(0.38, 0.38, 0, 0.24, 0.24, 0.12, WOOD_L, WOOD, WOOD_R);
    s.box(0.44, 0.44, 0.12, 0.12, 0.12, Math.max(0.8, h - 0.5), c.left, hexMix(c.left, -16), c.right);
    s.box(0.22, 0.22, Math.max(0.9, h - 0.45), 0.56, 0.56, 0.42, c.top, hexMix(c.top, -22), c.right);
    return;
  }

  if (shape === "chandelier") {
    s.box(0.46, 0.46, h - 0.2, 0.08, 0.08, 0.2, "#c9a227", "#8a6a00", "#f5c542");
    s.box(0.18, 0.18, h - 0.55, 0.64, 0.64, 0.18, c.top, c.left, c.right);
    s.box(0.28, 0.28, h - 0.7, 0.44, 0.44, 0.16, hexMix(c.top, 20), c.left, c.right);
    return;
  }

  if (shape === "neon") {
    s.box(0, 0.35, 0.05, w, 0.3, 0.18, c.top, c.left, c.right);
    return;
  }

  if (shape === "cactus" || shape === "palm" || shape === "flower" || shape === "hedge" || shape === "tree") {
    s.box(0.28, 0.28, 0, 0.44, 0.44, 0.38, c.left, hexMix(c.left, -20), hexMix(c.left, 10));
    if (shape === "hedge") {
      s.box(0.06, 0.06, 0.38, w - 0.12, d - 0.12, 0.85, c.top, hexMix(c.top, -25), c.right);
      return;
    }
    s.box(0.42, 0.42, 0.38, 0.16, 0.16, shape === "tree" ? 1.1 : 0.7, hexMix(c.left, -10), hexMix(c.left, -28), c.left);
    const leafZ = shape === "tree" ? 1.4 : 1.05;
    s.box(0.12, 0.22, leafZ, 0.76, 0.36, 0.28, c.top, hexMix(c.top, -25), c.right);
    s.box(0.22, 0.08, leafZ + 0.1, 0.36, 0.72, 0.22, hexMix(c.top, 12), hexMix(c.top, -20), c.right);
    if (shape === "flower") s.box(0.38, 0.38, leafZ + 0.28, 0.24, 0.24, 0.18, c.top, c.left, c.right);
    if (shape === "tree") s.box(0.08, 0.08, leafZ + 0.32, 0.84, 0.84, 0.35, hexMix(c.right, 10), c.top, c.right);
    return;
  }

  if (shape === "tv" || shape === "pc" || shape === "arcade" || shape === "juke" || shape === "dj" || shape === "fridge" || shape === "bar") {
    s.box(0, 0, 0, w, d, h, c.top, c.left, c.right);
    const screen = c.accent || "#111827";
    if (shape === "tv" || shape === "arcade" || shape === "pc") {
      s.box(0.1, 0.04, h * 0.32, w - 0.2, 0.08, h * 0.52, screen, "#020617", screen);
    }
    if (shape === "fridge" || shape === "juke") {
      s.box(w - 0.12, 0.2, h * 0.45, 0.08, 0.08, 0.18, "#d1d5db", "#6b7280", "#e5e7eb");
    }
    if (shape === "bar" || shape === "dj") {
      s.box(0.08, 0.08, h, w - 0.16, d - 0.16, 0.08, hexMix(c.top, 16), c.left, c.right);
    }
    return;
  }

  if (shape === "disco" || shape === "orb" || shape === "diamond" || shape === "prism") {
    s.box(0.42, 0.42, 0, 0.16, 0.16, Math.max(0.4, h - 0.7), c.left, hexMix(c.left, -20), c.right);
    s.box(0.18, 0.18, Math.max(0.4, h - 0.7), 0.64, 0.64, 0.7, c.top, c.left, c.right);
    return;
  }

  if (shape === "fountain") {
    s.box(0, 0, 0, w, d, 0.28, c.right, c.left, c.top);
    s.box(0.35, 0.35, 0.28, w - 0.7, d - 0.7, 0.55, c.top, c.left, c.right);
    s.box(w / 2 - 0.18, d / 2 - 0.18, 0.83, 0.36, 0.36, 0.35, hexMix(c.top, 20), c.left, c.right);
    return;
  }

  if (shape === "clock") {
    s.box(0.22, 0.22, 0, 0.56, 0.56, 0.18, WOOD_L, WOOD, WOOD_R);
    s.box(0.28, 0.28, 0.18, 0.44, 0.44, 0.7, c.top, c.left, c.right);
    s.box(0.46, 0.4, 0.88, 0.08, 0.08, 0.18, INK_HEX, INK_HEX, INK_HEX);
    return;
  }

  if (shape === "radio") {
    s.box(0.12, 0.22, 0, 0.76, 0.56, 0.5, c.top, c.left, c.right);
    s.box(0.22, 0.28, 0.5, 0.28, 0.2, 0.12, "#111", "#222", "#333");
    return;
  }

  if (shape === "divider" || shape === "wardrobe") {
    s.box(0, 0, 0, w, d, h, c.top, c.left, c.right);
    s.box(w * 0.5 - 0.04, 0.02, 0.12, 0.08, d - 0.04, h - 0.24, WOOD_L, WOOD, WOOD_R);
    s.box(0.14, 0.02, h * 0.52, 0.14, 0.08, 0.1, "#d1d5db", "#6b7280", "#e5e7eb");
    s.box(w - 0.28, 0.02, h * 0.52, 0.14, 0.08, 0.1, "#d1d5db", "#6b7280", "#e5e7eb");
    return;
  }

  if (shape === "frame" || shape === "board") {
    const thick = def.slot === "wall" ? 0.12 : 0.18;
    s.box(0, 0, 0.7, w, thick, Math.max(1.1, h), c.top, c.left, c.right);
    s.box(0.08, 0.02, 0.82, Math.max(0.3, w - 0.16), Math.max(0.06, thick - 0.06), Math.max(0.85, h - 0.28), "#111111", "#1f2937", "#0f172a");
    return;
  }

  if (shape === "umbrella") {
    s.box(0.44, 0.44, 0, 0.12, 0.12, Math.max(1.4, h - 0.5), WOOD_L, WOOD, WOOD_R);
    s.box(0.08, 0.08, Math.max(1.4, h - 0.5), 0.84, 0.84, 0.16, c.top, c.left, c.right);
    s.box(0.22, 0.22, Math.max(1.56, h - 0.34), 0.56, 0.56, 0.12, hexMix(c.top, 18), c.left, c.right);
    return;
  }

  if (shape === "dice") {
    s.box(0.12, 0.12, 0, 0.76, 0.76, 1.1, c.top, c.left, c.right);
    s.box(0.3, 0.18, 0.7, 0.12, 0.08, 0.12, "#111", "#111", "#111");
    s.box(0.58, 0.18, 0.55, 0.12, 0.08, 0.12, "#111", "#111", "#111");
    s.box(0.44, 0.18, 0.85, 0.12, 0.08, 0.12, "#111", "#111", "#111");
    return;
  }

  s.box(0, 0, 0, w, d, h, c.top, c.left, c.right);
}

function buildPix(def: FurnDef, rot: Rot) {
  const { w, d } = footprint(def, rot);
  const h = Math.max(0.2, def.h);
  const s = new IsoSpr(w, d, h);
  paintShape(s, def, rot);
  s.p.outline(INK);
  return s.p;
}

export function paintFurnPix(def: FurnDef, rot: Rot = 0) {
  return buildPix(def, rot);
}

export function paintFurn(def: FurnDef, rot: Rot = 0) {
  const key = `${def.id}:${rot}:${def.w}x${def.d}x${def.h}:${def.shape}`;
  const hit = cache.get(key);
  if (hit) return hit;
  const canvas = buildPix(def, rot).canvas();
  cache.set(key, canvas);
  if (cache.size > 400) {
    const first = cache.keys().next().value;
    if (first) cache.delete(first);
  }
  return canvas;
}

export function clearFurnCache() {
  cache.clear();
}

/** Cushion / perch height in tile-Z so a guest plants ON the seat, not the floor. */
export function seatZ(def: FurnDef) {
  if (def.layable) return 0.4;
  if (!def.sittable) return 0;
  if (def.shape === "stool") return Math.min(1.05, Math.max(0.7, def.h * 0.7));
  if (def.shape === "bean") return 0.42;
  if (def.shape === "lounger" || def.shape === "bed" || def.shape === "canopy") return 0.5;
  if (def.shape === "bench") return 0.52;
  return 0.58;
}
