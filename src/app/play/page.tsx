"use client";

import { GameClient } from "@/components/GameClient";
import { useEffect, useState } from "react";

export default function PlayPage() {
  const [data, setData] = useState<any>(null);
  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("hodl_session") || sessionStorage.getItem("hodl_session") : null;
    fetch("/api/auth/me", {
      credentials: "include",
      headers: token ? { "x-hodl-session": token } : {},
    })
      .then((r) => r.json())
      .then((j) => {
        if (j.token) {
          try {
            localStorage.setItem("hodl_session", j.token);
            sessionStorage.setItem("hodl_session", j.token);
          } catch {
            /* */
          }
        }
        if (!j.user) location.href = "/login";
        else setData(j);
      });
  }, []);
  if (!data?.user) return <div className="grid min-h-[100dvh] place-items-center bg-[#0c0914] font-display text-white/70">Opening the elevator…</div>;
  return <GameClient me={data.user} homeRoomId={data.homeRoomId} />;
}
