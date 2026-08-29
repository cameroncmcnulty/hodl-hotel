import { sessionUserId } from "./session";
import { findUser, loadDB } from "./store";
import type { User } from "./types";

export async function requireAdmin(): Promise<{ user: User } | null> {
  const id = await sessionUserId();
  if (!id) return null;
  const db = loadDB();
  const user = findUser(db, id);
  if (!user || user.role !== "admin") return null;
  return { user };
}
