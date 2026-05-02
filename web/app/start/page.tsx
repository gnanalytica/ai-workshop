import Link from "next/link";
import { Suspense } from "react";
import { StartForm } from "./form";

export default function StartPage(props: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6">
      <Link href="/" className="text-muted mb-8 text-xs tracking-widest uppercase">
        ← Back
      </Link>
      <p className="text-accent mb-3 font-mono text-xs tracking-widest uppercase">
        Enroll · Sign in
      </p>
      <h1 className="text-3xl font-semibold tracking-tight">Get started</h1>
      <p className="text-muted mt-2 mb-8 text-sm">
        Sign in with Google for the fastest, most reliable access. New here?
        You&apos;ll need an invite code from your cohort admin — use the email
        option below to start sign-up.
      </p>
      <Suspense fallback={null}>
        <StartFormWrapper searchParams={props.searchParams} />
      </Suspense>
    </main>
  );
}

async function StartFormWrapper({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const params = await searchParams;
  return <StartForm next={params.next ?? "/dashboard"} initialError={params.error} />;
}
