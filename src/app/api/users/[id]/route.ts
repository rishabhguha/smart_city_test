import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getDbUser } from "@/lib/auth";
import type { Role } from "@/db/schema";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getDbUser();
  if (!admin || admin.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const { role, departmentId } = await req.json();

  if (role === 'staff' && !departmentId) {
    return NextResponse.json({ error: 'Department is required for staff' }, { status: 400 });
  }

  const updates: Partial<typeof users.$inferInsert> = {};
  if (role) updates.role = role as Role;
  if (departmentId !== undefined) updates.departmentId = departmentId;

  const [updated] = await db
    .update(users)
    .set(updates)
    .where(eq(users.id, id))
    .returning();

  if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(updated);
}
