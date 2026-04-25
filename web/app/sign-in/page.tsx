import { Suspense } from "react";
import { SignInForm } from "./form";

export default function SignInPage(props: { searchParams: Promise<{ next?: string }> }) {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6">
      <p className="text-accent mb-3 font-mono text-xs tracking-widest uppercase">Sign in</p>
      <h1 className="text-3xl font-semibold tracking-tight">Welcome back</h1>
      <p className="text-muted mt-2 mb-8 text-sm">
        We&apos;ll email you a magic link. No password needed.
      </p>
      <Suspense fallback={null}>
        <SignInFormWrapper searchParams={props.searchParams} />
      </Suspense>
    </main>
  );
}

async function SignInFormWrapper({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const params = await searchParams;
  return <SignInForm next={params.next ?? "/dashboard"} />;
}
