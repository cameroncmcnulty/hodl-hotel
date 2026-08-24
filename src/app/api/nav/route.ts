import { NextResponse } from "next/server";
import { sessionUserId } from "@/lib/session";
import { findUser, loadDB, occupantCount, roomPreview } from "@/lib/store";

export async function GET() {
  const id = await sessionUserId();
  if (!id) return NextResponse.json({ error: "Sign in" }, { status: 401 });
  const db = loadDB();
  const u = findUser(db, id);
  if (!u) return NextResponse.json({ error: "Sign in" }, { status: 401 });

  const publicAreas = db.rooms.filter((r) => !r.ownerId).map(roomPreview);
  const popular = db.rooms
    .filter((r) => r.visibility === "public")
    .map((r) => ({ ...roomPreview(r), users: occupantCount(r.id) }))
    .sort((a, b) => b.users - a.users || +new Date(b.lastActiveAt) - +new Date(a.lastActiveAt))
    .slice(0, 40);

  const history = u.roomHistory
    .map((h) => {
      const r = db.rooms.find((x) => x.id === h.roomId);
      return r ? { ...roomPreview(r), at: h.at } : null;
    })
    .filter(Boolean);

  const events = db.events.filter((e) => new Date(e.endsAt) > new Date());

  return NextResponse.json({ publicAreas, popular, history, events, homeRoomId: u.ownedRoomIds[0] });
}
