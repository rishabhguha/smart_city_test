export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { db } from "@/db";
import { serviceRequests, categories, departments, statusHistory } from "@/db/schema";
import { eq } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { STATUS_LABELS, STATUS_COLORS, PRIORITY_LABELS, PRIORITY_COLORS } from "@/lib/status";
import { MapPin, Clock, Building2, Tag, CheckCircle2, Circle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { Status } from "@/db/schema";

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ from?: string }>;
}

const STEPS: Status[] = ["open", "in_progress", "resolved", "closed"];

export default async function TrackPage({ params, searchParams }: Props) {
  const { id } = await params;

  const [request] = await db
    .select()
    .from(serviceRequests)
    .where(eq(serviceRequests.id, id));

  if (!request) notFound();

  const [[category], [department], history] = await Promise.all([
    db.select().from(categories).where(eq(categories.id, request.categoryId)),
    db.select().from(departments).where(eq(departments.id, request.departmentId)),
    db.select().from(statusHistory).where(eq(statusHistory.requestId, id)),
  ]);

  const currentStepIndex = STEPS.indexOf(request.status);
  const { from } = await searchParams;

  return (
    <div className="max-w-2xl mx-auto px-4 py-10 space-y-6">
      {from === "my-requests" && (
        <Link
          href="/my-requests"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to My Requests
        </Link>
      )}
      <div>
        <p className="text-sm text-gray-500 mb-1">Request #{id.slice(-8).toUpperCase()}</p>
        <h1 className="text-2xl font-bold text-gray-900">{request.title}</h1>
      </div>

      {/* Status progress */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 mb-6">
            <Badge className={STATUS_COLORS[request.status]}>
              {STATUS_LABELS[request.status]}
            </Badge>
            <Badge className={PRIORITY_COLORS[request.priority]} variant="outline">
              {PRIORITY_LABELS[request.priority]} Priority
            </Badge>
          </div>

          <ol className="relative border-l border-gray-200 ml-3 space-y-6">
            {STEPS.map((step, i) => {
              const done = i <= currentStepIndex;
              const active = i === currentStepIndex;
              return (
                <li key={step} className="ml-6">
                  <span className={`absolute -left-3.5 flex items-center justify-center w-7 h-7 rounded-full ring-4 ring-white ${done ? "bg-blue-600" : "bg-gray-100"}`}>
                    {done ? (
                      <CheckCircle2 className="w-4 h-4 text-white" />
                    ) : (
                      <Circle className="w-4 h-4 text-gray-400" />
                    )}
                  </span>
                  <p className={`font-medium ${active ? "text-blue-700" : done ? "text-gray-900" : "text-gray-400"}`}>
                    {STATUS_LABELS[step]}
                  </p>
                </li>
              );
            })}
          </ol>
        </CardContent>
      </Card>

      {/* Details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Request Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2 text-sm">
            <Tag className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
            <div>
              <p className="font-medium text-gray-700">{category?.name}</p>
              <p className="text-gray-500">Category</p>
            </div>
          </div>
          <div className="flex gap-2 text-sm">
            <Building2 className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
            <div>
              <p className="font-medium text-gray-700">{department?.name}</p>
              <p className="text-gray-500">Assigned Department</p>
            </div>
          </div>
          <div className="flex gap-2 text-sm">
            <MapPin className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
            <div>
              <p className="font-medium text-gray-700">{request.address}</p>
              <p className="text-gray-500">Location</p>
            </div>
          </div>
          <div className="flex gap-2 text-sm">
            <Clock className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
            <div>
              <p className="font-medium text-gray-700">
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
          <p className="text-sm text-gray-700">{request.description}</p>

          {request.photoUrl && (
            <>
              <Separator />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={request.photoUrl}
                alt="Submitted photo"
                className="rounded-md border max-h-64 object-cover w-full"
              />
            </>
          )}
        </CardContent>
      </Card>

      {/* Activity log */}
      {history.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Activity Log</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="space-y-4">
              {history
                .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
                .map((h) => (
                  <li key={h.id} className="flex gap-3 text-sm">
                    <span className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                    <div>
                      <p className="font-medium text-gray-900">
                        Status changed to{" "}
                        <span className="text-blue-700">{STATUS_LABELS[h.newStatus]}</span>
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
      )}
    </div>
  );
}
