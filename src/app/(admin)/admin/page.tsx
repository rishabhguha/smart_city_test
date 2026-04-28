export const dynamic = "force-dynamic";

import { db } from "@/db";
import { users, departments, serviceRequests } from "@/db/schema";
import { getDbUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { UserRoleForm } from "./users/UserRoleForm";

export default async function AdminDashboardPage() {
  const dbUser = await getDbUser();
  if (!dbUser || dbUser.role !== "admin") redirect("/dashboard");

  const [allUsers, allDepts, totalRequests] = await Promise.all([
    db.select().from(users),
    db.select().from(departments),
    db.select().from(serviceRequests),
  ]);

  const deptMap = Object.fromEntries(allDepts.map((d) => [d.id, d.name]));

  const stats = [
    { label: "Total Users", value: allUsers.length },
    { label: "Departments", value: allDepts.length },
    { label: "Total Requests", value: totalRequests.length },
  ];

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <p className="text-sm text-gray-500 mb-0.5">Administrator</p>
        <h1 className="text-2xl font-bold text-gray-900">Welcome back, {dbUser.name.split(" ")[0]}</h1>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {stats.map(({ label, value }) => (
          <Card key={label}>
            <CardContent className="pt-4 pb-3">
              <p className="text-2xl font-bold text-gray-900">{value}</p>
              <p className="text-sm text-gray-500">{label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Users ({allUsers.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Username</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allUsers.map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="font-medium">{u.name}</TableCell>
                  <TableCell className="text-sm text-gray-500">@{u.username}</TableCell>
                  <TableCell>
                    <Badge
                      className={
                        u.role === "admin"
                          ? "bg-purple-100 text-purple-800"
                          : u.role === "staff"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-gray-100 text-gray-700"
                      }
                    >
                      {u.role}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {u.departmentId ? (deptMap[u.departmentId] ?? "—") : "—"}
                  </TableCell>
                  <TableCell>
                    <UserRoleForm
                      userId={u.id}
                      currentRole={u.role}
                      currentDept={u.departmentId ?? ""}
                      departments={allDepts}
                    />
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
