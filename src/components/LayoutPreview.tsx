"use client";

import { useEffect, useRef } from "react";
import { furn } from "@/lib/catalog";
import { drawRoom } from "@/lib/game/draw";
import { iso } from "@/lib/game/iso";
import { loadSprites } from "@/lib/game/sprites";
import { layoutById } from "@/lib/layouts";
import type { Placed, Room } from "@/lib/types";

const SAMPLES: Record<string, { id: string; x: number; y: number }[]> = {
  cozy_studio: [
    { id: "rug_small", x: 2, y: 2 },
    { id: "bed_twin", x: 5, y: 1 },
    { id: "plant_palm", x: 1, y: 1 },
    { id: "chair_coral", x: 3, y: 5 },
    { id: "table_coffee", x: 2, y: 5 },
    { id: "lamp_floor", x: 6, y: 5 },
  ],
  city_loft: [
    { id: "sofa_sunset", x: 1, y: 2 },
    { id: "table_coffee", x: 2, y: 4 },
    { id: "plant_palm", x: 8, y: 1 },
    { id: "table_desk", x: 1, y: 7 },
    { id: "lamp_floor", x: 4, y: 1 },
  ],
  neon_suite: [
    { id: "bed_double", x: 1, y: 1 },
    { id: "sofa_sunset", x: 7, y: 6 },
    { id: "plant_palm", x: 10, y: 1 },
    { id: "lamp_sol", x: 5, y: 4 },
    { id: "rug_large", x: 6, y: 3 },
  ],
  sky_penthouse: [
    { id: "lounger_pool", x: 2, y: 8 },
    { id: "sofa_sunset", x: 3, y: 2 },
    { id: "plant_palm", x: 11, y: 1 },
    { id: "fountain", x: 8, y: 3 },
    { id: "lamp_floor", x: 1, y: 1 },
  ],
  vault_den: [
    { id: "throne_obsidian", x: 6, y: 2 },
    { id: "statue_sol", x: 3, y: 6 },
    { id: "bean_gold", x: 7, y: 7 },
    { id: "lamp_sol", x: 1, y: 1 },
  ],
  garden_lanai: [
    { id: "plant_palm", x: 3, y: 3 },
    { id: "plant_palm", x: 6, y: 3 },
    { id: "bean_gold", x: 1, y: 1 },
    { id: "sofa_sunset", x: 7, y: 8 },
    { id: "fountain", x: 4, y: 4 },
  ],
};

export function LayoutPreview({ layoutId }: { layoutId: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let alive = true;
    const paint = async () => {
      const sprites = await loadSprites();
      const c = ref.current;
      if (!alive || !c) return;
      const ctx = c.getContext("2d");
      if (!ctx) return;
      const layout = layoutById(layoutId);
      const dpr = 1;
      c.width = 280;
      c.height = 160;
      ctx.imageSmoothingEnabled = false;
      ctx.fillStyle = "#7ec8ea";
      ctx.fillRect(0, 0, 280, 160);
      const mid = iso(layout.w / 2, layout.h / 2);
      const furniture: Placed[] = (SAMPLES[layoutId] || [])
        .filter((s) => furn(s.id))
        .map((s, i) => ({
          uid: `p${i}`,
          catalogId: s.id,
          x: s.x,
          y: s.y,
          rot: 0,
          ownerId: "hotel",
        }));
      const room: Room = {
        id: "preview",
        name: layout.name,
        ownerId: "hotel",
        layoutId,
        visibility: "public",
        furniture,
        maxUsers: 1,
        createdAt: "",
        lastActiveAt: "",
      };
      drawRoom(ctx, {
        room,
        occupants: [],
        ads: [],
        cam: { x: 140 - mid.sx, y: 88 - mid.sy },
        t: 0.4,
        sprites,
      });
      void dpr;
    };
    paint();
    return () => {
      alive = false;
    };
  }, [layoutId]);

  return <canvas ref={ref} width={280} height={160} className="h-28 w-full rounded-lg bg-[#7ec8ea]" style={{ imageRendering: "pixelated" }} />;
}
