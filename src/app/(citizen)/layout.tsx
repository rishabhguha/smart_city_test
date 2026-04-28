import { NavBar } from "@/components/NavBar";
import { currentUser } from "@clerk/nextjs/server";

export default async function CitizenLayout({ children }: { children: React.ReactNode }) {
  const user = await currentUser();
  return (
    <>
      <NavBar isSignedIn={!!user} userImageUrl={user?.imageUrl} />
      <main className="flex-1">{children}</main>
    </>
  );
}
