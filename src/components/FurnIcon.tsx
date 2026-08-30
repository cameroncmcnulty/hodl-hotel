"use client";

import { useEffect, useRef } from "react";
import { loadSprite } from "@/lib/game/sprites";

export function FurnIcon({ id, className }: { id: string; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = ref.current;
    if (!host) return;
    let dead = false;
    const canvas = document.createElement("canvas");
    canvas.width = 160;
    canvas.height = 140;
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.style.imageRendering = "pixelated";
    host.replaceChildren(canvas);
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#7ec8ea";
    ctx.fillRect(0, 0, 160, 140);
    loadSprite(id).then((spr) => {
      if (dead || !spr) return;
      ctx.imageSmoothingEnabled = false;
      ctx.fillStyle = "#7ec8ea";
      ctx.fillRect(0, 0, 160, 140);
      const s = Math.min(148 / Math.max(1, spr.width), 128 / Math.max(1, spr.height));
      const dw = Math.max(8, spr.width * s);
      const dh = Math.max(8, spr.height * s);
      ctx.drawImage(spr, (160 - dw) / 2, (140 - dh) / 2, dw, dh);
    });
    return () => {
      dead = true;
    };
  }, [id]);

  return <div ref={ref} className={className} style={{ width: 160, height: 140, imageRendering: "pixelated" }} aria-hidden />;
}
