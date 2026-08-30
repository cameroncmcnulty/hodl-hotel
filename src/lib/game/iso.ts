export const TW = 64;
export const TH = 32;
export const ZH = 16;

/**
 * Plant a furniture sprite on a w×d occupancy.
 * `fill` is how much of the occupancy diamond to cover (stool ~0.46, sofa ~0.9).
 * Uniform scale (no stretch). Feet centered on the occupancy, not jammed to the
 * near corner.
 */
export function plantFurn(
  x: number,
  y: number,
  z: number,
  w: number,
  d: number,
  _h: number,
  texW: number,
  texH: number,
  fill = 1
) {
  const mid = iso(x + w / 2, y + d / 2, z);
  const spanX = Math.max(8, (w + d) * (TW / 2) * Math.max(0.2, Math.min(1, fill)));
  const s = spanX / Math.max(1, texW);
  const destW = Math.max(8, Math.round(texW * s));
  const destH = Math.max(8, Math.round(texH * s));
  return {
    x: Math.round(mid.sx - destW / 2),
    y: Math.round(mid.sy - destH),
    destW,
    destH,
  };
}

export function iso(x: number, y: number, z = 0) {
  return {
    sx: (x - y) * (TW / 2),
    sy: (x + y) * (TH / 2) - z * ZH,
  };
}

export function uniso(sx: number, sy: number) {
  const x = (sx / (TW / 2) + sy / (TH / 2)) / 2;
  const y = (sy / (TH / 2) - sx / (TW / 2)) / 2;
  return { x, y };
}

export function depth(x: number, y: number, z = 0) {
  return (x + y) * 1000 + z;
}

/** Screen-space AABB of a layout including walls and floor thickness. */
export function layoutIsoBounds(layout: { w: number; h: number }, wallH = 7.4) {
  const corners = [
    iso(0, 0, wallH),
    iso(layout.w, 0, wallH),
    iso(0, layout.h, wallH),
    iso(0, 0, 0),
    iso(layout.w, 0, 0),
    iso(0, layout.h, 0),
    iso(layout.w, layout.h, 0),
  ];
  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity;
  for (const p of corners) {
    minX = Math.min(minX, p.sx);
    maxX = Math.max(maxX, p.sx);
    minY = Math.min(minY, p.sy);
    maxY = Math.max(maxY, p.sy);
  }
  maxY += 14;
  return { minX, minY, maxX, maxY, w: maxX - minX, h: maxY - minY };
}

/** Scale + origin so the whole layout sits inside a view with padding. */
export function camToFit(layout: { w: number; h: number }, viewW: number, viewH: number, pad = 14) {
  const b = layoutIsoBounds(layout);
  const scale = Math.min((viewW - pad * 2) / b.w, (viewH - pad * 2) / b.h);
  const ox = (viewW - b.w * scale) / 2 - b.minX * scale;
  const oy = (viewH - b.h * scale) / 2 - b.minY * scale;
  return { scale, ox, oy };
}
