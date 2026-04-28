import { NavBar } from "@/components/NavBar";
import { requireRole } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Users, Building2, LayoutDashboard } from "lucide-react";
import { currentUser } from "@clerk/nextjs/server";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const [dbUser, user] = await Promise.all([
    requireRole("admin").catch(() => null),
    currentUser(),
  ]);

  if (!dbUser) redirect("/dashboard");

  return (
    <>
      <NavBar isSignedIn={true} userImageUrl={user?.imageUrl} />
      <div className="flex flex-1">
        <aside className="w-52 bg-white border-r min-h-screen pt-6">
          <nav className="space-y-1 px-3">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-2 mb-3">Admin</p>
            <Link href="/admin" className="flex items-center gap-2 px-2 py-2 rounded text-sm text-gray-700 hover:bg-gray-100">
              <LayoutDashboard className="w-4 h-4" /> Dashboard
            </Link>
            <Link href="/admin/departments" className="flex items-center gap-2 px-2 py-2 rounded text-sm text-gray-700 hover:bg-gray-100">
              <Building2 className="w-4 h-4" /> Departments
            </Link>
            <Link href="/admin/users" className="flex items-center gap-2 px-2 py-2 rounded text-sm text-gray-700 hover:bg-gray-100">
              <Users className="w-4 h-4" /> Users
            </Link>
          </nav>
        </aside>
        <main className="flex-1 bg-gray-50 p-8">{children}</main>
      </div>
    </>
  );
}
