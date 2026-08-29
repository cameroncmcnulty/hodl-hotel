"use client";

import { GrokHelpPane, HelpBubble } from "@/components/GrokSegments";
import { Logo } from "@/components/Logo";
import { api, clearClientToken } from "@/lib/clientAuth";
import { HOTEL_BRIEF } from "@/lib/grokBrief";
import type { AgentJob, AgentSegment } from "@/lib/types";
import {
  Activity,
  Bot,
  ClipboardList,
  Coins,
  Flag,
  LogOut,
  Megaphone,
  Plus,
  Send,
  Settings,
  Sparkles,
  Trash2,
  Users,
  Waypoints,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

const TABS = [
  { id: "grok", label: "Grok", Icon: Bot },
  { id: "overview", label: "Overview", Icon: Activity },
  { id: "users", label: "Players", Icon: Users },
  { id: "rooms", label: "Rooms", Icon: Waypoints },
  { id: "economy", label: "Economy", Icon: Coins },
  { id: "reports", label: "Reports", Icon: Flag },
  { id: "ads", label: "Ads", Icon: Megaphone },
  { id: "events", label: "Events", Icon: Sparkles },
  { id: "settings", label: "Settings", Icon: Settings },
  { id: "logs", label: "Logs", Icon: ClipboardList },
] as const;

const STARTERS = [
  { title: "Fix a bug", prompt: "Find and fix this bug in HODL Hotel:\n" },
  { title: "New furniture", prompt: "Add a unique hotel-only furniture piece (not in the shop) for a public room. Include catalog entry, sprite path, and seed placement if it belongs in a hotel room." },
  { title: "Public room polish", prompt: "Inspect the public hotel rooms and propose a polish pass that keeps unique not-for-sale furniture and does not use shop catalog clones." },
  { title: "Avatar layers", prompt: "Inspect the avatar compositor and layers. Make sure hair/shirt/pants/shoes never overlay leftover options." },
  { title: "Patch notes", prompt: "Write a short in-game staff note for players about the latest hotel changes. Do not invent features that are not in the code." },
];

type Desk = {
  stats: Record<string, number>;
  users: { id: string; username: string; email: string; coins: number; role: string; bannedUntil?: string }[];
  rooms: { id: string; name: string; ownerId: string | null; users: number; visibility: string }[];
  ads: { id: string; slotId: string; status: string; end: string }[];
  reports: { id: string; status: string; reason: string; at: string }[];
  receipts: { id: string; at: string; packId: string; coins: number; sig: string }[];
  events: { id: string; title: string; roomId: string }[];
  logs: { id: string; at: string; kind: string; text: string }[];
  settings: { treasuryWallet: string; chatEnabled: boolean; signupEnabled: boolean; maintenance: boolean; starterCoins: number };
  agentJobs?: AgentJob[];
  grok?: { ready: boolean; model: string };
  github?: { ready: boolean; repo: string; branch: string };
  files?: { local: boolean; github: boolean; repo: string; branch: string };
  me?: { username: string; email: string };
};

export function AdminCommand() {
  const r = useRouter();
  const [data, setData] = useState<Desk | null>(null);
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("grok");
  const [err, setErr] = useState("");
  const [draft, setDraft] = useState("");
  const [job, setJob] = useState<AgentJob | null>(null);
  const [busy, setBusy] = useState("");
  const [file, setFile] = useState("");
  const [current, setCurrent] = useState("");
  const [agentErr, setAgentErr] = useState("");
  const [showFiles, setShowFiles] = useState(true);
  const [showChats, setShowChats] = useState(false);
  const [copied, setCopied] = useState(false);
  const [selected, setSelected] = useState("");
  const threadRef = useRef<HTMLDivElement>(null);
  const boxRef = useRef<HTMLTextAreaElement>(null);

  function growBox() {
    const el = boxRef.current;
    if (!el) return;
    el.style.height = "0px";
    el.style.height = `${Math.min(160, Math.max(44, el.scrollHeight))}px`;
  }

  async function load() {
    const { res, j } = await api("/api/admin");
    if (!res.ok) setErr(j.error || "Denied");
    else {
      setData(j);
      if (job && job.id !== "pending") {
        const fresh = (j.agentJobs || []).find((x: AgentJob) => x.id === job.id);
        if (fresh) setJob(fresh);
      } else if (!job && j.agentJobs?.[0]) setJob(j.agentJobs[0]);
    }
  }
  useEffect(() => {
    load();
    boxRef.current?.focus();
  }, []);

  useEffect(() => {
    threadRef.current?.scrollTo({ top: threadRef.current.scrollHeight, behavior: "smooth" });
  }, [job?.messages, busy]);

  useEffect(() => {
    growBox();
  }, [draft]);

  async function op(body: object) {
    await api("/api/admin", { method: "POST", body: JSON.stringify(body) });
    load();
  }

  async function send(text?: string) {
    const prompt = (text ?? draft).trim();
    if (!prompt || busy) return;
    setDraft("");
    if (boxRef.current) boxRef.current.style.height = "44px";
    setBusy("chat");
    setAgentErr("");
    const optimistic: AgentJob = job
      ? { ...job, messages: [...(job.messages || []), { role: "user", content: prompt, at: new Date().toISOString() }], status: "running" }
      : {
          id: "pending",
          prompt,
          mode: "chat",
          status: "running",
          plan: "",
          reply: "",
          patches: [],
          messages: [{ role: "user", content: prompt, at: new Date().toISOString() }],
          log: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
    setJob(optimistic);
    const { res, j } = await api("/api/admin/agent", {
      method: "POST",
      body: JSON.stringify({ op: "chat", prompt, jobId: job && job.id !== "pending" ? job.id : undefined }),
    });
    setBusy("");
    if (!res.ok) {
      setAgentErr(j.error || "Grok failed");
      if (j.job) setJob(j.job);
      return;
    }
    setJob(j.job);
    const segs = j.job?.segments as AgentSegment[] | undefined;
    const latest = segs?.[segs.length - 1];
    if (latest) {
      setSelected(latest.id);
      setFile(latest.patches[0]?.path || "");
      setShowFiles(true);
    } else if (j.job?.patches?.[0]?.path) setFile(j.job.patches[0].path);
    load();
    boxRef.current?.focus();
  }

  function openPreview(next: AgentJob, seg: AgentSegment) {
    setJob(next);
    setSelected(seg.id);
    setFile(seg.patches[0]?.path || "");
    setShowFiles(true);
    setShowChats(false);
  }

  async function ship(next?: AgentJob, seg?: AgentSegment) {
    const target = next || job;
    if (!target || target.id === "pending") return;
    setBusy("ship");
    setAgentErr("");
    const { res, j } = await api("/api/admin/ship", {
      method: "POST",
      body: JSON.stringify({ jobId: target.id, segmentId: seg?.id, message: (seg?.prompt || target.prompt).slice(0, 72) }),
    });
    setBusy("");
    if (!res.ok) return setAgentErr(j.error || "Push failed");
    setJob(j.job);
    if (seg) setSelected(seg.id);
    load();
  }

  async function deleteHelp(next: AgentJob, seg: AgentSegment) {
    setBusy("delete");
    const { res, j } = await api("/api/admin/agent", { method: "POST", body: JSON.stringify({ op: "delete-segment", jobId: next.id, segmentId: seg.id }) });
    setBusy("");
    if (!res.ok) return setAgentErr(j.error || "Delete failed");
    if (selected === seg.id) {
      setSelected("");
      setFile("");
      setCurrent("");
    }
    if (job?.id === next.id) setJob(j.job);
    load();
  }

  async function deleteChat(next: AgentJob) {
    setBusy("delete");
    const { res, j } = await api("/api/admin/agent", { method: "POST", body: JSON.stringify({ op: "delete-job", jobId: next.id }) });
    setBusy("");
    if (!res.ok) return setAgentErr(j.error || "Delete failed");
    if (job?.id === next.id) {
      setJob(null);
      setSelected("");
      setFile("");
      setCurrent("");
    }
    if (j.jobs) setData((d) => (d ? { ...d, agentJobs: j.jobs } : d));
    load();
  }

  async function deletePrompt(index: number) {
    if (!job || job.id === "pending") return;
    setBusy("delete");
    const { res, j } = await api("/api/admin/agent", { method: "POST", body: JSON.stringify({ op: "delete-message", jobId: job.id, index }) });
    setBusy("");
    if (!res.ok) return setAgentErr(j.error || "Delete failed");
    setJob(j.job);
    load();
  }

  useEffect(() => {
    if (!file || !job) return;
    let live = true;
    api("/api/admin/agent", { method: "POST", body: JSON.stringify({ op: "file", path: file }) }).then(({ j }) => {
      if (live) setCurrent(j.content || "");
    });
    return () => {
      live = false;
    };
  }, [file, job?.id]);

  const messages = useMemo(() => {
    if (job?.messages?.length) return job.messages;
    if (!job) return [];
    const out: { role: "user" | "assistant"; content: string; at: string; segmentId?: string }[] = [];
    if (job.prompt) out.push({ role: "user", content: job.prompt, at: job.createdAt });
    if (job.reply) out.push({ role: "assistant", content: job.reply, at: job.updatedAt, segmentId: job.segments?.[0]?.id });
    return out;
  }, [job]);

  async function logout() {
    await api("/api/auth/logout", { method: "POST" });
    clearClientToken();
    r.push("/admin/login");
  }

  if (err) {
    return (
      <main className="mx-auto max-w-md px-4 py-16 text-center">
        <Logo />
        <p className="mt-8 text-coral">{err}</p>
        <a className="btn-sol mt-4 inline-flex" href="/admin/login">
          Staff login
        </a>
      </main>
    );
  }
  if (!data) return <div className="p-10 text-white/50">Opening the desk…</div>;

  return (
    <div className="min-h-screen md:grid md:grid-cols-[220px_1fr]">
      <aside className="border-b border-white/10 bg-black/25 p-4 md:border-b-0 md:border-r">
        <Logo />
        <p className="mt-3 text-[11px] uppercase tracking-[0.16em] text-mint">Command center</p>
        <p className="mt-1 text-xs text-white/45">{data.me?.username || "HotelDesk"}</p>
        <nav className="mt-4 grid grid-cols-2 gap-1 md:grid-cols-1">
          {TABS.map((t) => (
            <button
              key={t.id}
              className={`flex items-center gap-2 rounded-xl px-3 py-2 text-left text-sm ${tab === t.id ? "bg-mint text-ink" : "text-white/70 hover:bg-white/10"}`}
              onClick={() => setTab(t.id)}
            >
              <t.Icon size={15} />
              {t.label}
            </button>
          ))}
        </nav>
        <div className="mt-6 hidden gap-2 md:grid">
          <a className="btn-ink text-xs" href="/play">
            Open hotel
          </a>
          <button className="btn-ink text-xs" onClick={logout}>
            <LogOut size={14} /> Sign out
          </button>
        </div>
      </aside>

      <main className="p-4 md:p-6">
        <header className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-2xl md:text-3xl">{TABS.find((t) => t.id === tab)?.label}</h1>
            <p className="text-xs text-white/45">
              {data.grok?.ready ? `Grok ready · ${data.grok.model}` : "Set XAI_API_KEY to unlock Grok"}
              {" · "}
              {data.github?.ready ? `Ship → ${data.github.repo}` : "Set GITHUB_TOKEN to push production"}
              {" · "}
              {data.files?.local ? "files on disk" : data.files?.github ? `files via GitHub ${data.files.branch}` : "no file access"}
            </p>
          </div>
          <div className="flex gap-2 text-xs">
            <span className="rounded-full bg-white/10 px-3 py-1">{data.stats.online} online</span>
            <span className="rounded-full bg-white/10 px-3 py-1">{data.stats.users} guests</span>
            <span className={`rounded-full px-3 py-1 ${data.settings.maintenance ? "bg-coral/20 text-coral" : "bg-mint/15 text-mint"}`}>
              {data.settings.maintenance ? "maintenance" : "live"}
            </span>
          </div>
        </header>

        {tab === "grok" && (
          <div className="grid gap-4 xl:grid-cols-[minmax(0,1.15fr)_minmax(300px,0.9fr)]">
            <section className="panel flex h-[70vh] min-h-[420px] flex-col overflow-hidden xl:h-[calc(100vh-8.5rem)]">
              <div className="relative flex items-center justify-between gap-2 border-b border-white/10 px-4 py-3">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <Bot size={16} className="text-mint" /> Grok
                </div>
                <div className="flex items-center gap-1">
                  <button
                    className="rounded-full bg-white/10 px-2.5 py-1 text-[11px] hover:bg-white/15 xl:hidden"
                    onClick={() => setShowChats((v) => !v)}
                  >
                    Chats
                  </button>
                  <button
                    className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-1 text-[11px] hover:bg-white/15"
                    onClick={() => {
                      setJob(null);
                      setFile("");
                      setCurrent("");
                      setSelected("");
                      setAgentErr("");
                      setShowChats(false);
                      boxRef.current?.focus();
                    }}
                  >
                    <Plus size={12} /> New chat
                  </button>
                </div>
                {showChats && (
                  <div className="absolute right-3 top-12 z-10 w-64 rounded-2xl border border-white/10 bg-ink p-2 shadow-xl xl:hidden">
                    {(data.agentJobs || []).slice(0, 12).map((j) => (
                      <button
                        key={j.id}
                        className="block w-full truncate rounded-lg px-2 py-1.5 text-left text-xs hover:bg-white/10"
                        onClick={() => {
                          setJob(j);
                          setFile(j.patches[0]?.path || "");
                          setShowChats(false);
                        }}
                      >
                        <span className="text-mint">{j.status}</span> · {j.prompt}
                      </button>
                    ))}
                    {!data.agentJobs?.length && <p className="px-2 py-1 text-xs text-white/45">No chats yet.</p>}
                  </div>
                )}
              </div>
              <div ref={threadRef} className="min-h-0 flex-1 space-y-3 overflow-auto px-4 py-4">
                {!messages.length && (
                  <div className="mx-auto max-w-md pt-8 text-center">
                    <p className="text-sm text-white/70">Type a message and hit Enter. Grok already has the hotel briefing and can read the live repo. To hand it the same notes in this thread, send the hotel file below.</p>
                    <div className="mt-4 flex flex-wrap justify-center gap-1.5">
                      <button
                        className="rounded-full bg-mint px-3 py-1.5 text-[12px] font-semibold text-ink hover:opacity-90"
                        onClick={() => send(HOTEL_BRIEF)}
                      >
                        Send hotel file
                      </button>
                      <button
                        className="rounded-full bg-white/10 px-3 py-1.5 text-[12px] hover:bg-white/15"
                        onClick={async () => {
                          await navigator.clipboard.writeText(HOTEL_BRIEF);
                          setCopied(true);
                          setTimeout(() => setCopied(false), 2000);
                        }}
                      >
                        {copied ? "Copied" : "Copy hotel file"}
                      </button>
                      {STARTERS.map((s) => (
                        <button key={s.title} className="rounded-full bg-white/10 px-3 py-1.5 text-[12px] hover:bg-white/15" onClick={() => send(s.prompt)}>
                          {s.title}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {messages.map((m, i) => {
                  const seg = m.segmentId ? (job?.segments || []).find((s) => s.id === m.segmentId) : null;
                  const text = m.content.startsWith("HODL HOTEL — staff briefing") ? "Hotel briefing (full notes sent)." : m.content;
                  return (
                    <div key={`${m.at}-${i}`} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                      <div className="max-w-[85%] space-y-1.5">
                        <div
                          className={`whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                            m.role === "user" ? "bg-mint text-ink" : "bg-white/10 text-white/90"
                          }`}
                        >
                          {text}
                        </div>
                        {m.role === "user" && job && job.id !== "pending" && (
                          <div className="flex justify-end">
                            <button
                              type="button"
                              className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] text-white/35 hover:bg-coral/20 hover:text-coral"
                              disabled={!!busy}
                              onClick={() => deletePrompt(i)}
                            >
                              <Trash2 size={11} /> Delete prompt
                            </button>
                          </div>
                        )}
                        {seg && job && (
                          <HelpBubble
                            seg={seg}
                            compact
                            active={selected === seg.id}
                            busy={busy}
                            onPreview={() => openPreview(job, seg)}
                            onPush={() => ship(job, seg)}
                            onDelete={() => deleteHelp(job, seg)}
                          />
                        )}
                      </div>
                    </div>
                  );
                })}
                {busy === "chat" && (
                  <div className="flex justify-start">
                    <div className="rounded-2xl bg-white/10 px-3.5 py-2.5 text-sm text-white/50">Grok is thinking…</div>
                  </div>
                )}
                {agentErr && <p className="text-sm text-coral">{agentErr}</p>}
              </div>
              <form
                className="border-t border-white/10 p-3"
                onSubmit={(e) => {
                  e.preventDefault();
                  send();
                }}
              >
                <div className="flex items-end gap-2 rounded-2xl border border-white/15 bg-white/5 px-3 py-2">
                  <textarea
                    ref={boxRef}
                    className="max-h-40 min-h-[44px] flex-1 resize-none bg-transparent text-sm outline-none placeholder:text-white/35"
                    rows={1}
                    value={draft}
                    placeholder="Message Grok…"
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        send();
                      }
                    }}
                  />
                  <button type="submit" className="rounded-xl bg-mint p-2 text-ink disabled:opacity-40" disabled={!draft.trim() || !!busy} aria-label="Send">
                    <Send size={16} />
                  </button>
                </div>
                <p className="mt-1.5 px-1 text-[11px] text-white/35">Enter to send · Shift+Enter for a new line</p>
              </form>
            </section>

            <GrokHelpPane
              jobs={data.agentJobs || []}
              currentJobId={job?.id}
              selectedId={selected}
              busy={busy}
              file={file}
              current={current}
              showPreview={showFiles}
              onOpenChat={(j) => {
                setJob(j);
                const last = j.segments?.[j.segments.length - 1];
                setSelected(last?.id || "");
                setFile(last?.patches[0]?.path || j.patches[0]?.path || "");
              }}
              onPreview={openPreview}
              onPush={ship}
              onDeleteHelp={deleteHelp}
              onDeleteChat={deleteChat}
              onFile={setFile}
            />
          </div>
        )}

        {tab === "overview" && (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {Object.entries(data.stats).map(([k, v]) => (
              <div key={k} className="panel p-4">
                <div className="text-xs uppercase text-white/40">{k}</div>
                <div className="font-display text-2xl text-mint">{String(v)}</div>
              </div>
            ))}
          </div>
        )}

        {tab === "users" && (
          <div className="overflow-auto panel">
            <table className="w-full text-left text-sm">
              <thead className="text-white/50">
                <tr>
                  <th className="p-2">User</th>
                  <th>Email</th>
                  <th>Coins</th>
                  <th>Role</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {data.users.map((u) => (
                  <tr key={u.id} className="border-t border-white/10">
                    <td className="p-2">
                      {u.username}
                      {u.bannedUntil && <span className="text-coral"> banned</span>}
                    </td>
                    <td>{u.email}</td>
                    <td>{u.coins}</td>
                    <td>{u.role}</td>
                    <td className="space-x-2 p-2 text-xs">
                      <button onClick={() => op({ op: "mute", userId: u.id, hours: 6 })}>Mute 6h</button>
                      <button onClick={() => op({ op: "ban", userId: u.id, hours: 24, reason: "desk" })}>Ban 24h</button>
                      <button onClick={() => op({ op: "unban", userId: u.id })}>Unban</button>
                      <button onClick={() => op({ op: "grant", userId: u.id, coins: 200 })}>+200</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === "rooms" && (
          <ul className="panel divide-y divide-white/10">
            {data.rooms.map((room) => (
              <li key={room.id} className="flex justify-between p-3 text-sm">
                <span>
                  {room.name} {room.ownerId ? "" : "· hotel"}
                </span>
                <span className="text-mint">{room.users} in</span>
              </li>
            ))}
          </ul>
        )}

        {tab === "ads" && (
          <ul className="panel divide-y divide-white/10">
            {data.ads.map((ad) => (
              <li key={ad.id} className="flex items-center justify-between p-3 text-sm">
                <span>
                  {ad.slotId} · {ad.status} · until {ad.end.slice(0, 16)}
                </span>
                <button className="text-coral" onClick={() => op({ op: "kill-ad", adId: ad.id })}>
                  Take down
                </button>
              </li>
            ))}
          </ul>
        )}

        {tab === "reports" && (
          <ul className="panel divide-y divide-white/10">
            {data.reports.map((rep) => (
              <li key={rep.id} className="flex justify-between p-3 text-sm">
                <span>
                  {rep.status} · {rep.reason} · {rep.at.slice(0, 16)}
                </span>
                <button onClick={() => op({ op: "close-report", reportId: rep.id })}>Close</button>
              </li>
            ))}
          </ul>
        )}

        {tab === "economy" && (
          <div className="panel p-4 text-sm">
            <p>On-chain receipts: {data.receipts.length}</p>
            <ul className="mt-2 max-h-64 overflow-auto">
              {data.receipts.map((rec) => (
                <li key={rec.id} className="font-mono text-xs">
                  {rec.at.slice(0, 19)} · {rec.packId} · {rec.coins}c · {rec.sig.slice(0, 16)}…
                </li>
              ))}
            </ul>
          </div>
        )}

        {tab === "events" && (
          <form
            className="grid gap-2 panel p-4"
            onSubmit={(e) => {
              e.preventDefault();
              const f = new FormData(e.currentTarget);
              op({
                op: "event",
                title: f.get("title"),
                roomId: f.get("roomId"),
                desc: f.get("desc"),
                reward: Number(f.get("reward") || 0),
              });
            }}
          >
            <input name="title" className="field" placeholder="Event title" />
            <input name="roomId" className="field" defaultValue="public-shill-zone" />
            <input name="desc" className="field" placeholder="Description" />
            <input name="reward" className="field" placeholder="Coin reward" />
            <button className="btn-sol">Create event</button>
            <ul className="text-sm">
              {data.events.map((ev) => (
                <li key={ev.id}>
                  {ev.title} → {ev.roomId}
                </li>
              ))}
            </ul>
          </form>
        )}

        {tab === "settings" && (
          <form
            className="grid gap-2 panel p-4"
            onSubmit={(e) => {
              e.preventDefault();
              const f = new FormData(e.currentTarget);
              op({
                op: "settings",
                settings: {
                  treasuryWallet: String(f.get("treasuryWallet") || ""),
                  chatEnabled: f.get("chatEnabled") === "on",
                  signupEnabled: f.get("signupEnabled") === "on",
                  maintenance: f.get("maintenance") === "on",
                  starterCoins: Number(f.get("starterCoins") || 400),
                },
              });
            }}
          >
            <label className="text-sm">
              Treasury SOL wallet
              <input name="treasuryWallet" className="field mt-1" defaultValue={data.settings.treasuryWallet} />
            </label>
            <label className="text-sm">
              Starter coins
              <input name="starterCoins" className="field mt-1" defaultValue={data.settings.starterCoins} />
            </label>
            <label className="flex gap-2 text-sm">
              <input type="checkbox" name="chatEnabled" defaultChecked={data.settings.chatEnabled} /> Chat on
            </label>
            <label className="flex gap-2 text-sm">
              <input type="checkbox" name="signupEnabled" defaultChecked={data.settings.signupEnabled} /> Signups on
            </label>
            <label className="flex gap-2 text-sm">
              <input type="checkbox" name="maintenance" defaultChecked={data.settings.maintenance} /> Maintenance
            </label>
            <button className="btn-sol">Save</button>
          </form>
        )}

        {tab === "logs" && (
          <ul className="max-h-[70vh] overflow-auto panel p-3 font-mono text-xs">
            {data.logs.map((l) => (
              <li key={l.id}>
                {l.at} [{l.kind}] {l.text}
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
