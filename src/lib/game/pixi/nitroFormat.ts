/**
 * Nitro / Octane asset contract.
 *
 * Official Sulake/Habbo sprite packs are copyrighted — we do not load them.
 * This is the same *method* Nitro uses: figure recipes, furniture visualization
 * JSON, and spritesheets registered to a 64×32 dimetric tile.
 *
 * Drop original packs later at:
 *   public/nitro/gamedata/figuredata.json
 *   public/nitro/gamedata/furnidata.json
 *   public/nitro/assets/furn/<classname>/{spritesheet.json, spritesheet.png}
 *   public/nitro/assets/figure/<lib>/{spritesheet.json, spritesheet.png}
 *
 * Until those exist, HotelPixi blits our own pixel-art sprites (public/art/furn)
 * onto the same 64×32 dimetric grid Nitro uses. Pixi is the renderer — the
 * art is authored PNGs, not Graphics cubes.
 */

export type NitroFigurePart = {
  type: "hd" | "hr" | "ch" | "lg" | "sh" | "ha" | "fc" | "bd" | "rh";
  setId: string;
  colorId?: string;
};

export type NitroFurniViz = {
  classname: string;
  w: number;
  d: number;
  h: number;
  slot: "floor" | "wall";
  sittable?: boolean;
  directions: number[];
};

export const NITRO_TILE = { tw: 64, th: 32, zh: 16 };

export const NITRO_PATHS = {
  figuredata: "/nitro/gamedata/figuredata.json",
  furnidata: "/nitro/gamedata/furnidata.json",
  furnAsset: (classname: string) => `/nitro/assets/furn/${classname}/spritesheet.json`,
  figureAsset: (lib: string) => `/nitro/assets/figure/${lib}/spritesheet.json`,
};

export async function probeNitroPacks() {
  const tryGet = async (url: string) => {
    try {
      const r = await fetch(url, { method: "HEAD" });
      return r.ok;
    } catch {
      return false;
    }
  };
  const [figuredata, furnidata] = await Promise.all([
    tryGet(NITRO_PATHS.figuredata),
    tryGet(NITRO_PATHS.furnidata),
  ]);
  return { figuredata, furnidata, ready: figuredata && furnidata };
}
