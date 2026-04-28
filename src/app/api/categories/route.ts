import { NextResponse } from "next/server";
import { db } from "@/db";
import { categories, departments } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  const cats = await db
    .select({
      id: categories.id,
      name: categories.name,
      departmentId: categories.departmentId,
      departmentName: departments.name,
      slaHours: categories.slaHours,
    })
    .from(categories)
    .leftJoin(departments, eq(categories.departmentId, departments.id));

  return NextResponse.json(cats);
}
