"use client";

import { allHelp, helpTitle } from "@/lib/grokHelp";
import type { AgentJob, AgentSegment } from "@/lib/types";
import { Copy, Eye, Rocket, Trash2 } from "lucide-react";

const btn = "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium disabled:opacity-40";

export function HelpBubble({
  seg,
  active,
  busy,
  compact,
  onPreview,
  onPush,
  onDelete,
}: {
  seg: AgentSegment;
  active?: boolean;
  busy?: string;
  compact?: boolean;
  onPreview: () => void;
  onPush: () => void;
  onDelete: () => void;
}) {
  const shipped = seg.status === "shipped";
  return (
    <div className={`rounded-2xl border px-3 py-2.5 ${active ? "border-mint/60 bg-mint/10" : "border-white/10 bg-black/25"}`}>
      <p className={`${compact ? "text-xs" : "text-sm"} font-medium leading-snug text-white/90`}>{helpTitle(seg.prompt)}</p>
      <p className="mt-0.5 text-[11px] text-white/45">
        {seg.patches.length} file{seg.patches.length === 1 ? "" : "s"} · {shipped ? "pushed" : "ready"}
        {seg.shipSha ? ` · ${seg.shipSha.slice(0, 8)}` : ""}
      </p>
      <div className="mt-2 flex flex-wrap gap-1">
        <button type="button" className={`${btn} bg-white/10 hover:bg-white/15`} onClick={onPreview}>
          <Eye size={12} /> Preview
        </button>
        <button type="button" className={`${btn} bg-mint/20 text-mint hover:bg-mint/30`} disabled={!!busy || shipped || !seg.patches.length} onClick={onPush}>
          <Rocket size={12} /> {busy === "ship" ? "Pushing…" : "Push"}
        </button>
        <button type="button" className={`${btn} bg-coral/15 text-coral hover:bg-coral/25`} disabled={!!busy} onClick={onDelete}>
          <Trash2 size={12} /> Delete
        </button>
      </div>
    </div>
  );
}

export function GrokHelpPane({
  jobs,
  currentJobId,
  selectedId,
  busy,
  file,
  current,
  showPreview,
  onOpenChat,
  onPreview,
  onPush,
  onDeleteHelp,
  onDeleteChat,
  onFile,
}: {
  jobs: AgentJob[];
  currentJobId?: string;
  selectedId: string;
  busy: string;
  file: string;
  current: string;
  showPreview: boolean;
  onOpenChat: (job: AgentJob) => void;
  onPreview: (job: AgentJob, seg: AgentSegment) => void;
  onPush: (job: AgentJob, seg: AgentSegment) => void;
  onDeleteHelp: (job: AgentJob, seg: AgentSegment) => void;
  onDeleteChat: (job: AgentJob) => void;
  onFile: (path: string) => void;
}) {
  const help = allHelp(jobs);
  const active = help.find((h) => h.seg.id === selectedId);
  const patches = active?.seg.patches || [];
  const proposed = patches.find((p) => p.path === file) || patches[0];

  return (
    <aside className="panel flex min-h-[280px] flex-col overflow-hidden xl:h-[calc(100vh-8.5rem)]">
      <div className="border-b border-white/10 px-4 py-3">
        <p className="text-sm font-semibold">Grok help</p>
        <p className="text-[11px] text-white/40">Each fix or build is a bubble. Preview, push live, or delete it.</p>
      </div>
      <div className="min-h-0 flex-1 space-y-2 overflow-auto p-3">
        {help.length === 0 && <p className="px-1 text-xs text-white/40">When Grok proposes a fix or build, it shows up here.</p>}
        {help.map(({ job, seg }) => (
          <HelpBubble
            key={seg.id}
            seg={seg}
            active={selectedId === seg.id}
            busy={busy}
            onPreview={() => onPreview(job, seg)}
            onPush={() => onPush(job, seg)}
            onDelete={() => onDeleteHelp(job, seg)}
          />
        ))}
        <p className="pt-2 text-[11px] font-semibold uppercase tracking-wide text-white/35">Chats</p>
        {jobs.map((j) => (
          <div key={j.id} className={`flex items-center gap-1 rounded-xl px-2 py-1.5 ${currentJobId === j.id ? "bg-white/10" : "hover:bg-white/5"}`}>
            <button type="button" className="min-w-0 flex-1 truncate text-left text-xs" onClick={() => onOpenChat(j)}>
              <span className="text-mint">{j.status}</span> · {helpTitle(j.prompt)}
            </button>
            <button type="button" className="shrink-0 rounded-full p-1 text-white/35 hover:bg-coral/20 hover:text-coral" aria-label="Delete chat" onClick={() => onDeleteChat(j)}>
              <Trash2 size={12} />
            </button>
          </div>
        ))}
        {!jobs.length && <p className="text-xs text-white/40">No chats yet.</p>}
      </div>
      {showPreview && patches.length > 0 && (
        <div className="grid max-h-[45%] min-h-[160px] gap-2 border-t border-white/10 p-3">
          <div className="flex flex-wrap gap-1">
            {patches.map((p) => (
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
          <div className="flex justify-end gap-1">
            <button
              type="button"
              className={`${btn} bg-white/10`}
              onClick={() => navigator.clipboard.writeText(current || "")}
              disabled={!current}
            >
              <Copy size={11} /> Copy current
            </button>
            <button
              type="button"
              className={`${btn} bg-white/10`}
              onClick={() => navigator.clipboard.writeText(proposed?.content || "")}
              disabled={!proposed?.content}
            >
              <Copy size={11} /> Copy proposed
            </button>
          </div>
          <pre className="max-h-20 overflow-auto rounded-xl bg-black/40 p-2 font-mono text-[10px] text-white/40">{current || "Current file"}</pre>
          <pre className="min-h-0 flex-1 overflow-auto rounded-xl bg-black/40 p-2 font-mono text-[10px] text-mint/90">{proposed?.content || ""}</pre>
        </div>
      )}
    </aside>
  );
}
