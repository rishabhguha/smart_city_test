import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { serviceRequests, categories, statusHistory } from "@/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { citizenName, categoryId, title, description, address, lat, lng, photoUrl } = body;

    if (!citizenName || !categoryId || !title || !description || !address) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const [category] = await db
      .select()
      .from(categories)
      .where(eq(categories.id, categoryId));

    if (!category) {
      return NextResponse.json({ error: "Invalid category" }, { status: 400 });
    }

    const { userId } = await auth();

    const [request] = await db
      .insert(serviceRequests)
      .values({
        citizenName,
        citizenId: userId ?? null,
        categoryId,
        departmentId: category.departmentId,
        title,
        description,
        address,
        lat: lat ? parseFloat(lat) : null,
        lng: lng ? parseFloat(lng) : null,
        photoUrl: photoUrl ?? null,
        status: "open",
        priority: "medium",
      })
      .returning();

    await db.insert(statusHistory).values({
      requestId: request.id,
      oldStatus: null,
      newStatus: "open",
      changedBy: null,
      note: "Request submitted",
    });

    return NextResponse.json({ id: request.id }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const departmentId = searchParams.get("departmentId");

    const all = await db.select().from(serviceRequests);
    const filtered = all.filter((r) => {
      if (status && r.status !== status) return false;
      if (departmentId && r.departmentId !== departmentId) return false;
      return true;
    });

    return NextResponse.json(filtered.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()));
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
