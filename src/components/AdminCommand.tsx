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
  Rocket,
  Settings,
  Shield,
  Sparkles,
  Users,
  Waypoints,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
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
  const [prompt, setPrompt] = useState(STARTERS[0].prompt);
  const [job, setJob] = useState<AgentJob | null>(null);
  const [busy, setBusy] = useState("");
  const [file, setFile] = useState("");
  const [current, setCurrent] = useState("");
  const [agentErr, setAgentErr] = useState("");

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
  }, []);

  async function op(body: object) {
    await api("/api/admin", { method: "POST", body: JSON.stringify(body) });
    load();
  }

  async function run(kind: "preview" | "build") {
    setBusy(kind);
    setAgentErr("");
    const { res, j } = await api("/api/admin/agent", { method: "POST", body: JSON.stringify({ op: kind, prompt }) });
    setBusy("");
    if (!res.ok) return setAgentErr(j.error || "Grok failed");
    setJob(j.job);
    setFile(j.job?.patches?.[0]?.path || "");
    load();
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
          <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
            <section className="panel flex min-h-[520px] flex-col p-4">
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
                <Bot size={16} className="text-mint" /> Prompt
              </div>
              <div className="mb-3 flex flex-wrap gap-1">
                {STARTERS.map((s) => (
                  <button key={s.title} className="rounded-full bg-white/10 px-2.5 py-1 text-[11px] hover:bg-white/15" onClick={() => setPrompt(s.prompt)}>
                    {s.title}
                  </button>
                ))}
              </div>
              <textarea
                className="field min-h-[220px] flex-1 resize-y font-mono text-[13px] leading-relaxed"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Tell Grok what to inspect, fix, or build…"
              />
              {agentErr && <p className="mt-2 text-sm text-coral">{agentErr}</p>}
              <div className="mt-3 flex flex-wrap gap-2">
                <button className="btn-sol text-sm" disabled={!!busy} onClick={() => run("preview")}>
                  {busy === "preview" ? "Planning…" : "Preview plan"}
                </button>
                <button className="btn-ink text-sm" disabled={!!busy} onClick={() => run("build")}>
                  {busy === "build" ? "Building…" : "Build files"}
                </button>
                <button className="btn-ink text-sm" disabled={!job?.patches.length || !!busy} onClick={applyLocal}>
                  Apply on this server
                </button>
                <button className="inline-flex items-center gap-1 rounded-xl bg-mint/20 px-4 py-2 text-sm font-semibold text-mint disabled:opacity-40" disabled={!job?.patches.length || !!busy} onClick={ship}>
                  <Rocket size={14} /> {busy === "ship" ? "Shipping…" : "Ship to production"}
                </button>
              </div>
              <p className="mt-3 text-[11px] leading-relaxed text-white/40">
                Preview asks Grok to read the hotel and propose a plan. Build asks for full file patches. Ship commits those files to GitHub main (Vercel deploys from there).
              </p>
              {!!data.agentJobs?.length && (
                <ul className="mt-4 max-h-40 space-y-1 overflow-auto text-xs">
                  {data.agentJobs.map((j) => (
                    <li key={j.id}>
                      <button className={`w-full truncate rounded-lg px-2 py-1 text-left ${job?.id === j.id ? "bg-white/15" : "hover:bg-white/5"}`} onClick={() => { setJob(j); setFile(j.patches[0]?.path || ""); }}>
                        <span className="text-mint">{j.status}</span> · {j.prompt}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="panel flex min-h-[520px] flex-col p-4">
              <div className="mb-3 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <Shield size={16} className="text-mint" /> Preview
                </div>
                {job?.shipSha && <span className="font-mono text-[11px] text-mint">{job.shipSha.slice(0, 8)} shipped</span>}
              </div>
              {!job && <p className="text-sm text-white/40">Run a preview to see Grok’s plan, files, and a before/after of the selected patch.</p>}
              {job && (
                <>
                  <div className="mb-3 max-h-36 overflow-auto whitespace-pre-wrap rounded-xl bg-black/30 p-3 text-sm text-white/80">{job.reply || job.plan || "No write-up yet."}</div>
                  {job.error && <p className="mb-2 text-sm text-coral">{job.error}</p>}
                  {job.patches.length > 0 ? (
                    <>
                      <div className="mb-2 flex flex-wrap gap-1">
                        {job.patches.map((p) => (
                          <button key={p.path} className={`rounded-full px-2.5 py-1 text-[11px] ${file === p.path ? "bg-mint text-ink" : "bg-white/10"}`} onClick={() => setFile(p.path)}>
                            {p.path}
                          </button>
                        ))}
                      </div>
                      <div className="grid min-h-0 flex-1 gap-2 lg:grid-cols-2">
                        <pre className="max-h-[420px] overflow-auto rounded-xl bg-black/40 p-3 font-mono text-[11px] text-white/55">
                          {current || "Current file (empty or new)"}
                        </pre>
                        <pre className="max-h-[420px] overflow-auto rounded-xl bg-black/40 p-3 font-mono text-[11px] text-mint/90">
                          {patch?.content || "Proposed file"}
                        </pre>
                      </div>
                    </>
                  ) : (
                    <p className="text-sm text-white/45">No file patches in this job — Grok answered in the plan only.</p>
                  )}
                  {!!job.log?.length && <p className="mt-2 font-mono text-[10px] text-white/35">{job.log.join(" · ")}</p>}
                </>
              )}
            </section>
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
