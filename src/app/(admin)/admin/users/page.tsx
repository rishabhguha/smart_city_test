export const dynamic = "force-dynamic";

import { db } from "@/db";
import { users, departments } from "@/db/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { UserRoleForm } from "./UserRoleForm";

export default async function UsersPage() {
  const allUsers = await db.select().from(users);
  const allDepts = await db.select().from(departments);

  const deptMap = Object.fromEntries(allDepts.map((d) => [d.id, d.name]));

  return (
    <div className="max-w-4xl space-y-6">
      <h1 className="text-2xl font-bold">User Management</h1>
      <p className="text-sm text-gray-500">
        Users register via the citizen portal. Use this page to promote them to staff or admin roles.
      </p>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">All Users ({allUsers.length})</CardTitle>
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
                    {u.departmentId ? deptMap[u.departmentId] ?? "—" : "—"}
                  </TableCell>
                  <TableCell>
                    <UserRoleForm userId={u.id} currentRole={u.role} currentDept={u.departmentId ?? ""} departments={allDepts} />
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
