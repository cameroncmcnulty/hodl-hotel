import { NextResponse } from "next/server";
import { persistInfo } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET() {
  const persist = persistInfo();
  return NextResponse.json({
    ok: true,
    persist,
    railway: Boolean(process.env.RAILWAY_ENVIRONMENT || process.env.RAILWAY_PROJECT_ID),
  });
}
