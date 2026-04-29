export const dynamic = "force-dynamic";

import { db } from "@/db";
import { serviceRequests, categories, departments } from "@/db/schema";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { STATUS_LABELS, STATUS_COLORS, PRIORITY_COLORS, PRIORITY_LABELS } from "@/lib/status";
import { getDbUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import type { Status } from "@/db/schema";

export default async function DashboardPage() {
  const dbUser = await getDbUser();
  if (!dbUser) redirect("/sign-in");

  const [allRequests, allCategories, allDepartments] = await Promise.all([
    db.select().from(serviceRequests),
    db.select().from(categories),
    db.select().from(departments),
  ]);

  const userDept = dbUser.departmentId
    ? allDepartments.find((d) => d.id === dbUser.departmentId) ?? null
    : null;

  const categoryMap = Object.fromEntries(allCategories.map((c) => [c.id, c.name]));
  const deptMap = Object.fromEntries(allDepartments.map((d) => [d.id, d.name]));

  const visibleRequests =
    dbUser.role === "staff" && dbUser.departmentId
      ? allRequests.filter((r) => r.departmentId === dbUser.departmentId)
      : allRequests;

  const filtered = visibleRequests
    .slice()
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  const counts = {
    open: visibleRequests.filter((r) => r.status === "open").length,
    in_progress: visibleRequests.filter((r) => r.status === "in_progress").length,
    resolved: visibleRequests.filter((r) => r.status === "resolved").length,
    closed: visibleRequests.filter((r) => r.status === "closed").length,
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      <div>
        <p className="text-sm text-gray-500 mb-0.5">
          {userDept ? `${userDept.name} Department` : dbUser.role === "admin" ? "Administrator" : "Staff"}
        </p>
        <h1 className="text-2xl font-bold text-gray-900">Welcome back, {dbUser.name.split(" ")[0]}</h1>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {(["open", "in_progress", "resolved", "closed"] as Status[]).map((s) => (
          <Card key={s}>
            <CardContent className="pt-4 pb-3">
              <p className="text-2xl font-bold">{counts[s]}</p>
              <p className="text-sm text-gray-500">{STATUS_LABELS[s]}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">All Requests</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-gray-400 py-8">
                    No requests found
                  </TableCell>
                </TableRow>
              )}
              {filtered.map((r) => (
                <TableRow key={r.id} className="hover:bg-gray-50">
                  <TableCell>
                    <Link href={`/requests/${r.id}`} className="font-mono text-xs text-blue-600 hover:underline">
                      #{r.id.slice(-8).toUpperCase()}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Link href={`/requests/${r.id}`} className="hover:underline font-medium text-sm">
                      {r.title}
                    </Link>
                  </TableCell>
                  <TableCell className="text-sm text-gray-600">{categoryMap[r.categoryId] ?? "—"}</TableCell>
                  <TableCell className="text-sm text-gray-600">{deptMap[r.departmentId] ?? "—"}</TableCell>
                  <TableCell>
                    <Badge className={STATUS_COLORS[r.status]}>{STATUS_LABELS[r.status]}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={PRIORITY_COLORS[r.priority]} variant="outline">
                      {PRIORITY_LABELS[r.priority]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-gray-500">
                    {r.createdAt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </TableCell>
                  <TableCell>
                    <Link
                      href={`/requests/${r.id}`}
                      className="inline-flex items-center px-3 py-1 rounded-md text-xs font-medium bg-gray-900 text-white hover:bg-gray-700 transition-colors"
                    >
                      Manage
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
