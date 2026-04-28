export const dynamic = "force-dynamic";

import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { serviceRequests, categories } from "@/db/schema";
import { eq } from "drizzle-orm";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { STATUS_LABELS, STATUS_COLORS } from "@/lib/status";
import { FileText, Plus, ChevronRight } from "lucide-react";
import type { Status } from "@/db/schema";

export default async function CitizenHomePage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const [clerkUser, allRequests, allCategories] = await Promise.all([
    currentUser(),
    db.select().from(serviceRequests).where(eq(serviceRequests.citizenId, userId)),
    db.select().from(categories),
  ]);

  const categoryMap = Object.fromEntries(allCategories.map((c) => [c.id, c.name]));
  const sorted = allRequests.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  const recent = sorted.slice(0, 3);

  const counts: Record<Status | "total", number> = {
    total: allRequests.length,
    open: allRequests.filter((r) => r.status === "open").length,
    in_progress: allRequests.filter((r) => r.status === "in_progress").length,
    resolved: allRequests.filter((r) => r.status === "resolved").length,
    closed: allRequests.filter((r) => r.status === "closed").length,
  };

  const firstName = clerkUser?.firstName ?? clerkUser?.fullName?.split(" ")[0] ?? "there";

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 space-y-8">
      <div>
        <p className="text-sm text-gray-500 mb-0.5">Citizen Portal</p>
        <h1 className="text-2xl font-bold text-gray-900">Welcome back, {firstName}</h1>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {(
          [
            { key: "total", label: "Total" },
            { key: "open", label: "Open" },
            { key: "in_progress", label: "In Progress" },
            { key: "resolved", label: "Resolved" },
          ] as { key: Status | "total"; label: string }[]
        ).map(({ key, label }) => (
          <Card key={key}>
            <CardContent className="pt-4 pb-3">
              <p className="text-2xl font-bold text-gray-900">{counts[key]}</p>
              <p className="text-sm text-gray-500">{label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex gap-3">
        <Link href="/submit">
          <Button>
            <Plus className="w-4 h-4 mr-1.5" />
            Submit a Request
          </Button>
        </Link>
        <Link href="/my-requests">
          <Button variant="outline">My Requests</Button>
        </Link>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-gray-900">Recent Requests</h2>
          {sorted.length > 3 && (
            <Link href="/my-requests" className="text-sm text-blue-600 hover:underline flex items-center gap-0.5">
              View all <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>

        {recent.length === 0 ? (
          <div className="text-center py-12 border rounded-lg bg-white text-gray-400">
            <FileText className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p className="text-sm font-medium">No requests yet</p>
            <p className="text-xs mt-1">Submit your first city issue and it will appear here.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {recent.map((r) => (
              <Link key={r.id} href={`/track/${r.id}?from=my-requests`}>
                <Card className="hover:shadow-sm transition-shadow cursor-pointer">
                  <CardContent className="p-4 flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-gray-900 truncate">{r.title}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {categoryMap[r.categoryId] ?? "—"} ·{" "}
                        {r.createdAt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </p>
                    </div>
                    <Badge className={STATUS_COLORS[r.status]}>{STATUS_LABELS[r.status]}</Badge>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
