/** Artist body PNG for in-room size tests. Stand pose only. */
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
    const img = await loadImage("/art/avatars/test-body.png?v=3");
    if (!img) return;
    const c = document.createElement("canvas");
    c.width = img.width;
    c.height = img.height;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(img, 0, 0);
    canvas = c;
  })();
  return pack;
}

export function getTestBody() {
  return canvas;
}
