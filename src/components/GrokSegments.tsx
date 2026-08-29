"use client";

import { allHelp, helpTitle } from "@/lib/grokHelp";
import type { AgentJob, AgentSegment } from "@/lib/types";
import { Eye, Rocket, Trash2 } from "lucide-react";

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
  const running = seg.status === "running";
  return (
    <div
      className={`rounded-2xl border px-3 py-2.5 ${
        active ? "border-mint bg-mint text-ink ring-2 ring-mint" : seg.patches.length ? "border-mint/40 bg-mint/10" : "border-white/10 bg-black/25"
      }`}
    >
      <button type="button" className="block w-full text-left" onClick={onPreview}>
        <p className={`${compact ? "text-xs" : "text-sm"} font-medium leading-snug ${active ? "text-ink" : "text-white/90"}`}>{helpTitle(seg.prompt)}</p>
        <p className={`mt-0.5 text-[11px] ${active ? "text-ink/70" : "text-white/45"}`}>
          {running
            ? "Grok is working…"
            : `${seg.patches.length} file${seg.patches.length === 1 ? "" : "s"} · ${shipped ? "pushed" : seg.patches.length ? "ready to preview" : "chat"}`}
          {seg.shipSha ? ` · ${seg.shipSha.slice(0, 8)}` : ""}
        </p>
      </button>
      <div className="mt-2 flex flex-wrap gap-1">
        <button type="button" className={`${btn} ${active ? "bg-ink text-mint" : "bg-white/10 hover:bg-white/15"}`} onClick={onPreview}>
          <Eye size={12} /> Preview
        </button>
        <button type="button" className={`${btn} bg-mint/20 text-mint hover:bg-mint/30`} disabled={!!busy || shipped || running || !seg.patches.length} onClick={onPush}>
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
  onOpenChat,
  onPreview,
  onPush,
  onDeleteHelp,
  onDeleteChat,
}: {
  jobs: AgentJob[];
  currentJobId?: string;
  selectedId: string;
  busy: string;
  onOpenChat: (job: AgentJob) => void;
  onPreview: (job: AgentJob, seg: AgentSegment) => void;
  onPush: (job: AgentJob, seg: AgentSegment) => void;
  onDeleteHelp: (job: AgentJob, seg: AgentSegment) => void;
  onDeleteChat: (job: AgentJob) => void;
}) {
  const help = allHelp(jobs);

  return (
    <aside className="panel flex min-h-[280px] flex-col overflow-hidden xl:h-[calc(100vh-8.5rem)]">
      <div className="border-b border-white/10 px-4 py-3">
        <p className="text-sm font-semibold">Prompts</p>
        <p className="text-[11px] text-white/40">Green bubble is the one you are managing. Preview the design, then Push.</p>
      </div>
      <div className="min-h-0 flex-1 space-y-2 overflow-auto p-3">
        {help.length === 0 && <p className="px-1 text-xs text-white/40">Send a prompt — it lands here so you can preview, push, or delete it.</p>}
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
    </aside>
  );
}
