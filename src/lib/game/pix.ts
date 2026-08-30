/** Tiny pixel buffer. 1 cell = 1 sprite pixel. Works in browser and Node. */

export function rgb(hex: string): [number, number, number] {
  const n = parseInt(hex.replace("#", ""), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export function mix(hex: string, amt: number): [number, number, number] {
  const [r, g, b] = rgb(hex);
  return [
    Math.max(0, Math.min(255, r + amt)),
    Math.max(0, Math.min(255, g + amt)),
    Math.max(0, Math.min(255, b + amt)),
  ];
}

export function hexMix(hex: string, amt: number): string {
  const [r, g, b] = mix(hex, amt);
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}

function tone(hex: string, x: number, y: number, x0: number, y0: number, w: number, h: number): [number, number, number] {
  const lit = mix(hex, 22);
  const mid = rgb(hex);
  const dim = mix(hex, -26);
  const i = x - x0;
  const j = y - y0;
  if (j === 0 || i <= 1) return lit;
  if (j >= h - 1 || i >= w - 2) return dim;
  return mid;
}

export class Pix {
  w: number;
  h: number;
  d: Uint8ClampedArray;

  constructor(w: number, h: number) {
    this.w = w;
    this.h = h;
    this.d = new Uint8ClampedArray(w * h * 4);
  }

  a(x: number, y: number) {
    if (x < 0 || y < 0 || x >= this.w || y >= this.h) return 0;
    return this.d[(y * this.w + x) * 4 + 3];
  }

  set(x: number, y: number, c: [number, number, number], a = 255) {
    if (x < 0 || y < 0 || x >= this.w || y >= this.h) return;
    const i = (y * this.w + x) * 4;
    this.d[i] = c[0];
    this.d[i + 1] = c[1];
    this.d[i + 2] = c[2];
    this.d[i + 3] = a;
  }

  rect(x: number, y: number, w: number, h: number, c: [number, number, number]) {
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) this.set(x + i, y + j, c);
  }

  /** 3-tone clothing/skin block: light upper-left, dark lower-right. */
  block(x: number, y: number, w: number, h: number, hex: string) {
    for (let j = 0; j < h; j++) {
      for (let i = 0; i < w; i++) this.set(x + i, y + j, tone(hex, x + i, y + j, x, y, w, h));
    }
  }

  disc(cx: number, cy: number, rx: number, ry: number, c: [number, number, number]) {
    const rx2 = rx * rx || 1;
    const ry2 = ry * ry || 1;
    for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++) {
      for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) {
        const dx = x - cx;
        const dy = y - cy;
        if ((dx * dx) / rx2 + (dy * dy) / ry2 <= 1.02) this.set(x, y, c);
      }
    }
  }

  discShade(cx: number, cy: number, rx: number, ry: number, base: string, pred?: (x: number, y: number) => boolean) {
    const rx2 = rx * rx || 1;
    const ry2 = ry * ry || 1;
    const lit = mix(base, 24);
    const mid = rgb(base);
    const dim = mix(base, -28);
    for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++) {
      for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) {
        const dx = x - cx;
        const dy = y - cy;
        if ((dx * dx) / rx2 + (dy * dy) / ry2 > 1.02) continue;
        if (pred && !pred(x, y)) continue;
        const t = dx / (rx * 2) + dy / (ry * 2);
        this.set(x, y, t < -0.16 ? lit : t > 0.2 ? dim : mid);
      }
    }
  }

  /** Trapezoid, top edge y0 from xt0..xt1, bottom y1 from xb0..xb1. */
  trap(xt0: number, xt1: number, y0: number, xb0: number, xb1: number, y1: number, hex: string) {
    const h = y1 - y0;
    for (let y = y0; y <= y1; y++) {
      const t = h === 0 ? 0 : (y - y0) / h;
      const xa = Math.round(xt0 + (xb0 - xt0) * t);
      const xb = Math.round(xt1 + (xb1 - xt1) * t);
      const w = Math.max(1, xb - xa + 1);
      for (let x = xa; x <= xb; x++) this.set(x, y, tone(hex, x, y, xa, y0, w, h + 1));
    }
  }

  roundBlock(x: number, y: number, w: number, h: number, r: number, hex: string) {
    const rr = Math.max(1, Math.min(r, w / 2, h / 2));
    this.block(x + rr, y, w - rr * 2, h, hex);
    this.block(x, y + rr, w, h - rr * 2, hex);
    this.discShade(x + rr, y + rr, rr, rr, hex);
    this.discShade(x + w - rr, y + rr, rr, rr, hex);
    this.discShade(x + rr, y + h - rr, rr, rr, hex);
    this.discShade(x + w - rr, y + h - rr, rr, rr, hex);
  }

  /** Vertical capsule — rounded limbs like the sheet bodies. */
  capsule(x: number, y: number, w: number, h: number, hex: string) {
    const r = Math.max(1.2, w / 2);
    this.discShade(x + r, y + r, r, r, hex);
    const midH = Math.max(0, Math.round(h - w));
    if (midH > 0) this.block(Math.round(x), Math.round(y + r), Math.round(w), midH, hex);
    this.discShade(x + r, y + h - r, r, r, hex);
  }

  /** Triangle pointing up: tip at (cx, y0), base at y1 with half-width hw. */
  spike(cx: number, y0: number, y1: number, hw: number, hex: string) {
    const h = y1 - y0;
    const mid = rgb(hex);
    const lit = mix(hex, 28);
    const dim = mix(hex, -32);
    for (let y = y0; y <= y1; y++) {
      const t = h <= 0 ? 1 : (y - y0) / h;
      const w = Math.max(0, Math.round(hw * t));
      for (let x = cx - w; x <= cx + w; x++) {
        this.set(x, y, x < cx ? lit : x > cx ? dim : mid);
      }
    }
  }

  blit(src: Pix, dx = 0, dy = 0) {
    for (let y = 0; y < src.h; y++) {
      for (let x = 0; x < src.w; x++) {
        const i = (y * src.w + x) * 4;
        if (src.d[i + 3] < 8) continue;
        this.set(dx + x, dy + y, [src.d[i], src.d[i + 1], src.d[i + 2]], src.d[i + 3]);
      }
    }
  }

  outline(col: [number, number, number] = [22, 16, 26]) {
    const marks: number[] = [];
    for (let y = 0; y < this.h; y++) {
      for (let x = 0; x < this.w; x++) {
        if (this.a(x, y) > 0) continue;
        if (this.a(x - 1, y) || this.a(x + 1, y) || this.a(x, y - 1) || this.a(x, y + 1)) {
          marks.push(x, y);
        }
      }
    }
    for (let i = 0; i < marks.length; i += 2) this.set(marks[i], marks[i + 1], col);
  }

  canvas() {
    const c = document.createElement("canvas");
    c.width = this.w;
    c.height = this.h;
    const ctx = c.getContext("2d")!;
    const img = ctx.createImageData(this.w, this.h);
    img.data.set(this.d);
    ctx.putImageData(img, 0, 0);
    return c;
  }
}
