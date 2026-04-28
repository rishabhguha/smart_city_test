import { auth, currentUser } from "@clerk/nextjs/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import type { Role } from "@/db/schema";

export async function getDbUser() {
  const { userId } = await auth();
  if (!userId) return null;
  const [user] = await db.select().from(users).where(eq(users.id, userId));
  return user ?? null;
}

export async function requireRole(...roles: Role[]) {
  const user = await getDbUser();
  if (!user || !roles.includes(user.role)) {
    throw new Error("Unauthorized");
  }
  return user;
}

export async function syncUser() {
  const { userId } = await auth();
  if (!userId) return null;
  const clerkUser = await currentUser();
  if (!clerkUser) return null;

  const username = clerkUser.username ?? clerkUser.id;
  const name = `${clerkUser.firstName ?? ""} ${clerkUser.lastName ?? ""}`.trim() || username;

  const existing = await db.select().from(users).where(eq(users.id, userId));
  if (existing.length > 0) return existing[0];

  const [created] = await db
    .insert(users)
    .values({ id: userId, username, name, role: "citizen" })
    .returning();
  return created;
}
