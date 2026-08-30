"use client";

import { useEffect, useRef } from "react";
import { furn } from "@/lib/catalog";
import { paintFurn } from "@/lib/game/furnDraw";

export function FurnIcon({ id, className }: { id: string; className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const def = furn(id);
    if (!def) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    const W = 160;
    const H = 140;
    c.width = W;
    c.height = H;
    ctx.imageSmoothingEnabled = false;
    ctx.fillStyle = "#7ec8ea";
    ctx.fillRect(0, 0, W, H);
    const spr = paintFurn(def, 0);
    if (!spr || spr.width < 4) return;
    const pad = 10;
    const scale = Math.min((W - pad * 2) / spr.width, (H - pad * 2) / spr.height);
    const dw = Math.max(8, Math.round(spr.width * scale));
    const dh = Math.max(8, Math.round(spr.height * scale));
    ctx.drawImage(spr, Math.round((W - dw) / 2), Math.round((H - dh) / 2), dw, dh);
  }, [id]);

  return (
    <canvas
      ref={ref}
      width={160}
      height={140}
      className={className}
      style={{ imageRendering: "pixelated" }}
      aria-hidden
    />
  );
}
