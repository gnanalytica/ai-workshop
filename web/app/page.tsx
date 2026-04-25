import Link from "next/link";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center px-6">
      <p className="text-accent mb-4 font-mono text-xs tracking-widest uppercase">
        Gnanalytica · AI Workshop
      </p>
      <h1 className="text-5xl font-semibold tracking-tight md:text-6xl">
        30 days. One unified platform.
      </h1>
      <p className="text-muted mt-4 max-w-xl text-lg">
        Curriculum, capstones, attendance, grading, pods, and analytics — for students, faculty,
        and admins, all in one place.
      </p>
      <div className="mt-8 flex gap-3">
        <Link
          href="/sign-in"
          className="bg-accent text-cta-ink rounded-md px-5 py-2.5 text-sm font-medium"
        >
          Sign in
        </Link>
        <Link
          href="/dashboard"
          className="border-line text-ink rounded-md border px-5 py-2.5 text-sm font-medium"
        >
          Dashboard
        </Link>
      </div>
    </main>
  );
}
