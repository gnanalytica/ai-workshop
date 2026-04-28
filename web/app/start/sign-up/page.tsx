import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { SignUpForm } from "./form";

export default async function SignUpPage(props: {
  searchParams: Promise<{ email?: string }>;
}) {
  const params = await props.searchParams;
  const email = params.email?.trim().toLowerCase();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    redirect("/start");
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-10">
      <Link href="/start" className="text-muted mb-8 text-xs tracking-widest uppercase">
        ← Back
      </Link>
      <p className="text-accent mb-3 font-mono text-xs tracking-widest uppercase">Sign up</p>
      <h1 className="text-3xl font-semibold tracking-tight">Create your account</h1>
      <p className="text-muted mt-2 mb-8 text-sm">
        Signing up as <span className="text-ink">{email}</span>. Paste the invite code your
        admin shared — we&apos;ll set up the right access automatically.
      </p>
      <Suspense fallback={null}>
        <SignUpForm email={email} />
      </Suspense>
    </main>
  );
}
