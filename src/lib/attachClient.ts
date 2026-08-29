import type { AgentAttachment } from "./types";

export const MAX_ATTACH = 4;
export const MAX_BYTES = 3_200_000;

const TEXT_EXT = /\.(ts|tsx|js|jsx|mjs|cjs|json|md|txt|css|svg|html|csv|yml|yaml|toml|xml|env|example|map)$/i;

export function kindOf(file: File): AgentAttachment["kind"] {
  if (file.type.startsWith("image/")) return "image";
  if (file.type.startsWith("video/")) return "video";
  return "file";
}

function dataSize(dataUrl: string) {
  const i = dataUrl.indexOf(",");
  const b64 = i >= 0 ? dataUrl.slice(i + 1) : dataUrl;
  return Math.ceil((b64.length * 3) / 4);
}

async function encodeImage(file: File) {
  const bmp = await createImageBitmap(file);
  const max = 1600;
  const scale = Math.min(1, max / Math.max(bmp.width, bmp.height));
  const w = Math.max(1, Math.round(bmp.width * scale));
  const h = Math.max(1, Math.round(bmp.height * scale));
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d");
  if (!ctx) throw new Error("Could not read image");
  ctx.drawImage(bmp, 0, 0, w, h);
  const keepPng = file.type === "image/png" || file.type === "image/webp" || file.type === "image/gif";
  let out = c.toDataURL(keepPng ? "image/png" : "image/jpeg", 0.86);
  if (dataSize(out) > MAX_BYTES) out = c.toDataURL("image/jpeg", 0.72);
  return out;
}

async function videoStill(file: File) {
  const url = URL.createObjectURL(file);
  try {
    const v = document.createElement("video");
    v.muted = true;
    v.playsInline = true;
    v.preload = "auto";
    v.src = url;
    await new Promise<void>((resolve, reject) => {
      v.onloadeddata = () => resolve();
      v.onerror = () => reject(new Error("Could not read video"));
    });
    v.currentTime = Math.min(0.3, Number.isFinite(v.duration) ? v.duration * 0.05 : 0.2);
    await new Promise<void>((resolve) => {
      v.onseeked = () => resolve();
      setTimeout(resolve, 800);
    });
    const c = document.createElement("canvas");
    c.width = Math.max(1, v.videoWidth || 640);
    c.height = Math.max(1, v.videoHeight || 360);
    c.getContext("2d")?.drawImage(v, 0, 0, c.width, c.height);
    const dataUrl = c.toDataURL("image/jpeg", 0.82);
    const secs = Number.isFinite(v.duration) ? v.duration : 0;
    return { dataUrl, note: `Video still (${secs ? `${secs.toFixed(1)}s` : "clip"}). Grok can see this frame, not the full video.` };
  } finally {
    URL.revokeObjectURL(url);
  }
}

export async function fileToAttachment(file: File): Promise<AgentAttachment> {
  const kind = kindOf(file);
  if (kind === "image") {
    const dataUrl = await encodeImage(file);
    return { name: file.name, mime: file.type || "image/png", kind, size: file.size, dataUrl };
  }
  if (kind === "video") {
    const still = await videoStill(file);
    return { name: file.name, mime: file.type || "video/mp4", kind, size: file.size, dataUrl: still.dataUrl, note: still.note };
  }
  if (TEXT_EXT.test(file.name) || file.type.startsWith("text/") || file.type === "application/json") {
    const text = (await file.text()).slice(0, 80_000);
    return { name: file.name, mime: file.type || "text/plain", kind: "file", size: file.size, text };
  }
  return {
    name: file.name,
    mime: file.type || "application/octet-stream",
    kind: "file",
    size: file.size,
    note: "Binary file attached by name only. Paste text or attach a screenshot if Grok should see contents.",
  };
}

export async function filesToAttachments(files: File[], already = 0): Promise<{ items: AgentAttachment[]; error?: string }> {
  const room = Math.max(0, MAX_ATTACH - already);
  if (!room) return { items: [], error: `Up to ${MAX_ATTACH} attachments` };
  const take = files.slice(0, room);
  const items: AgentAttachment[] = [];
  for (const f of take) {
    if (f.size > 40_000_000) return { items, error: `${f.name} is too large` };
    items.push(await fileToAttachment(f));
  }
  const bytes = items.reduce((n, a) => n + (a.dataUrl ? dataSize(a.dataUrl) : a.text?.length || 0), 0);
  if (bytes > MAX_BYTES) return { items: [], error: "Attachments are too large together. Use a smaller image or file." };
  return { items, error: files.length > room ? `Added ${room}; max is ${MAX_ATTACH}` : undefined };
}

export function clipboardFiles(data: DataTransfer | null | undefined): File[] {
  if (!data) return [];
  if (data.files?.length) return Array.from(data.files);
  return Array.from(data.items || [])
    .filter((i) => i.kind === "file")
    .map((i) => i.getAsFile())
    .filter((f): f is File => !!f);
}
