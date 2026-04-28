export const dynamic = "force-dynamic";

import { RequestForm } from "@/components/forms/RequestForm";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function SubmitPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  return (
    <div className="bg-gray-50 min-h-[calc(100vh-3.5rem)]">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Report a City Issue</h1>
          <p className="text-gray-500">
            Use this form to report non-emergency issues — potholes, streetlight outages, graffiti, and more.
            Your request is automatically routed to the right city department.
          </p>
        </div>
        <RequestForm />
      </div>
    </div>
  );
}
