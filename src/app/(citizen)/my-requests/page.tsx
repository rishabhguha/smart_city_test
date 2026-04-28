export const dynamic = "force-dynamic";

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { serviceRequests, categories, departments } from "@/db/schema";
import { eq } from "drizzle-orm";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { STATUS_LABELS, STATUS_COLORS, PRIORITY_COLORS, PRIORITY_LABELS } from "@/lib/status";
import { MapPin, Clock, ChevronRight, Plus } from "lucide-react";

export default async function MyRequestsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const [allRequests, allCategories, allDepartments] = await Promise.all([
    db.select().from(serviceRequests).where(eq(serviceRequests.citizenId, userId)),
    db.select().from(categories),
    db.select().from(departments),
  ]);

  const categoryMap = Object.fromEntries(allCategories.map((c) => [c.id, c.name]));
  const deptMap = Object.fromEntries(allDepartments.map((d) => [d.id, d.name]));

  const sorted = allRequests.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Requests</h1>
          <p className="text-gray-500 text-sm mt-1">
            {sorted.length === 0 ? "No requests yet" : `${sorted.length} request${sorted.length === 1 ? "" : "s"} submitted`}
          </p>
        </div>
        <Link href="/submit">
          <Button size="sm">
            <Plus className="w-4 h-4 mr-1" />
            New Request
          </Button>
        </Link>
      </div>

      {sorted.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <MapPin className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p className="font-medium">No requests yet</p>
          <p className="text-sm mt-1">Submit your first issue and it will appear here.</p>
          <Link href="/submit" className="mt-4 inline-block">
            <Button variant="outline" size="sm">Report an Issue</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {sorted.map((r) => (
            <Link key={r.id} href={`/track/${r.id}?from=my-requests`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-mono text-gray-400">
                          #{r.id.slice(-8).toUpperCase()}
                        </span>
                        <Badge className={STATUS_COLORS[r.status]}>
                          {STATUS_LABELS[r.status]}
                        </Badge>
                        <Badge className={PRIORITY_COLORS[r.priority]} variant="outline">
                          {PRIORITY_LABELS[r.priority]}
                        </Badge>
                      </div>
                      <p className="font-medium text-gray-900 truncate">{r.title}</p>
                      <div className="flex items-center gap-4 mt-1.5 text-xs text-gray-500">
                        <span>{categoryMap[r.categoryId] ?? "—"} · {deptMap[r.departmentId] ?? "—"}</span>
                      </div>
                      <div className="flex items-center gap-1 mt-1 text-xs text-gray-400">
                        <MapPin className="w-3 h-3 shrink-0" />
                        <span className="truncate">{r.address}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <div className="flex items-center gap-1 text-xs text-gray-400">
                        <Clock className="w-3 h-3" />
                        {r.createdAt.toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-300" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
