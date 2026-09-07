"use client";

import { HotelBackdrop } from "@/components/HotelBackdrop";
import { Wordmark } from "@/components/Wordmark";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function VerifyPage() {
  const r = useRouter();
  const [msg, setMsg] = useState("Confirming your email…");
  const [ok, setOk] = useState(false);

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get("token") || "";
    if (!token) {
      setMsg("Missing confirm link.");
      return;
    }
    fetch(`/api/auth/verify?token=${encodeURIComponent(token)}`, { credentials: "include" })
      .then(async (res) => {
        const j = await res.json();
        if (!res.ok) {
          setMsg(j.error || "Could not confirm this email.");
          return;
        }
        try {
          if (j.token) {
            localStorage.setItem("hodl_session", j.token);
            sessionStorage.setItem("hodl_session", j.token);
          }
        } catch {
          /* */
        }
        setOk(true);
        setMsg(j.referralPaid ? "Email confirmed. Your host just earned 250 coins." : "Email confirmed. Welcome to the hotel.");
        setTimeout(() => r.push("/play"), 1200);
      })
      .catch(() => setMsg("Could not reach the desk."));
  }, [r]);

  return (
    <HotelBackdrop>
      <Wordmark />
      <main className="relative z-20 mx-auto max-w-lg px-4 py-24 text-white">
        <h1 className="font-display text-3xl">Email confirm</h1>
        <p className="mt-4 text-white/80">{msg}</p>
        {ok ? (
          <Link href="/play" className="btn-sol mt-6 inline-flex">
            Enter the hotel
          </Link>
        ) : (
          <Link href="/login" className="btn-ink mt-6 inline-flex">
            Sign in
          </Link>
        )}
      </main>
    </HotelBackdrop>
  );
}
