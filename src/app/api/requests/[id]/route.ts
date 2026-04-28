import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { serviceRequests, statusHistory, categories, departments } from "@/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";
import { getDbUser } from "@/lib/auth";
import type { Status } from "@/db/schema";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const [request] = await db
      .select()
      .from(serviceRequests)
      .where(eq(serviceRequests.id, id));

    if (!request) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const [category] = await db.select().from(categories).where(eq(categories.id, request.categoryId));
    const [department] = await db.select().from(departments).where(eq(departments.id, request.departmentId));
    const history = await db
      .select()
      .from(statusHistory)
      .where(eq(statusHistory.requestId, id));

    return NextResponse.json({
      ...request,
      categoryName: category?.name ?? "",
      departmentName: department?.name ?? "",
      history: history.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime()),
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const dbUser = await getDbUser();
    if (!dbUser || dbUser.role === "citizen") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();
    const { status, priority, assignedTo, note } = body;

    const [existing] = await db
      .select()
      .from(serviceRequests)
      .where(eq(serviceRequests.id, id));

    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const updates: Partial<typeof serviceRequests.$inferInsert> = {
      updatedAt: new Date(),
    };
    if (status) updates.status = status as Status;
    if (priority) updates.priority = priority;
    if (assignedTo !== undefined) updates.assignedTo = assignedTo;

    const [updated] = await db
      .update(serviceRequests)
      .set(updates)
      .where(eq(serviceRequests.id, id))
      .returning();

    if (status && status !== existing.status) {
      await db.insert(statusHistory).values({
        requestId: id,
        oldStatus: existing.status,
        newStatus: status as Status,
        changedBy: userId,
        note: note ?? null,
      });
    }

    return NextResponse.json(updated);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
