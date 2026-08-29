"use client";

import { Wordmark } from "@/components/Wordmark";
import { setClientToken } from "@/lib/clientAuth";
import { Eye, EyeOff, KeyRound, Shield } from "lucide-react";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const r = useRouter();
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr("");
    const res = await fetch("/api/admin/login", {
      method: "POST",
      credentials: "include",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ login, password }),
    });
    const j = await res.json();
    setBusy(false);
    if (!res.ok) return setErr(j.error || "Denied");
    setClientToken(j.token);
    r.push("/admin");
  }

  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(900px_500px_at_10%_-10%,rgba(20,241,149,0.18),transparent_55%),radial-gradient(700px_400px_at_90%_0%,rgba(153,69,255,0.22),transparent_50%)]" />
      <div className="relative mx-auto flex min-h-screen max-w-lg flex-col justify-center px-4 py-16">
        <div className="mb-8 text-center">
          <Wordmark />
          <p className="mt-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-mint">
            <Shield size={12} /> Staff door
          </p>
        </div>
        <form onSubmit={onSubmit} className="panel p-6">
          <h1 className="font-display text-2xl">Hotel desk</h1>
          <p className="mt-1 text-sm text-white/55">Command center login. Guests stay at the front door.</p>
          <label className="mt-5 block text-xs font-semibold uppercase tracking-wide text-white/50">
            Desk email or username
            <input
              className="field mt-1.5"
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              autoComplete="username"
              placeholder="HotelDesk"
            />
          </label>
          <label className="mt-3 block text-xs font-semibold uppercase tracking-wide text-white/50">
            Desk password
            <div className="relative mt-1.5">
              <input
                className="field pr-12"
                type={show ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
              <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-white/45" onClick={() => setShow((s) => !s)} aria-label="Toggle password">
                {show ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </label>
          {err && <p className="mt-3 text-sm text-coral">{err}</p>}
          <button className="btn-sol mt-5 w-full" disabled={busy}>
            <KeyRound size={16} />
            {busy ? "Checking…" : "Open the desk"}
          </button>
        </form>
        <p className="mt-4 text-center text-xs text-white/35">
          Player login is on the public site. This page is for admins only.
        </p>
      </div>
    </main>
  );
}
