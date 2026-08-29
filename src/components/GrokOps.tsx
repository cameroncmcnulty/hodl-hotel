"use client";

import { GrokComposer } from "@/components/GrokComposer";
import { api } from "@/lib/clientAuth";
import type { AgentAttachment, AgentJob } from "@/lib/types";
import { Bot, Plus, Rocket } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

const CHECK = "Check hodlhotel.app right now (health, home, play, join). If something is down or broken, inspect the repo, patch the smallest fix, and push it to production.";

export function GrokOps({
  grok,
  github,
}: {
  grok?: { ready: boolean; model: string };
  github?: { ready: boolean; repo: string; branch: string };
}) {
  const [job, setJob] = useState<AgentJob | null>(null);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const threadRef = useRef<HTMLDivElement>(null);
  const boxRef = useRef<HTMLTextAreaElement>(null);
  const jobRef = useRef<AgentJob | null>(null);
  jobRef.current = job;

  const messages = useMemo(() => job?.messages || [], [job]);

  useEffect(() => {
    boxRef.current?.focus();
  }, []);

  useEffect(() => {
    threadRef.current?.scrollTo({ top: threadRef.current.scrollHeight, behavior: "smooth" });
  }, [job?.messages, busy]);

  async function send(text: string, attachments: AgentAttachment[] = []) {
    const prompt = text.trim() || (attachments.length ? "See the attached bug report." : "");
    if (!prompt || busy) return;
    setDraft("");
    setBusy(true);
    setErr("");
    const userMsg = { role: "user" as const, content: prompt, at: new Date().toISOString(), attachments };
    setJob((cur) =>
      cur
        ? { ...cur, messages: [...(cur.messages || []), userMsg], status: "running" }
        : {
            id: "pending",
            prompt,
            mode: "chat",
            status: "running",
            plan: "",
            reply: "",
            patches: [],
            messages: [userMsg],
            log: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }
    );
    const { res, j } = await api("/api/admin/agent", {
      method: "POST",
      body: JSON.stringify({
        op: "chat",
        prompt,
        attachments,
        jobId: jobRef.current && jobRef.current.id !== "pending" ? jobRef.current.id : undefined,
      }),
    });
    setBusy(false);
    if (!res.ok) {
      setErr(j.error || "Grok failed");
      if (j.job) setJob(j.job);
      return;
    }
    setJob(j.job);
    boxRef.current?.focus();
  }

  return (
    <section className="panel mx-auto flex h-[calc(100vh-8.5rem)] min-h-[480px] max-w-3xl flex-col overflow-hidden">
      <div className="flex items-center justify-between gap-2 border-b border-white/10 px-4 py-3">
        <div>
          <p className="flex items-center gap-2 text-sm font-semibold">
            <Bot size={16} className="text-mint" /> Grok
          </p>
          <p className="text-[11px] text-white/40">
            {grok?.ready ? grok.model : "Needs XAI_API_KEY"} · {github?.ready ? `pushes ${github.repo}` : "Needs GITHUB_TOKEN to push"}
          </p>
        </div>
        <button
          type="button"
          className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-1 text-[11px] hover:bg-white/15"
          onClick={() => {
            setJob(null);
            setErr("");
            boxRef.current?.focus();
          }}
        >
          <Plus size={12} /> New
        </button>
      </div>
      <div ref={threadRef} className="min-h-0 flex-1 space-y-3 overflow-auto px-4 py-4">
        {!messages.length && (
          <div className="mx-auto max-w-md pt-10 text-center">
            <p className="text-sm text-white/70">Tell Grok what’s broken. He checks the live hotel, patches the repo, and pushes the fix to production himself.</p>
            <div className="mt-4 flex flex-wrap justify-center gap-1.5">
              <button type="button" className="rounded-full bg-mint px-3 py-1.5 text-[12px] font-semibold text-ink" onClick={() => send(CHECK)}>
                Check the live hotel
              </button>
              <button type="button" className="rounded-full bg-white/10 px-3 py-1.5 text-[12px]" onClick={() => send("Players cannot join or log in. Find the bug and push a fix.")}>
                Join/login broken
              </button>
              <button type="button" className="rounded-full bg-white/10 px-3 py-1.5 text-[12px]" onClick={() => send("Play is crashing or rooms are empty/broken. Inspect GameClient, world, and seed, then push a fix.")}>
                Play is broken
              </button>
            </div>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={`${m.at}-${i}`} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                m.role === "user" ? "bg-mint text-ink" : "bg-white/10 text-white/90"
              }`}
            >
              {!!m.attachments?.length && (
                <div className="mb-2 flex flex-wrap gap-1.5">
                  {m.attachments.map((a, ai) =>
                    a.dataUrl ? (
                      <img key={`${a.name}-${ai}`} src={a.dataUrl} alt={a.name} className="max-h-36 max-w-full rounded-xl" />
                    ) : (
                      <span key={`${a.name}-${ai}`} className="rounded-lg bg-black/20 px-2 py-1 text-[11px]">
                        {a.name}
                      </span>
                    )
                  )}
                </div>
              )}
              {m.content}
            </div>
          </div>
        ))}
        {busy && (
          <div className="flex justify-start">
            <div className="rounded-2xl bg-white/10 px-3.5 py-2.5 text-sm text-white/50">Checking the hotel…</div>
          </div>
        )}
        {err && <p className="text-sm text-coral">{err}</p>}
        {job?.shipSha && (
          <p className="flex items-center gap-1 text-[11px] text-mint">
            <Rocket size={12} /> Live {job.shipSha.slice(0, 8)}
          </p>
        )}
      </div>
      <GrokComposer draft={draft} setDraft={setDraft} busy={busy} onSend={send} boxRef={boxRef} />
    </section>
  );
}
