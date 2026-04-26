import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { getSession } from "@/lib/auth/session";
import { ClaimForm } from "./form";

export default async function ClaimInvitePage() {
  const user = await getSession();
  if (!user) redirect("/start");

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-10">
      <Link href="/" className="text-muted mb-8 text-xs tracking-widest uppercase">
        ← Back
      </Link>
      <p className="text-accent mb-3 font-mono text-xs tracking-widest uppercase">
        One last step
      </p>
      <h1 className="text-3xl font-semibold tracking-tight">Enter your invite code</h1>
      <p className="text-muted mt-2 mb-8 text-sm">
        You&apos;re signed in as <span className="text-ink">{user.email}</span>. Pick your role
        and paste the invite code your admin shared with you.
      </p>
      <Suspense fallback={null}>
        <ClaimForm />
      </Suspense>
    </main>
  );
}
