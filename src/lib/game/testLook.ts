/** Artist body PNG for in-room size tests. Stand pose only. */
import { keyAndTrim } from "./sprites";

let canvas: HTMLCanvasElement | null = null;
let pack: Promise<void> | null = null;

function loadImage(src: string) {
  return new Promise<HTMLImageElement | null>((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

export function loadTestBody() {
  if (typeof Image === "undefined") return Promise.resolve();
  if (pack) return pack;
  pack = (async () => {
    const img = await loadImage("/art/avatars/test-body.png?v=1");
    if (!img) return;
    canvas = keyAndTrim(img);
  })();
  return pack;
}

export function getTestBody() {
  return canvas;
}
