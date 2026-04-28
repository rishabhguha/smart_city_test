import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { departments } from "@/db/schema";
import { getDbUser } from "@/lib/auth";

export async function GET() {
  const all = await db.select().from(departments);
  return NextResponse.json(all);
}

export async function POST(req: NextRequest) {
  const user = await getDbUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { name, emailAlias } = await req.json();
  if (!name || !emailAlias) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const [created] = await db.insert(departments).values({ name, emailAlias }).returning();
  return NextResponse.json(created, { status: 201 });
}
