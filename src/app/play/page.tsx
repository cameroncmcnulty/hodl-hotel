"use client";

import { GameClient } from "@/components/GameClient";
import { useEffect, useState } from "react";

export default function PlayPage() {
  const [data, setData] = useState<any>(null);
  useEffect(() => {
    fetch("/api/auth/me", { credentials: "include" })
      .then((r) => r.json())
      .then((j) => {
        if (!j.user) location.href = "/login";
        else setData(j);
      });
  }, []);
  if (!data?.user) return <div className="grid min-h-[100dvh] place-items-center bg-[#7ec8ea] font-display text-[#24143d]">Opening the elevator…</div>;
  return <GameClient me={data.user} homeRoomId={data.homeRoomId} />;
}
