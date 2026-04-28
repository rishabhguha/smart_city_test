import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

// Clerk sends a user.created webhook when a new user signs up.
// This creates the corresponding DB user row with the citizen role.
export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();
    const { type, data } = payload;

    if (type !== "user.created") {
      return NextResponse.json({ received: true });
    }

    const { id, username, first_name, last_name } = data;
    const resolvedUsername = username ?? id;
    const name = `${first_name ?? ""} ${last_name ?? ""}`.trim() || resolvedUsername;

    const existing = await db.select().from(users).where(eq(users.id, id));
    if (existing.length === 0) {
      await db.insert(users).values({ id, username: resolvedUsername, name, role: "citizen" }).onConflictDoNothing();
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("Webhook error:", err);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
