import { NextResponse } from "next/server";
import { sessionJson, sessionUserId } from "@/lib/session";
import { findUser, loadDB, occupantCount, publicUser, reloadDB } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET() {
  const id = await sessionUserId();
  if (!id) return NextResponse.json({ user: null });
  let db = loadDB();
  let u = findUser(db, id);
  if (!u) {
    db = reloadDB();
    u = findUser(db, id);
  }
  if (!u) return NextResponse.json({ user: null });
  return sessionJson(
    {
      user: { ...publicUser(u), email: u.email },
      settings: db.settings,
      homeRoomId: u.ownedRoomIds[0],
      onlineFriends: u.friends.filter(() => true),
    },
    id
  );
}
