"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import type { Department } from "@/db/schema";

interface Props {
  userId: string;
  currentRole: string;
  currentDept: string;
  departments: Department[];
}

export function UserRoleForm({ userId, currentRole, currentDept, departments }: Props) {
  const router = useRouter();
  const [role, setRole] = useState(currentRole);
  const [dept, setDept] = useState(currentDept || "none");
  const [saving, setSaving] = useState(false);

  const staffNeedsDept = role === 'staff' && dept === 'none';

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role, departmentId: dept === "none" ? null : dept }),
      });
      if (!res.ok) throw new Error("Update failed");
      toast.success("User updated.");
      router.refresh();
    } catch {
      toast.error("Failed to update user.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex gap-2 items-center">
      <Select value={role} onValueChange={(v) => v !== null && setRole(v)}>
        <SelectTrigger className="w-28 h-7 text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="citizen">citizen</SelectItem>
          <SelectItem value="staff">staff</SelectItem>
          <SelectItem value="admin">admin</SelectItem>
        </SelectContent>
      </Select>

      {role === "staff" && (
        <Select value={dept} onValueChange={(v) => v !== null && setDept(v)}>
          <SelectTrigger className="w-36 h-7 text-xs">
            <SelectValue placeholder="Department">
              {(value: string) => value === "none" || !value ? "No dept" : (departments.find((d) => d.id === value)?.name ?? value)}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">No dept</SelectItem>
            {departments.map((d) => (
              <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      <div className='flex flex-col gap-0.5'>
        <Button size='sm' variant='outline' className='h-7 text-xs' onClick={handleSave} disabled={saving || staffNeedsDept}>
          {saving ? '...' : 'Save'}
        </Button>
        {staffNeedsDept && <p className='text-xs text-red-500'>Dept required</p>}
      </div>
    </div>
  );
}
