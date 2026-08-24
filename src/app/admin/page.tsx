"use client";

import { Logo } from "@/components/Logo";
import { useEffect, useState } from "react";

export default function AdminPage() {
  const [data, setData] = useState<any>(null);
  const [tab, setTab] = useState("overview");
  const [err, setErr] = useState("");

  async function load() {
    const r = await fetch("/api/admin");
    const j = await r.json();
    if (!r.ok) setErr(j.error || "Denied");
    else setData(j);
  }
  useEffect(() => {
    load();
  }, []);

  async function op(body: object) {
    await fetch("/api/admin", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
    load();
  }

  if (err) {
    return (
      <main className="mx-auto max-w-md px-4 py-16">
        <Logo />
        <p className="mt-8 text-coral">{err}. Sign in as the hotel desk account.</p>
        <a className="btn-sol mt-4 inline-flex" href="/login">
          Sign in
        </a>
      </main>
    );
  }
  if (!data) return <div className="p-10">Loading desk…</div>;

  const tabs = ["overview", "users", "rooms", "ads", "reports", "economy", "events", "settings", "logs"];

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <div className="flex items-center justify-between">
        <Logo />
        <a href="/play" className="btn-ink text-sm">
          Back in-game
        </a>
      </div>
      <h1 className="mt-6 font-display text-3xl">Hotel desk</h1>
      <div className="mt-4 flex flex-wrap gap-1">
        {tabs.map((t) => (
          <button key={t} className={`rounded-full px-3 py-1 text-sm ${tab === t ? "bg-mint text-ink" : "bg-white/10"}`} onClick={() => setTab(t)}>
            {t}
          </button>
        ))}
      </div>

      {tab === "overview" && (
        <div className="mt-6 grid gap-3 sm:grid-cols-4">
          {Object.entries(data.stats).map(([k, v]) => (
            <div key={k} className="panel p-4">
              <div className="text-xs uppercase text-white/40">{k}</div>
              <div className="font-display text-2xl text-mint">{String(v)}</div>
            </div>
          ))}
        </div>
      )}

      {tab === "users" && (
        <div className="mt-6 overflow-auto panel">
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
              {data.users.map((u: any) => (
                <tr key={u.id} className="border-t border-white/10">
                  <td className="p-2">{u.username}{u.bannedUntil && <span className="text-coral"> banned</span>}</td>
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
        <ul className="mt-6 panel divide-y divide-white/10">
          {data.rooms.map((r: any) => (
            <li key={r.id} className="flex justify-between p-3 text-sm">
              <span>{r.name} {r.ownerId ? "" : "· hotel"}</span>
              <span className="text-mint">{r.users} in</span>
            </li>
          ))}
        </ul>
      )}

      {tab === "ads" && (
        <ul className="mt-6 panel divide-y divide-white/10">
          {data.ads.map((a: any) => (
            <li key={a.id} className="flex items-center justify-between p-3 text-sm">
              <span>
                {a.slotId} · {a.status} · until {a.end.slice(0, 16)}
              </span>
              <button className="text-coral" onClick={() => op({ op: "kill-ad", adId: a.id })}>
                Take down
              </button>
            </li>
          ))}
        </ul>
      )}

      {tab === "reports" && (
        <ul className="mt-6 panel divide-y divide-white/10">
          {data.reports.map((r: any) => (
            <li key={r.id} className="flex justify-between p-3 text-sm">
              <span>
                {r.status} · {r.reason} · {r.at.slice(0, 16)}
              </span>
              <button onClick={() => op({ op: "close-report", reportId: r.id })}>Close</button>
            </li>
          ))}
        </ul>
      )}

      {tab === "economy" && (
        <div className="mt-6 panel p-4 text-sm">
          <p>On-chain receipts: {data.receipts.length}</p>
          <ul className="mt-2 max-h-64 overflow-auto">
            {data.receipts.map((r: any) => (
              <li key={r.id} className="font-mono text-xs">
                {r.at.slice(0, 19)} · {r.packId} · {r.coins}c · {r.sig.slice(0, 16)}…
              </li>
            ))}
          </ul>
        </div>
      )}

      {tab === "events" && (
        <form
          className="mt-6 grid gap-2 panel p-4"
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
            {data.events.map((e: any) => (
              <li key={e.id}>
                {e.title} → {e.roomId}
              </li>
            ))}
          </ul>
        </form>
      )}

      {tab === "settings" && (
        <form
          className="mt-6 grid gap-2 panel p-4"
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
        <ul className="mt-6 max-h-[60vh] overflow-auto panel p-3 font-mono text-xs">
          {data.logs.map((l: any) => (
            <li key={l.id}>
              {l.at} [{l.kind}] {l.text}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
