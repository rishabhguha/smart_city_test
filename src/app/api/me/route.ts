import { NextResponse } from "next/server";
import { syncUser, getDbUser } from "@/lib/auth";

export async function GET() {
  const user = await getDbUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  return NextResponse.json(user);
}

export async function POST() {
  const user = await syncUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  return NextResponse.json(user);
}
