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
    <div className="absolute right-3 top-24 z-20 flex w-[min(340px,92vw)] flex-col gap-4 md:right-10 md:top-1/2 md:-translate-y-1/2">
      <div className="rounded-[28px] border-2 border-[#2a3350]/30 bg-[#5c6b8a]/90 p-3 shadow-2xl backdrop-blur-sm">
        <p className="px-2 pb-2 text-center text-sm font-semibold text-white">First time?</p>
        <div className="rounded-2xl bg-[#f4efe6] px-4 py-4 text-center text-[#24143d]">
          <p className="text-sm">No guest yet?</p>
          <Link href="/join" className="mt-3 inline-block rounded-xl bg-gradient-to-r from-sol to-mint px-4 py-2 text-sm font-bold text-ink shadow-glow">
            Create one here
          </Link>
        </div>
      </div>

      <form onSubmit={onSubmit} className="rounded-[28px] border-2 border-[#2a3350]/30 bg-[#5c6b8a]/90 p-3 shadow-2xl backdrop-blur-sm">
        <p className="px-2 pb-2 text-center text-sm font-semibold text-white">What&apos;s your guest name?</p>
        <div className="grid gap-2 rounded-2xl bg-[#f4efe6] px-4 py-4 text-[#24143d]">
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
            <input
              className="mt-1 w-full rounded-lg border-2 border-[#c9bba8] bg-white px-3 py-2 text-sm outline-none ring-mint/40 focus:ring-2"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
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
