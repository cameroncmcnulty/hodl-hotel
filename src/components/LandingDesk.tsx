"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export function LandingDesk() {
  const r = useRouter();
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [showPw, setShowPw] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr("");
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ login, password }),
    });
    const j = await res.json();
    setBusy(false);
    if (!res.ok) return setErr(j.error || "Wrong key");
    r.push("/play");
  }

  return (
    <div className="absolute left-1/2 top-16 z-20 w-[min(300px,calc(100vw-1.25rem))] -translate-x-1/2 md:left-6 md:top-28 md:w-[280px] md:translate-x-0">
      <form onSubmit={onSubmit} className="rounded-2xl border-2 border-white/25 bg-[#5c6b8a]/92 p-2.5 shadow-2xl backdrop-blur-md">
        <p className="px-1 pb-1.5 text-center text-xs font-semibold text-white">Check in</p>
        <div className="grid gap-1.5 rounded-xl bg-[#f4efe6] px-3 py-3 text-[#24143d]">
          <p className="text-center text-[11px]">
            First visit?{" "}
            <Link href="/join" className="font-bold text-[#6b21c4] underline">
              Create a guest
            </Link>
          </p>
          <label className="text-xs font-semibold">
            Email or username
            <input
              className="mt-1 w-full rounded-lg border-2 border-[#c9bba8] bg-white px-3 py-2 text-sm outline-none ring-mint/40 focus:ring-2"
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              autoComplete="username"
            />
          </label>
          <label className="text-xs font-semibold">
            Password
            <div className="relative">
              <input
                className="mt-1 w-full rounded-lg border-2 border-[#c9bba8] bg-white px-3 py-2 pr-14 text-sm outline-none ring-mint/40 focus:ring-2"
                type={showPw ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
              <button type="button" className="absolute right-2 top-1/2 -translate-y-1/2 text-[11px] font-bold text-[#5c6b8a]" onClick={() => setShowPw(!showPw)}>
                {showPw ? "Hide" : "Show"}
              </button>
            </div>
          </label>
          {err && <p className="text-sm text-coral">{err}</p>}
          <button className="mt-1 rounded-xl bg-[#24143d] px-4 py-2 text-sm font-bold text-white hover:bg-[#9945FF]" disabled={busy}>
            {busy ? "Opening…" : "OK"}
          </button>
        </div>
      </form>
    </div>
  );
}
