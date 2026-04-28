export const dynamic = "force-dynamic";

import { db } from "@/db";
import { departments, categories } from "@/db/schema";
import { eq } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AddDepartmentForm } from "./AddDepartmentForm";

export default async function DepartmentsPage() {
  const allDepts = await db.select().from(departments);
  const allCats = await db.select().from(categories);

  const catsByDept = allCats.reduce<Record<string, typeof allCats>>((acc, c) => {
    acc[c.departmentId] = [...(acc[c.departmentId] ?? []), c];
    return acc;
  }, {});

  return (
    <div className="max-w-4xl space-y-6">
      <h1 className="text-2xl font-bold">Departments & Categories</h1>

      <AddDepartmentForm />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Departments</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email Alias</TableHead>
                <TableHead>Categories</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allDepts.map((d) => (
                <TableRow key={d.id}>
                  <TableCell className="font-medium">{d.name}</TableCell>
                  <TableCell className="text-sm text-gray-500">{d.emailAlias}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {(catsByDept[d.id] ?? []).map((c) => (
                        <Badge key={c.id} variant="outline" className="text-xs">{c.name}</Badge>
                      ))}
                    </div>
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
