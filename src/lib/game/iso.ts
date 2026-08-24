export const TW = 64;
export const TH = 32;
export const ZH = 16;

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
