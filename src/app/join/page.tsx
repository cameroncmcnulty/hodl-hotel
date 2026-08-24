"use client";

import { CharacterPreview, FigureEditor } from "@/components/CharacterPreview";
import { Logo } from "@/components/Logo";
import { STARTER_COINS } from "@/lib/constants";
import { DEFAULT_FIGURE } from "@/lib/game/avatar";
import { USER_LAYOUTS } from "@/lib/layouts";
import type { Figure } from "@/lib/types";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function JoinPage() {
  const r = useRouter();
  const [step, setStep] = useState(0);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [birthday, setBirthday] = useState("");
  const [tos, setTos] = useState(false);
  const [username, setUsername] = useState("");
  const [figure, setFigure] = useState<Figure>(DEFAULT_FIGURE);
  const [layoutId, setLayoutId] = useState(USER_LAYOUTS[0].id);
  const [roomName, setRoomName] = useState("");
  const [visibility, setVisibility] = useState<"public" | "locked">("public");
  const [roomPassword, setRoomPassword] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  async function finish() {
    setBusy(true);
    setErr("");
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        email,
        password,
        birthday,
        username,
        figure,
        layoutId,
        roomName: roomName || `${username}'s pad`,
        visibility,
        roomPassword,
      }),
    });
    const j = await res.json();
    setBusy(false);
    if (!res.ok) return setErr(j.error || "Could not check in");
    r.push("/play");
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <Logo />
      <p className="mt-6 text-xs uppercase tracking-[0.2em] text-mint">Check-in {step + 1} / 4</p>
      <h1 className="font-display text-3xl">Create your guest</h1>

      {step === 0 && (
        <div className="panel mt-6 grid gap-3 p-5">
          <input className="field" type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input className="field" type="password" placeholder="Password (8+)" value={password} onChange={(e) => setPassword(e.target.value)} />
          <label className="text-sm text-white/70">
            Birthday
            <input className="field mt-1" type="date" value={birthday} onChange={(e) => setBirthday(e.target.value)} />
          </label>
          <label className="flex items-start gap-2 text-sm text-white/70">
            <input type="checkbox" checked={tos} onChange={(e) => setTos(e.target.checked)} className="mt-1" />
            <span>
              I am 13+ (18+ to buy coins with Solana) and agree to the{" "}
              <Link href="/legal/terms" className="text-mint">
                Terms
              </Link>{" "}
              and{" "}
              <Link href="/legal/privacy" className="text-mint">
                Privacy Policy
              </Link>
              .
            </span>
          </label>
          <button className="btn-sol" disabled={!email || password.length < 8 || !birthday || !tos} onClick={() => setStep(1)}>
            Next — username
          </button>
        </div>
      )}

      {step === 1 && (
        <div className="panel mt-6 grid gap-3 p-5">
          <input className="field" placeholder="Username (3–16)" value={username} onChange={(e) => setUsername(e.target.value)} />
          <p className="text-xs text-white/50">Letters, numbers, underscore. This is how people find you.</p>
          <div className="flex gap-2">
            <button className="btn-ink" onClick={() => setStep(0)}>
              Back
            </button>
            <button className="btn-sol" disabled={username.length < 3} onClick={() => setStep(2)}>
              Next — look
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="panel mt-6 grid gap-6 p-5 md:grid-cols-2">
          <CharacterPreview figure={figure} />
          <FigureEditor figure={figure} onChange={setFigure} />
          <div className="md:col-span-2 flex gap-2">
            <button className="btn-ink" onClick={() => setStep(1)}>
              Back
            </button>
            <button className="btn-sol" onClick={() => setStep(3)}>
              Next — room
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="panel mt-6 grid gap-4 p-5">
          <p className="text-sm text-white/70">
            You start with <b className="text-gold">{STARTER_COINS} coins</b> — enough for a bed, seating, a lamp, and a plant.
            Shop after you land.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {USER_LAYOUTS.map((l) => (
              <button
                key={l.id}
                onClick={() => setLayoutId(l.id)}
                className={`rounded-2xl border p-3 text-left ${layoutId === l.id ? "border-mint bg-mint/10" : "border-white/10"}`}
              >
                <div className="font-display">{l.name}</div>
                <div className="text-xs text-white/60">{l.blurb}</div>
              </button>
            ))}
          </div>
          <input className="field" placeholder="Room name" value={roomName} onChange={(e) => setRoomName(e.target.value)} />
          <div className="flex gap-3 text-sm">
            <label className="flex items-center gap-2">
              <input type="radio" checked={visibility === "public"} onChange={() => setVisibility("public")} /> Public
            </label>
            <label className="flex items-center gap-2">
              <input type="radio" checked={visibility === "locked"} onChange={() => setVisibility("locked")} /> Locked
            </label>
          </div>
          {visibility === "locked" && (
            <input className="field" placeholder="Room password" value={roomPassword} onChange={(e) => setRoomPassword(e.target.value)} />
          )}
          {err && <p className="text-sm text-coral">{err}</p>}
          <div className="flex gap-2">
            <button className="btn-ink" onClick={() => setStep(2)}>
              Back
            </button>
            <button className="btn-sol" disabled={busy} onClick={finish}>
              {busy ? "Checking in…" : "Enter my room"}
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
