"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Status, User } from "@/db/schema";

interface Props {
  requestId: string;
  currentStatus: Status;
  currentPriority: string;
  currentAssignedTo: string;
  staff: User[];
}

export function StatusUpdateForm({ requestId, currentStatus, currentPriority, currentAssignedTo, staff }: Props) {
  const router = useRouter();
  const [status, setStatus] = useState<string>(currentStatus);
  const [priority, setPriority] = useState(currentPriority);
  const [assignedTo, setAssignedTo] = useState(currentAssignedTo);
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/requests/${requestId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, priority, assignedTo: assignedTo || null, note: note || undefined }),
      });
      if (!res.ok) throw new Error("Update failed");
      toast.success("Request updated.");
      setNote("");
      router.refresh();
    } catch {
      toast.error("Failed to save changes.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Update Request</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1">
          <Label>Status</Label>
          <Select value={status} onValueChange={(v) => v !== null && setStatus(v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <Label>Priority</Label>
          <Select value={priority} onValueChange={(v) => v !== null && setPriority(v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {staff.length > 0 && (
          <div className="space-y-1">
            <Label>Assigned To</Label>
            <Select value={assignedTo || "none"} onValueChange={(v) => v !== null && setAssignedTo(v === "none" ? "" : v)}>
              <SelectTrigger>
                <SelectValue placeholder="Unassigned">
                  {(value: string) => value === "none" || !value ? "Unassigned" : (staff.find((s) => s.id === value)?.name ?? value)}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Unassigned</SelectItem>
                {staff.map((s) => (
                  <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="space-y-1">
          <Label>Note (optional)</Label>
          <Textarea
            rows={2}
            placeholder="Add a note for the citizen..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>

        <Button onClick={handleSave} disabled={saving} className="w-full">
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </CardContent>
    </Card>
  );
}
