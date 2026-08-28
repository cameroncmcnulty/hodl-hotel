"use client";

import { BirthdayFields } from "@/components/BirthdayFields";
import { FigureEditor } from "@/components/CharacterPreview";
import { HotelBackdrop } from "@/components/HotelBackdrop";
import { LayoutPreview } from "@/components/LayoutPreview";
import { Wordmark } from "@/components/Wordmark";
import { passwordIssues, STARTER_COINS } from "@/lib/constants";
import { DEFAULT_FIGURE } from "@/lib/game/avatar";
import { USER_LAYOUTS } from "@/lib/layouts";
import { ageYears } from "@/lib/moderate";
import type { Figure } from "@/lib/types";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

export default function JoinPage() {
  const r = useRouter();
  const [step, setStep] = useState(0);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [birthday, setBirthday] = useState("");
  const [tos, setTos] = useState(false);
  const [privacy, setPrivacy] = useState(false);
  const [guidelines, setGuidelines] = useState(false);
  const [virtualGoods, setVirtualGoods] = useState(false);
  const [ageConfirm, setAgeConfirm] = useState(false);
  const [guardian, setGuardian] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [username, setUsername] = useState("");
  const [figure, setFigure] = useState<Figure>(DEFAULT_FIGURE);
  const [layoutId, setLayoutId] = useState(USER_LAYOUTS[0].id);
  const [roomName, setRoomName] = useState("");
  const [visibility, setVisibility] = useState<"public" | "locked">("public");
  const [roomPassword, setRoomPassword] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const pwNeeds = useMemo(() => passwordIssues(password), [password]);
  const years = birthday ? ageYears(birthday) : 0;
  const teen = years >= 13 && years < 18;
  const canAccount =
    !!email &&
    pwNeeds.length === 0 &&
    !!birthday &&
    years >= 13 &&
    tos &&
    privacy &&
    guidelines &&
    virtualGoods &&
    ageConfirm &&
    (!teen || guardian);

  async function finish() {
    setBusy(true);
    setErr("");
    const res = await fetch("/api/auth/register", {
      method: "POST",
      credentials: "include",
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
        tos,
        privacy,
        guidelines,
        virtualGoods,
        ageConfirm,
        guardian,
      }),
    });
    const j = await res.json();
    setBusy(false);
    if (!res.ok) return setErr(j.error || "Could not check in");
    try {
      if (j.token) {
        localStorage.setItem("hodl_session", j.token);
        sessionStorage.setItem("hodl_session", j.token);
      }
    } catch {
      /* */
    }
    r.push("/play");
  }

  return (
    <HotelBackdrop>
      <Wordmark />
      <main className="relative z-20 mx-auto max-w-3xl px-3 py-12 pb-16 text-white sm:px-4 md:ml-auto md:mr-8 md:py-24">
      <p className="text-xs uppercase tracking-[0.2em] text-white drop-shadow">Check-in {step + 1} / 4</p>
      <h1 className="font-display text-3xl text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.65)]">Create your guest</h1>

      {step === 0 && (
        <div className="panel mt-6 grid gap-3 bg-[#24143d]/92 p-5 text-white">
          <input className="field" type="email" autoComplete="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <label className="text-sm text-white/70">
            Password
            <div className="relative">
              <input
                className="field mt-1 pr-16"
                type={showPw ? "text" : "password"}
                autoComplete="new-password"
                placeholder="10+ characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button type="button" className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-mint" onClick={() => setShowPw(!showPw)}>
                {showPw ? "Hide" : "Show"}
              </button>
            </div>
          </label>
          <ul className="grid gap-1 text-xs">
            {["At least 10 characters", "One lowercase letter", "One uppercase letter", "One number"].map((rule) => {
              const ok = !pwNeeds.includes(rule);
              return (
                <li key={rule} className={ok && password ? "text-mint" : "text-white/45"}>
                  {ok && password ? "✓" : "○"} {rule}
                </li>
              );
            })}
          </ul>
          <BirthdayFields value={birthday} onChange={setBirthday} />
          {birthday && years > 0 && years < 13 && <p className="text-sm text-coral">You must be 13 or older to create an account.</p>}
          <label className="flex items-start gap-2 text-sm text-white/80">
            <input type="checkbox" checked={ageConfirm} onChange={(e) => setAgeConfirm(e.target.checked)} className="mt-1" />
            <span>I confirm my birthday is accurate and I am at least 13 years old.</span>
          </label>
          {teen && (
            <label className="flex items-start gap-2 text-sm text-white/80">
              <input type="checkbox" checked={guardian} onChange={(e) => setGuardian(e.target.checked)} className="mt-1" />
              <span>I have a parent or guardian’s permission to play. I understand I cannot buy coins with Solana until I am 18.</span>
            </label>
          )}
          <label className="flex items-start gap-2 text-sm text-white/80">
            <input type="checkbox" checked={tos} onChange={(e) => setTos(e.target.checked)} className="mt-1" />
            <span>
              I agree to the{" "}
              <Link href="/legal/terms" className="text-mint underline" target="_blank">
                Terms of Service
              </Link>
              .
            </span>
          </label>
          <label className="flex items-start gap-2 text-sm text-white/80">
            <input type="checkbox" checked={privacy} onChange={(e) => setPrivacy(e.target.checked)} className="mt-1" />
            <span>
              I agree to the{" "}
              <Link href="/legal/privacy" className="text-mint underline" target="_blank">
                Privacy Policy
              </Link>{" "}
              (PIPEDA / similar privacy laws).
            </span>
          </label>
          <label className="flex items-start gap-2 text-sm text-white/80">
            <input type="checkbox" checked={guidelines} onChange={(e) => setGuidelines(e.target.checked)} className="mt-1" />
            <span>
              I will follow the{" "}
              <Link href="/legal/guidelines" className="text-mint underline" target="_blank">
                Community Guidelines
              </Link>
              .
            </span>
          </label>
          <label className="flex items-start gap-2 text-sm text-white/80">
            <input type="checkbox" checked={virtualGoods} onChange={(e) => setVirtualGoods(e.target.checked)} className="mt-1" />
            <span>
              I understand coins and furniture are virtual goods with no cash value, as described in the{" "}
              <Link href="/legal/virtual-goods" className="text-mint underline" target="_blank">
                Virtual Goods Policy
              </Link>
              . Crypto purchases are 18+ and irreversible.
            </span>
          </label>
          <button className="btn-sol" disabled={!canAccount} onClick={() => setStep(1)}>
            Next — username
          </button>
        </div>
      )}

      {step === 1 && (
        <div className="panel mt-6 grid gap-3 bg-[#24143d]/92 p-5 text-white">
          <input className="field" placeholder="Username (3–16)" value={username} onChange={(e) => { setUsername(e.target.value); setErr(""); }} />
          <p className="text-xs text-white/50">Letters, numbers, underscore. This is how people find you.</p>
          {err && <p className="text-sm text-coral">{err}</p>}
          <div className="flex gap-2">
            <button className="btn-ink" onClick={() => setStep(0)}>
              Back
            </button>
            <button
              className="btn-sol"
              disabled={username.length < 3}
              onClick={() => {
                if (!/^[a-zA-Z0-9_]{3,16}$/.test(username)) {
                  setErr("Username must be 3–16 letters, numbers, or _");
                  return;
                }
                setErr("");
                setStep(2);
              }}
            >
              Next — look
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="mt-4 grid gap-3 text-white">
          <FigureEditor figure={figure} onChange={setFigure} />
          <div className="flex gap-2">
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
        <div className="panel mt-6 grid gap-4 bg-[#24143d]/92 p-5 text-white">
          <p className="text-sm text-white/70">
            You start with <b className="text-gold">{STARTER_COINS} coins</b> and one of six free floor plans.
            Gold plans (the other shapes) are in the shop after you land.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {USER_LAYOUTS.map((l) => (
              <button
                key={l.id}
                onClick={() => setLayoutId(l.id)}
                className={`rounded-2xl border p-2 text-left ${layoutId === l.id ? "border-mint bg-mint/10" : "border-white/10"}`}
              >
                <LayoutPreview layoutId={l.id} />
                <div className="mt-2 font-display text-white">{l.name}</div>
                <div className="text-xs text-white/70">{l.blurb}</div>
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
    </HotelBackdrop>
  );
}
