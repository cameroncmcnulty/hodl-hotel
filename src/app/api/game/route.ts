import { NextResponse } from "next/server";
import { applyAction, snapshot } from "@/lib/game/world";
import { sessionUserId } from "@/lib/session";

export async function GET(req: Request) {
  const id = await sessionUserId();
  if (!id) return NextResponse.json({ error: "Sign in" }, { status: 401 });
  const roomId = new URL(req.url).searchParams.get("roomId") || "";
  if (!roomId) return NextResponse.json({ error: "roomId" }, { status: 400 });
  return NextResponse.json(snapshot(roomId, id));
}

export async function POST(req: Request) {
  const id = await sessionUserId();
  if (!id) return NextResponse.json({ error: "Sign in" }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const result = applyAction(id, body);
  const failed = "error" in result && result.error && body.type !== "ping";
  return NextResponse.json(result, { status: failed ? 400 : 200 });
}
