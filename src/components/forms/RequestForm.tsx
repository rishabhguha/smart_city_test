"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LocationPicker } from "@/components/map/LocationPicker";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, X } from "lucide-react";
import { useUser } from "@clerk/nextjs";

interface Category {
  id: string;
  name: string;
  departmentName: string | null;
}

export function RequestForm() {
  const { user } = useUser();
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  const [form, setForm] = useState({
    citizenName: user?.fullName ?? "",
    categoryId: "",
    title: "",
    description: "",
    address: "",
    lat: 0,
    lng: 0,
  });

  useEffect(() => {
    if (user) {
      setForm((f) => ({
        ...f,
        citizenName: user.fullName ?? "",
      }));
    }
  }, [user]);

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.ok ? r.json() : [])
      .then(setCategories)
      .catch(console.error);
  }, []);

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const errors = {
    citizenName: !form.citizenName.trim(),
    categoryId: !form.categoryId,
    title: !form.title.trim(),
    description: !form.description.trim(),
    address: !form.address,
  };

  const hasErrors = Object.values(errors).some(Boolean);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    if (hasErrors) return;

    setLoading(true);
    try {
      let photoUrl: string | null = null;
      if (photoFile) {
        const fd = new FormData();
        fd.append("file", photoFile);
        const uploadRes = await fetch("/api/upload", { method: "POST", body: fd });
        const uploadData = await uploadRes.json();
        if (!uploadRes.ok) throw new Error(uploadData.error ?? "Upload failed");
        photoUrl = uploadData.url;
      }

      const res = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, photoUrl }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Submission failed");

      toast.success("Request submitted successfully!");
      router.push(`/track/${data.id}`);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Submit a Service Request</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1">
            <Label htmlFor="citizenName">Your Name</Label>
            <Input
              id="citizenName"
              value={form.citizenName}
              onChange={(e) => setForm({ ...form, citizenName: e.target.value })}
              className={submitted && errors.citizenName ? "border-red-500 focus-visible:ring-red-500" : ""}
            />
            {submitted && errors.citizenName && (
              <p className="text-xs text-red-500">Name is required</p>
            )}
          </div>

          <div className="space-y-1">
            <Label>Category</Label>
            <Select
              value={form.categoryId}
              onValueChange={(v) => v !== null && setForm({ ...form, categoryId: v })}
            >
              <SelectTrigger className={submitted && errors.categoryId ? "border-red-500 focus-visible:ring-red-500" : ""}>
                <SelectValue placeholder="Select a category...">
                  {(value: string) => value ? (categories.find((c) => c.id === value)?.name ?? value) : undefined}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                    {cat.departmentName && (
                      <span className="text-gray-400 ml-2 text-xs">({cat.departmentName})</span>
                    )}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {submitted && errors.categoryId && (
              <p className="text-xs text-red-500">Please select a category</p>
            )}
          </div>

          <div className="space-y-1">
            <Label htmlFor="title">Short Title</Label>
            <Input
              id="title"
              maxLength={120}
              placeholder="e.g. Large pothole on Main St near the library"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className={submitted && errors.title ? "border-red-500 focus-visible:ring-red-500" : ""}
            />
            {submitted && errors.title && (
              <p className="text-xs text-red-500">Title is required</p>
            )}
          </div>

          <div className="space-y-1">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              rows={3}
              placeholder="Describe the issue in detail..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className={submitted && errors.description ? "border-red-500 focus-visible:ring-red-500" : ""}
            />
            {submitted && errors.description && (
              <p className="text-xs text-red-500">Description is required</p>
            )}
          </div>

          <div className="space-y-1">
            <Label>Location</Label>
            <LocationPicker
              onLocationChange={(lat, lng, address) =>
                setForm((f) => ({ ...f, lat, lng, address }))
              }
            />
            {form.address
              ? <p className="text-xs text-green-700 mt-1">Selected: {form.address}</p>
              : submitted && errors.address && (
                  <p className="text-xs text-red-500">Please select a location on the map</p>
                )
            }
          </div>

          <div className="space-y-1">
            <Label>Photo (optional)</Label>
            {photoPreview ? (
              <div className="relative w-40">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={photoPreview} alt="Preview" className="rounded-md border w-40 h-28 object-cover" />
                <button
                  type="button"
                  className="cursor-pointer absolute top-1 right-1 bg-white rounded-full p-0.5 shadow"
                  onClick={() => { setPhotoPreview(null); setPhotoFile(null); }}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="cursor-pointer flex items-center gap-2 border-2 border-dashed rounded-md px-4 py-6 w-full text-gray-500 hover:text-gray-700 hover:border-gray-400 transition"
              >
                <Upload className="w-5 h-5" />
                <span className="text-sm">Click to upload photo</span>
              </button>
            )}
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Submitting..." : "Submit Request"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
