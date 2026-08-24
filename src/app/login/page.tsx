"use client";

import { HotelBackdrop } from "@/components/HotelBackdrop";
import { LandingDesk } from "@/components/LandingDesk";
import { Wordmark } from "@/components/Wordmark";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const r = useRouter();
  useEffect(() => {
    r.replace("/");
  }, [r]);
  return (
    <HotelBackdrop>
      <Wordmark />
      <LandingDesk />
    </HotelBackdrop>
  );
}
