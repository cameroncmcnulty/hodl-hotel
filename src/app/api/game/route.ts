import { NextResponse } from "next/server";
import { applyAction, snapshot } from "@/lib/game/world";
import { sessionJson, sessionUserId } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const id = await sessionUserId();
  if (!id) return NextResponse.json({ error: "Sign in" }, { status: 401 });
  const roomId = new URL(req.url).searchParams.get("roomId") || "";
  if (!roomId) return NextResponse.json({ error: "roomId" }, { status: 400 });
  return sessionJson(snapshot(roomId, id) as Record<string, unknown>, id);
}

export async function POST(req: Request) {
  const id = await sessionUserId();
  if (!id) return NextResponse.json({ error: "Sign in" }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const result = applyAction(id, body);
  const failed = "error" in result && result.error && body.type !== "ping";
  return sessionJson(result as Record<string, unknown>, id, failed ? 400 : 200);
}
