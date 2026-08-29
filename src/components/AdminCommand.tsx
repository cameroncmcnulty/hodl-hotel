"use client";

import { Logo } from "@/components/Logo";
import { api, clearClientToken } from "@/lib/clientAuth";
import type { AgentJob } from "@/lib/types";
import {
  Activity,
  Bot,
  ClipboardList,
  Coins,
  Flag,
  LogOut,
  Megaphone,
  Plus,
  Rocket,
  Send,
  Settings,
  Shield,
  Sparkles,
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
      if (!job && j.agentJobs?.[0]) setJob(j.agentJobs[0]);
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
    if (j.job?.patches?.[0]?.path) setFile(j.job.patches[0].path);
    load();
    boxRef.current?.focus();
  }

  async function ship() {
    if (!job) return;
    setBusy("ship");
    setAgentErr("");
    const { res, j } = await api("/api/admin/ship", { method: "POST", body: JSON.stringify({ jobId: job.id, message: job.prompt.slice(0, 72) }) });
    setBusy("");
    if (!res.ok) return setAgentErr(j.error || "Ship failed");
    setJob(j.job);
    load();
  }

  async function applyLocal() {
    if (!job) return;
    setBusy("local");
    const { res, j } = await api("/api/admin/agent", { method: "POST", body: JSON.stringify({ op: "apply-local", jobId: job.id }) });
    setBusy("");
    if (!res.ok) return setAgentErr(j.error || "Apply failed");
    setJob(j.job);
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

  const patch = useMemo(() => job?.patches.find((p) => p.path === file) || job?.patches[0], [job, file]);
  const messages = useMemo(() => {
    if (job?.messages?.length) return job.messages;
    if (!job) return [];
    return [
      job.prompt ? { role: "user" as const, content: job.prompt, at: job.createdAt } : null,
      job.reply ? { role: "assistant" as const, content: job.reply, at: job.updatedAt } : null,
    ].filter((m): m is { role: "user" | "assistant"; content: string; at: string } => !!m);
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
          <div className="grid gap-4 xl:grid-cols-[minmax(0,1.15fr)_minmax(280px,0.85fr)]">
            <section className="panel flex h-[calc(100vh-8.5rem)] min-h-[480px] flex-col overflow-hidden">
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
                    <p className="text-sm text-white/70">Type a message and hit Enter. Grok replies in this thread, and can inspect the hotel and propose files when you ask it to build or fix something.</p>
                    <div className="mt-4 flex flex-wrap justify-center gap-1.5">
                      {STARTERS.map((s) => (
                        <button key={s.title} className="rounded-full bg-white/10 px-3 py-1.5 text-[12px] hover:bg-white/15" onClick={() => send(s.prompt)}>
                          {s.title}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {messages.map((m, i) => (
                  <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                        m.role === "user" ? "bg-mint text-ink" : "bg-white/10 text-white/90"
                      }`}
                    >
                      {m.content}
                    </div>
                  </div>
                ))}
                {busy === "chat" && (
                  <div className="flex justify-start">
                    <div className="rounded-2xl bg-white/10 px-3.5 py-2.5 text-sm text-white/50">Grok is thinking…</div>
                  </div>
                )}
                {agentErr && <p className="text-sm text-coral">{agentErr}</p>}
              </div>
              {!!job?.patches.length && (
                <div className="flex flex-wrap items-center gap-2 border-t border-white/10 px-4 py-2 text-xs">
                  <span className="text-mint">{job.patches.length} file{job.patches.length === 1 ? "" : "s"} ready</span>
                  <button className="rounded-full bg-white/10 px-2.5 py-1" onClick={() => setShowFiles((v) => !v)}>
                    {showFiles ? "Hide preview" : "Show preview"}
                  </button>
                  <button className="rounded-full bg-white/10 px-2.5 py-1 disabled:opacity-40" disabled={!!busy} onClick={applyLocal}>
                    Apply here
                  </button>
                  <button className="inline-flex items-center gap-1 rounded-full bg-mint/20 px-2.5 py-1 font-semibold text-mint disabled:opacity-40" disabled={!!busy} onClick={ship}>
                    <Rocket size={12} /> {busy === "ship" ? "Shipping…" : "Ship"}
                  </button>
                  {job.shipSha && <span className="font-mono text-white/40">{job.shipSha.slice(0, 8)}</span>}
                </div>
              )}
              {!!job?.patches.length && showFiles && (
                <div className="max-h-48 overflow-auto border-t border-white/10 p-3 xl:hidden">
                  <p className="mb-2 text-[11px] uppercase tracking-wide text-white/40">Proposed files</p>
                  <div className="mb-2 flex flex-wrap gap-1">
                    {job.patches.map((p) => (
                      <button key={p.path} className={`rounded-full px-2.5 py-1 text-[11px] ${file === p.path || patch?.path === p.path ? "bg-mint text-ink" : "bg-white/10"}`} onClick={() => setFile(p.path)}>
                        {p.path.split("/").slice(-2).join("/")}
                      </button>
                    ))}
                  </div>
                  <pre className="max-h-28 overflow-auto rounded-xl bg-black/40 p-2 font-mono text-[11px] text-mint/90">{patch?.content || ""}</pre>
                </div>
              )}
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

            <aside className="hidden min-h-[480px] flex-col xl:flex">
              {showFiles && job?.patches.length ? (
                <section className="panel flex min-h-0 flex-1 flex-col p-4">
                  <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
                    <Shield size={16} className="text-mint" /> File preview
                  </div>
                  <div className="mb-2 flex flex-wrap gap-1">
                    {job.patches.map((p) => (
                      <button key={p.path} className={`rounded-full px-2.5 py-1 text-[11px] ${file === p.path || patch?.path === p.path ? "bg-mint text-ink" : "bg-white/10"}`} onClick={() => setFile(p.path)}>
                        {p.path.split("/").slice(-2).join("/")}
                      </button>
                    ))}
                  </div>
                  <div className="grid min-h-0 flex-1 gap-2">
                    <pre className="max-h-[38%] overflow-auto rounded-xl bg-black/40 p-3 font-mono text-[11px] text-white/45">{current || "Current file"}</pre>
                    <pre className="min-h-0 flex-1 overflow-auto rounded-xl bg-black/40 p-3 font-mono text-[11px] text-mint/90">{patch?.content || "Proposed file"}</pre>
                  </div>
                </section>
              ) : (
                <section className="panel flex-1 p-4 text-sm text-white/45">
                  <p className="mb-3 font-semibold text-white/70">Recent chats</p>
                  <ul className="space-y-1">
                    {(data.agentJobs || []).map((j) => (
                      <li key={j.id}>
                        <button
                          className={`w-full truncate rounded-lg px-2 py-1.5 text-left text-xs ${job?.id === j.id ? "bg-white/15" : "hover:bg-white/5"}`}
                          onClick={() => {
                            setJob(j);
                            setFile(j.patches[0]?.path || "");
                          }}
                        >
                          <span className="text-mint">{j.status}</span> · {j.prompt}
                        </button>
                      </li>
                    ))}
                  </ul>
                  {!data.agentJobs?.length && <p>Chats will show up here.</p>}
                </section>
              )}
            </aside>
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
