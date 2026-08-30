"use client";

import { useEffect, useRef } from "react";
import { loadSprite } from "@/lib/game/sprites";

export function FurnIcon({ id, className }: { id: string; className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    let dead = false;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#7ec8ea";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    loadSprite(id).then((spr) => {
      if (dead || !spr) return;
      ctx.imageSmoothingEnabled = false;
      ctx.fillStyle = "#7ec8ea";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      const pad = 10;
      const s = Math.min((canvas.width - pad * 2) / Math.max(1, spr.width), (canvas.height - pad * 2) / Math.max(1, spr.height));
      const dw = Math.max(8, Math.round(spr.width * s));
      const dh = Math.max(8, Math.round(spr.height * s));
      ctx.drawImage(spr, Math.round((canvas.width - dw) / 2), Math.round((canvas.height - dh) / 2), dw, dh);
    });
    return () => {
      dead = true;
    };
  }, [id]);

  return (
    <canvas
      ref={ref}
      width={320}
      height={280}
      className={className}
      style={{ width: "100%", height: "100%", objectFit: "contain", imageRendering: "pixelated", display: "block" }}
      aria-hidden
    />
  );
}
