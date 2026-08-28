"use client";

import { useEffect, useRef } from "react";
import { furn, HOTEL_SPOTS } from "@/lib/catalog";
import { drawRoom } from "@/lib/game/draw";
import { camToFit } from "@/lib/game/iso";
import { loadSprites } from "@/lib/game/sprites";
import { layoutById, walkable } from "@/lib/layouts";
import type { Placed, Room } from "@/lib/types";

const SAMPLES: Record<string, { id: string; x: number; y: number; rot?: 0 | 1 | 2 | 3 }[]> = HOTEL_SPOTS;

const VW = 480;
const VH = 280;

export function LayoutPreview({ layoutId }: { layoutId: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let alive = true;

    const paint = (sprites: Record<string, HTMLCanvasElement> = {}) => {
      const c = ref.current;
      if (!alive || !c) return;
      const ctx = c.getContext("2d");
      if (!ctx) return;
      const layout = layoutById(layoutId);
      c.width = VW;
      c.height = VH;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.imageSmoothingEnabled = false;
      ctx.fillStyle = "#050508";
      ctx.fillRect(0, 0, VW, VH);
      const furniture: Placed[] = (SAMPLES[layoutId] || [])
        .filter((s) => furn(s.id) && (furn(s.id)?.slot === "wall" || walkable(layout, s.x, s.y)))
        .map((s, i) => ({
          uid: `p${i}`,
          catalogId: s.id,
          x: s.x,
          y: s.y,
          rot: s.rot ?? 0,
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
      const { scale, ox, oy } = camToFit(layout, VW, VH, 18);
      ctx.setTransform(scale, 0, 0, scale, ox, oy);
      ctx.imageSmoothingEnabled = false;
      drawRoom(ctx, {
        room,
        occupants: [],
        ads: [],
        cam: { x: 0, y: 0 },
        t: 0.4,
        sprites,
      });
    };

    paint({});
    const needed = (SAMPLES[layoutId] || []).map((s) => s.id);
    loadSprites(needed).then((s) => {
      if (alive) paint(s);
    });
    return () => {
      alive = false;
    };
  }, [layoutId]);

  return (
    <canvas
      ref={ref}
      width={VW}
      height={VH}
      className="h-36 w-full rounded-lg bg-[#050508] sm:h-40"
      style={{ imageRendering: "pixelated" }}
    />
  );
}
