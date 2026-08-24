"use client";

import { Logo } from "@/components/Logo";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export default function LoginPage() {
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
    if (!res.ok) return setErr(j.error || "Nope");
    r.push("/play");
  }

  return (
    <main className="mx-auto max-w-md px-4 py-12">
      <Logo />
      <h1 className="mt-8 font-display text-3xl">Welcome back</h1>
      <form onSubmit={onSubmit} className="panel mt-6 grid gap-3 p-5">
        <input className="field" placeholder="Email or username" value={login} onChange={(e) => setLogin(e.target.value)} />
        <input className="field" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
        {err && <p className="text-sm text-coral">{err}</p>}
        <button className="btn-sol" disabled={busy}>
          {busy ? "Opening…" : "Enter the hotel"}
        </button>
      </form>
      <p className="mt-4 text-sm text-white/60">
        New? <Link href="/join" className="text-mint">Create a guest</Link>
      </p>
    </main>
  );
}
