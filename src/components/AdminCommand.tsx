"use client";

import { GrokOps } from "@/components/GrokOps";
import { Logo } from "@/components/Logo";
import { api, clearClientToken } from "@/lib/clientAuth";
import type { AgentJob } from "@/lib/types";

function grokLine(data: { grok?: { ready: boolean; model: string }; github?: { ready: boolean; repo: string } }) {
  const g = data.grok?.ready ? `Grok ${data.grok.model}` : "Set XAI_API_KEY";
  const h = data.github?.ready ? `auto-push ${data.github.repo}` : "Set GITHUB_TOKEN to push fixes";
  return `${g} · ${h}`;
}
import {
  Activity,
  Bot,
  ClipboardList,
  Coins,
  Flag,
  LogOut,
  Megaphone,
  Settings,
  Sparkles,
  Users,
  Waypoints,
} from "lucide-react";
import { useEffect, useState } from "react";
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

  async function load() {
    const { res, j } = await api("/api/admin");
    if (!res.ok) setErr(j.error || "Denied");
    else setData(j);
  }
  useEffect(() => {
    load();
  }, []);

  async function op(body: object) {
    await api("/api/admin", { method: "POST", body: JSON.stringify(body) });
    load();
  }

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
              {tab === "grok"
                ? grokLine(data)
                : `${data.stats.online} online · ${data.settings.maintenance ? "maintenance" : "live"}`}
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

        {tab === "grok" && <GrokOps grok={data.grok} github={data.github} />}

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
