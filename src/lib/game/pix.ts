/** Tiny pixel buffer for hotel-sim avatars. 1 cell = 1 sprite pixel. */

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

  /** 3-tone clothing/skin block: light left+top, mid, dark right+bottom. */
  block(x: number, y: number, w: number, h: number, hex: string) {
    const lit = mix(hex, 32);
    const mid = rgb(hex);
    const dim = mix(hex, -38);
    for (let j = 0; j < h; j++) {
      for (let i = 0; i < w; i++) {
        let c = mid;
        if (i <= 1 || j === 0) c = lit;
        if (i >= w - 2 || j === h - 1) c = dim;
        if (i === 0 && j === 0) c = lit;
        this.set(x + i, y + j, c);
      }
    }
  }

  disc(cx: number, cy: number, rx: number, ry: number, c: [number, number, number]) {
    const rx2 = rx * rx;
    const ry2 = ry * ry;
    for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++) {
      for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) {
        const dx = x - cx;
        const dy = y - cy;
        if ((dx * dx) / rx2 + (dy * dy) / ry2 <= 1.05) this.set(x, y, c);
      }
    }
  }

  /** Lighter on the upper-left, darker lower-right — hotel-sim shading. */
  discShade(cx: number, cy: number, rx: number, ry: number, base: string) {
    const lit = mix(base, 28);
    const mid = rgb(base);
    const dim = mix(base, -32);
    const rx2 = rx * rx;
    const ry2 = ry * ry;
    for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++) {
      for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) {
        const dx = x - cx;
        const dy = y - cy;
        if ((dx * dx) / rx2 + (dy * dy) / ry2 > 1.05) continue;
        const t = dx / (rx * 2) + dy / (ry * 2);
        this.set(x, y, t < -0.15 ? lit : t > 0.22 ? dim : mid);
      }
    }
  }

  outline(col: [number, number, number] = [12, 8, 16]) {
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
