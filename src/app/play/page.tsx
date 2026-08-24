"use client";

import { GameClient } from "@/components/GameClient";
import { useEffect, useState } from "react";

export default function PlayPage() {
  const [data, setData] = useState<any>(null);
  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((j) => {
        if (!j.user) location.href = "/login";
        else setData(j);
      });
  }, []);
  if (!data?.user) return <div className="grid min-h-screen place-items-center font-display">Opening the elevator…</div>;
  return <GameClient me={data.user} homeRoomId={data.homeRoomId} />;
}
