import { NavBar } from "@/components/NavBar";
import { requireRole } from "@/lib/auth";
import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";

export default async function StaffLayout({ children }: { children: React.ReactNode }) {
  try {
    await requireRole("staff", "admin");
  } catch {
    redirect("/sign-in");
  }

  const user = await currentUser();

  return (
    <>
      <NavBar isSignedIn={true} userImageUrl={user?.imageUrl} />
      <main className="flex-1 bg-gray-50">{children}</main>
    </>
  );
}
