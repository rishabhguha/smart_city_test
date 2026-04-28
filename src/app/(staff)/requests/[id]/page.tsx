export const dynamic = "force-dynamic";

import { notFound, redirect } from "next/navigation";
import { db } from "@/db";
import { serviceRequests, categories, departments, statusHistory, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { STATUS_LABELS, STATUS_COLORS, PRIORITY_LABELS, PRIORITY_COLORS } from "@/lib/status";
import { MapPin, Building2, Tag, Clock, User } from "lucide-react";
import { getDbUser } from "@/lib/auth";
import { StatusUpdateForm } from "./StatusUpdateForm";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function RequestDetailPage({ params }: Props) {
  const dbUser = await getDbUser();
  if (!dbUser) redirect("/sign-in");

  const { id } = await params;

  const [request] = await db
    .select()
    .from(serviceRequests)
    .where(eq(serviceRequests.id, id));

  if (!request) notFound();

  const [[category], [department], history, allUsersInDept] = await Promise.all([
    db.select().from(categories).where(eq(categories.id, request.categoryId)),
    db.select().from(departments).where(eq(departments.id, request.departmentId)),
    db.select().from(statusHistory).where(eq(statusHistory.requestId, id)),
    db.select().from(users).where(eq(users.departmentId, request.departmentId)),
  ]);
  const allStaff = allUsersInDept.filter((u) => u.role !== "citizen");

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 mb-1">Request #{id.slice(-8).toUpperCase()}</p>
          <h1 className="text-2xl font-bold text-gray-900">{request.title}</h1>
        </div>
        <div className="flex gap-2">
          <Badge className={STATUS_COLORS[request.status]}>{STATUS_LABELS[request.status]}</Badge>
          <Badge className={PRIORITY_COLORS[request.priority]} variant="outline">
            {PRIORITY_LABELS[request.priority]}
          </Badge>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="flex gap-2">
              <User className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
              <div>
                <p className="font-medium">{request.citizenName}</p>
                <p className="text-gray-500">{request.citizenEmail}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Tag className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
              <div>
                <p className="font-medium">{category?.name}</p>
                <p className="text-gray-500">Category</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Building2 className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
              <div>
                <p className="font-medium">{department?.name}</p>
                <p className="text-gray-500">Department</p>
              </div>
            </div>
            <div className="flex gap-2">
              <MapPin className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
              <div>
                <p className="font-medium">{request.address}</p>
                {request.lat && request.lng && (
                  <p className="text-gray-500 text-xs">{request.lat.toFixed(5)}, {request.lng.toFixed(5)}</p>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <Clock className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
              <div>
                <p className="font-medium">
                  {request.createdAt.toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
                <p className="text-gray-500">Submitted</p>
              </div>
            </div>
            <Separator />
            <p className="text-gray-700">{request.description}</p>
            {request.photoUrl && (
              <>
                <Separator />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={request.photoUrl}
                  alt="Submitted photo"
                  className="rounded-md border max-h-56 object-cover w-full"
                />
              </>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <StatusUpdateForm
            requestId={id}
            currentStatus={request.status}
            currentPriority={request.priority}
            currentAssignedTo={request.assignedTo ?? ""}
            staff={allStaff}
          />

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Activity Log</CardTitle>
            </CardHeader>
            <CardContent>
              {history.length === 0 && (
                <p className="text-sm text-gray-400">No history yet.</p>
              )}
              <ol className="space-y-4">
                {history
                  .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
                  .map((h) => (
                    <li key={h.id} className="flex gap-3 text-sm">
                      <span className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                      <div>
                        <p className="font-medium text-gray-900">
                          → <span className="text-blue-700">{STATUS_LABELS[h.newStatus]}</span>
                        </p>
                        {h.note && <p className="text-gray-500 mt-0.5">{h.note}</p>}
                        <p className="text-gray-400 text-xs mt-0.5">
                          {h.createdAt.toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </li>
                  ))}
              </ol>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
