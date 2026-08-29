"use client";

import { CharacterPreview } from "@/components/CharacterPreview";
import { LayoutPreview } from "@/components/LayoutPreview";
import { liveRoute } from "@/lib/grokHelp";
import { DEFAULT_FIGURE } from "@/lib/game/avatar";
import type { AgentPatch, AgentSegment } from "@/lib/types";
import { Copy, Eye, Rocket, X } from "lucide-react";
import { useMemo, useState } from "react";

const btn = "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium disabled:opacity-40";

function hexes(content: string) {
  return Array.from(content.matchAll(/#(?:[0-9a-fA-F]{3,8})\b/g), (m) => m[0]).filter((v, i, a) => a.indexOf(v) === i).slice(0, 20);
}

function layoutHits(content: string) {
  return ["grand_lobby", "roof_pool", "shill_club", "cook_lab", "pixel_arcade"].filter((id) => content.includes(id));
}

function kindOf(paths: string[], hasImages: boolean) {
  const blob = paths.join(" ");
  if (hasImages) return "design";
  if (/\.css$/.test(blob)) return "css";
  if (/layouts\.ts|catalog\.ts/.test(blob)) return "room";
  if (/avatar\.ts|CharacterPreview/.test(blob)) return "avatar";
  if (/GameClient|draw\.ts|play\/|sprites\.ts/.test(blob)) return "game";
  if (/Landing|HotelBackdrop|src\/app\/page\.tsx/.test(blob)) return "landing";
  return "files";
}

function CssFrame({ css, label }: { css: string; label: string }) {
  const kit = css.replace(/@tailwind[^;]*;/g, "").replace(/@apply[^;]+;/g, "");
  const html = `<!doctype html><html><head><meta charset="utf-8"><style>
    body{margin:0;padding:16px;font-family:ui-sans-serif,system-ui;background:#120e1c;color:#f6f1ff}
    .panel{border-radius:16px;border:1px solid rgba(255,255,255,.1);background:rgba(18,18,28,.8);padding:16px;margin-bottom:12px}
    .btn{display:inline-flex;padding:8px 14px;border-radius:12px;font-weight:700;border:0}
    .btn-sol{background:linear-gradient(90deg,#9945FF,#14F195);color:#12121c}
    .mint{color:#14F195}
    ${kit}
  </style></head><body>
    <p class="mint" style="font-size:11px;letter-spacing:.16em;text-transform:uppercase">${label}</p>
    <h1 style="font-size:28px;margin:8px 0 12px">HODL Hotel</h1>
    <div class="panel"><p>Sample panel</p><button class="btn btn-sol">Mint button</button></div>
    <div class="panel" style="max-width:240px"><p style="font-size:13px">Chat bubble · sit · dance</p></div>
  </body></html>`;
  return <iframe title={label} className="h-56 w-full rounded-xl border border-white/10 bg-black" sandbox="allow-same-origin" srcDoc={html} />;
}

function DesignView({ seg, current, file }: { seg: AgentSegment; current: string; file: string }) {
  const paths = seg.patches.map((p) => p.path);
  const proposed = seg.patches.find((p) => p.path === file) || seg.patches[0];
  const route = liveRoute(paths);
  const kind = kindOf(paths, !!seg.attachments?.some((a) => a.dataUrl));
  const rooms = layoutHits(seg.patches.map((p) => p.content).join("\n"));
  const colors = hexes(proposed?.content || "");
  const cssPatch = seg.patches.find((p) => p.path.endsWith(".css"));

  return (
    <div className="space-y-3">
      <div className="grid gap-2 sm:grid-cols-2">
        <div>
          <p className="mb-1 text-[11px] uppercase tracking-wide text-white/40">Live now</p>
          <iframe title="Live hotel" src={route} className="h-56 w-full rounded-xl border border-white/10 bg-black" />
          <p className="mt-1 text-[10px] text-white/35">{route} on this site, before you push</p>
        </div>
        <div>
          <p className="mb-1 text-[11px] uppercase tracking-wide text-white/40">This update</p>
          {kind === "css" && cssPatch ? (
            <CssFrame css={cssPatch.content} label="Proposed styles" />
          ) : kind === "avatar" ? (
            <div className="grid h-56 place-items-center rounded-xl border border-white/10 bg-black/40">
              <CharacterPreview figure={DEFAULT_FIGURE} size={200} />
            </div>
          ) : kind === "room" && rooms[0] ? (
            <LayoutPreview layoutId={rooms[0]} />
          ) : seg.attachments?.some((a) => a.dataUrl) ? (
            <div className="flex h-56 flex-wrap gap-2 overflow-auto rounded-xl border border-white/10 bg-black/40 p-2">
              {seg.attachments.filter((a) => a.dataUrl).map((a) => (
                <img key={a.name} src={a.dataUrl} alt={a.name} className="max-h-52 rounded-lg object-contain" />
              ))}
            </div>
          ) : (
            <div className="h-56 overflow-auto rounded-xl border border-mint/30 bg-mint/5 p-3">
              <p className="text-xs text-mint">Proposed {proposed?.path || "files"}</p>
              {!!colors.length && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {colors.map((c) => (
                    <span key={c} className="h-7 w-7 rounded-md border border-white/20" style={{ background: c }} title={c} />
                  ))}
                </div>
              )}
              <pre className="mt-2 whitespace-pre-wrap font-mono text-[10px] text-mint/80">{(proposed?.content || "").slice(0, 900)}</pre>
            </div>
          )}
        </div>
      </div>
      {kind === "room" && rooms.length > 1 && (
        <div className="grid gap-2 sm:grid-cols-2">
          {rooms.slice(1, 3).map((id) => (
            <LayoutPreview key={id} layoutId={id} />
          ))}
        </div>
      )}
      {!!current && kind === "css" && (
        <div>
          <p className="mb-1 text-[11px] uppercase tracking-wide text-white/40">Live styles</p>
          <CssFrame css={current} label="Current CSS" />
        </div>
      )}
    </div>
  );
}

export function GrokPreview({
  seg,
  file,
  current,
  busy,
  onFile,
  onPush,
  onClose,
}: {
  seg: AgentSegment;
  file: string;
  current: string;
  busy: string;
  onFile: (path: string) => void;
  onPush: () => void;
  onClose: () => void;
}) {
  const paths = seg.patches.map((p) => p.path);
  const start = kindOf(paths, !!seg.attachments?.some((a) => a.dataUrl)) === "files" && seg.patches.length ? "files" : "design";
  const [tab, setTab] = useState<"design" | "files">(start);
  const proposed = useMemo(() => seg.patches.find((p) => p.path === file) || seg.patches[0], [seg, file]);
  const shipped = seg.status === "shipped";

  return (
    <section className="panel flex min-h-[420px] flex-col overflow-hidden xl:h-[calc(100vh-8.5rem)]">
      <div className="flex items-center justify-between gap-2 border-b border-white/10 px-4 py-3">
        <div>
          <p className="flex items-center gap-1.5 text-sm font-semibold">
            <Eye size={15} className="text-mint" /> Preview
          </p>
          <p className="max-w-[20rem] truncate text-[11px] text-white/40">{seg.prompt}</p>
        </div>
        <div className="flex items-center gap-1">
          <button type="button" className={`${btn} ${tab === "design" ? "bg-mint text-ink" : "bg-white/10"}`} onClick={() => setTab("design")}>
            Design
          </button>
          <button type="button" className={`${btn} ${tab === "files" ? "bg-mint text-ink" : "bg-white/10"}`} onClick={() => setTab("files")}>
            Files
          </button>
          <button type="button" className={`${btn} bg-mint/20 text-mint`} disabled={!!busy || shipped || !seg.patches.length} onClick={onPush}>
            <Rocket size={12} /> Push
          </button>
          <button type="button" className="rounded-full p-1 text-white/40 hover:bg-white/10" aria-label="Close preview" onClick={onClose}>
            <X size={14} />
          </button>
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-auto p-3">
        {tab === "design" ? (
          <DesignView seg={seg} current={current} file={file} />
        ) : (
          <div className="grid min-h-full gap-2">
            <div className="flex flex-wrap gap-1">
              {seg.patches.map((p: AgentPatch) => (
                <button
                  key={p.path}
                  type="button"
                  className={`rounded-full px-2.5 py-1 text-[11px] ${file === p.path || proposed?.path === p.path ? "bg-mint text-ink" : "bg-white/10"}`}
                  onClick={() => onFile(p.path)}
                >
                  {p.path.split("/").slice(-2).join("/")}
                </button>
              ))}
            </div>
            {!seg.patches.length && <p className="text-xs text-white/45">No file changes on this prompt yet.</p>}
            <div className="flex justify-end gap-1">
              <button type="button" className={`${btn} bg-white/10`} disabled={!current} onClick={() => navigator.clipboard.writeText(current || "")}>
                <Copy size={11} /> Copy current
              </button>
              <button type="button" className={`${btn} bg-white/10`} disabled={!proposed?.content} onClick={() => navigator.clipboard.writeText(proposed?.content || "")}>
                <Copy size={11} /> Copy proposed
              </button>
            </div>
            <div className="grid min-h-[240px] gap-2 xl:grid-cols-2">
              <div>
                <p className="mb-1 text-[11px] uppercase text-white/40">Now</p>
                <pre className="max-h-[50vh] overflow-auto rounded-xl bg-black/40 p-3 font-mono text-[10px] text-white/45">{current || "Current file"}</pre>
              </div>
              <div>
                <p className="mb-1 text-[11px] uppercase text-mint/70">Proposed</p>
                <pre className="max-h-[50vh] overflow-auto rounded-xl bg-mint/5 p-3 font-mono text-[10px] text-mint/90">{proposed?.content || "No proposed file"}</pre>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
