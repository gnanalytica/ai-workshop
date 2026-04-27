import Link from "next/link";

export default async function DeniedPage(props: {
  searchParams: Promise<{ cap?: string }>;
}) {
  const params = await props.searchParams;
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6">
      <p className="text-danger mb-3 font-mono text-xs tracking-widest uppercase">
        Access denied
      </p>
      <h1 className="text-3xl font-semibold tracking-tight">Not authorized</h1>
      <p className="text-muted mt-2 text-sm">
        You don&apos;t have the capability required to view this page
        {params.cap ? <code className="text-ink ml-1">({params.cap})</code> : null}. If this is
        unexpected, contact a workshop admin.
      </p>
      <div className="mt-8 flex gap-3">
        <Link
          href="/dashboard"
          className="bg-accent text-cta-ink rounded-md px-4 py-2 text-sm font-medium"
        >
          Back to dashboard
        </Link>
        <Link
          href="/"
          className="border-line text-ink rounded-md border px-4 py-2 text-sm font-medium"
        >
          Home
        </Link>
      </div>
    </main>
  );
}
