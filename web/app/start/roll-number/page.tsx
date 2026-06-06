import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { getSession } from "@/lib/auth/session";
import { RollNumberForm } from "./form";

export default async function RollNumberPage() {
  const user = await getSession();
  if (!user) redirect("/start");

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-10">
      <Link href="/" className="text-muted mb-8 text-xs tracking-widest uppercase">
        ← Back
      </Link>
      <p className="text-accent mb-3 font-mono text-xs tracking-widest uppercase">
        Complete your profile
      </p>
      <h1 className="text-3xl font-semibold tracking-tight">Enter your roll number</h1>
      <p className="text-muted mt-2 mb-8 text-sm">
        We need your unique roll number (student ID) to complete your enrollment. This must be
        unique among all students in your cohort.
      </p>
      <Suspense fallback={null}>
        <RollNumberForm />
      </Suspense>
    </main>
  );
}
