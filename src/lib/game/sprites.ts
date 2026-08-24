export const SPRITE_SRC: Record<string, string> = {
  armchair_teal: "/art/furn/armchair_teal.jpg",
  chair_coral: "/art/furn/armchair_teal.jpg",
  sofa_sunset: "/art/furn/sofa_sunset.jpg",
  loveseat_violet: "/art/furn/loveseat_violet.jpg",
  bean_gold: "/art/furn/bean_gold.jpg",
  bed_twin: "/art/furn/bed_twin.jpg",
  bed_double: "/art/furn/bed_twin.jpg",
  bed_canopy: "/art/furn/bed_twin.jpg",
  table_coffee: "/art/furn/table_coffee.jpg",
  table_dining: "/art/furn/table_coffee.jpg",
  nightstand: "/art/furn/table_coffee.jpg",
  plant_palm: "/art/furn/plant_palm.jpg",
  plant_cactus: "/art/furn/plant_palm.jpg",
  plant_flower: "/art/furn/plant_palm.jpg",
  plant_hedge: "/art/furn/plant_palm.jpg",
  lamp_floor: "/art/furn/lamp_floor.jpg",
  lamp_sol: "/art/furn/lamp_floor.jpg",
  lamp_lava: "/art/furn/lamp_floor.jpg",
  dice_machine: "/art/furn/dice_machine.jpg",
  teleporter: "/art/furn/teleporter.jpg",
  disco_ball: "/art/furn/disco_ball.jpg",
  fridge: "/art/furn/fridge.jpg",
  lounger_pool: "/art/furn/lounger_pool.jpg",
  fountain: "/art/furn/fountain.jpg",
  frame_basic: "/art/furn/frame_gold.jpg",
  frame_teak: "/art/furn/frame_gold.jpg",
  frame_neon: "/art/furn/frame_gold.jpg",
  frame_gold: "/art/furn/frame_gold.jpg",
  frame_obsidian: "/art/furn/frame_gold.jpg",
};

function keyAndTrim(img: HTMLImageElement) {
  const c = document.createElement("canvas");
  c.width = img.width;
  c.height = img.height;
  const ctx = c.getContext("2d")!;
  ctx.drawImage(img, 0, 0);
  const data = ctx.getImageData(0, 0, c.width, c.height);
  const d = data.data;
  let minX = c.width,
    minY = c.height,
    maxX = 0,
    maxY = 0;
  for (let y = 0; y < c.height; y++) {
    for (let x = 0; x < c.width; x++) {
      const i = (y * c.width + x) * 4;
      const r = d[i],
        g = d[i + 1],
        b = d[i + 2];
      const magenta = r > 170 && b > 170 && g < 110 && Math.abs(r - b) < 80;
      if (magenta) {
        d[i + 3] = 0;
      } else if (d[i + 3] > 12) {
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
      }
    }
  }
  ctx.putImageData(data, 0, 0);
  if (maxX <= minX || maxY <= minY) return c;
  const pad = 2;
  minX = Math.max(0, minX - pad);
  minY = Math.max(0, minY - pad);
  maxX = Math.min(c.width - 1, maxX + pad);
  maxY = Math.min(c.height - 1, maxY + pad);
  const w = maxX - minX + 1;
  const h = maxY - minY + 1;
  const out = document.createElement("canvas");
  out.width = w;
  out.height = h;
  out.getContext("2d")!.drawImage(c, minX, minY, w, h, 0, 0, w, h);
  return out;
}

let cache: Record<string, HTMLCanvasElement> | null = null;
let loading: Promise<Record<string, HTMLCanvasElement>> | null = null;

export function loadSprites() {
  if (cache) return Promise.resolve(cache);
  if (loading) return loading;
  loading = Promise.all(
    Object.entries(SPRITE_SRC).map(
      ([id, src]) =>
        new Promise<{ id: string; canvas: HTMLCanvasElement }>((resolve) => {
          const img = new Image();
          img.onload = () => resolve({ id, canvas: keyAndTrim(img) });
          img.onerror = () => resolve({ id, canvas: document.createElement("canvas") });
          img.src = src;
        })
    )
  ).then((rows) => {
    cache = {};
    for (const row of rows) if (row.canvas.width > 4) cache[row.id] = row.canvas;
    return cache;
  });
  return loading;
}
