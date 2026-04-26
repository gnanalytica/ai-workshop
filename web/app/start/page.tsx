import Link from "next/link";
import { Suspense } from "react";
import { StartForm } from "./form";

export default function StartPage(props: { searchParams: Promise<{ next?: string }> }) {
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
        Enter your email. If you already have an account we&apos;ll send you a magic link.
        Otherwise we&apos;ll set you up in under a minute.
      </p>
      <Suspense fallback={null}>
        <StartFormWrapper searchParams={props.searchParams} />
      </Suspense>
    </main>
  );
}

async function StartFormWrapper({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const params = await searchParams;
  return <StartForm next={params.next ?? "/dashboard"} />;
}
