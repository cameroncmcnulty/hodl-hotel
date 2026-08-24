"use client";

import { useEffect, useRef } from "react";

export function KeyedImage({ src, alt, className }: { src: string; alt: string; className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const img = new Image();
    img.src = src;
    img.onload = () => {
      const c = ref.current;
      if (!c) return;
      c.width = img.width;
      c.height = img.height;
      const ctx = c.getContext("2d");
      if (!ctx) return;
      ctx.drawImage(img, 0, 0);
      const data = ctx.getImageData(0, 0, c.width, c.height);
      const d = data.data;
      for (let i = 0; i < d.length; i += 4) {
        const r = d[i],
          g = d[i + 1],
          b = d[i + 2];
        if (g > 150 && g > r + 40 && g > b + 40) d[i + 3] = 0;
      }
      ctx.putImageData(data, 0, 0);
    };
  }, [src]);

  return <canvas ref={ref} className={className} role="img" aria-label={alt} />;
}
