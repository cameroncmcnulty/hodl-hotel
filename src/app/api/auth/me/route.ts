import { NextResponse } from "next/server";
import { sessionUserId } from "@/lib/session";
import { findUser, loadDB, occupantCount, publicUser, reloadDB } from "@/lib/store";

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
  return NextResponse.json({
    user: { ...publicUser(u), email: u.email },
    settings: db.settings,
    homeRoomId: u.ownedRoomIds[0],
    onlineFriends: u.friends.filter((fid) => {
      return db.rooms.some((r) => occupantCount(r.id) >= 0) && true;
    }),
  });
}
