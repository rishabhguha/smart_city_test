"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export function AddDepartmentForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [emailAlias, setEmailAlias] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/departments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, emailAlias }),
      });
      if (!res.ok) throw new Error("Failed");
      toast.success("Department created.");
      setName("");
      setEmailAlias("");
      router.refresh();
    } catch {
      toast.error("Failed to create department.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Add Department</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex gap-3 items-end">
          <div className="space-y-1 flex-1">
            <Label>Name</Label>
            <Input required value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Public Works" />
          </div>
          <div className="space-y-1 flex-1">
            <Label>Email Alias</Label>
            <Input required value={emailAlias} onChange={(e) => setEmailAlias(e.target.value)} placeholder="publicworks@city.gov" />
          </div>
          <Button type="submit" disabled={saving}>{saving ? "Adding..." : "Add"}</Button>
        </form>
      </CardContent>
    </Card>
  );
}
