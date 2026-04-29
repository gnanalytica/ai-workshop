import Link from "next/link";
import { getSession } from "@/lib/auth/session";
import { signOut } from "@/lib/auth/actions";

export default async function HomePage() {
  const user = await getSession();
  const signedIn = !!user;

  return (
    <main className="bg-bg text-ink min-h-screen">
      <Header signedIn={signedIn} />

      <section className="mx-auto max-w-5xl px-6 pt-16 pb-24 md:pt-24 md:pb-32">
        <p className="text-accent mb-4 font-mono text-xs tracking-widest uppercase">
          Gnanalytica · AI Workshop
        </p>
        <h1 className="text-4xl font-semibold tracking-tight md:text-6xl">
          30 days. <span className="text-accent">One platform.</span>
          <br />
          From curious to capable.
        </h1>
        <p className="text-muted mt-6 max-w-2xl text-lg">
          Curriculum, capstones, attendance, grading, pods, and analytics — for students, faculty,
          and admins. No spreadsheets, no scattered links.
        </p>
        <div className="mt-10">
          <PrimaryCta signedIn={signedIn} />
        </div>
      </section>

      <Features />
      <HowItWorks />
      <FooterCta signedIn={signedIn} />
    </main>
  );
}

function Header({ signedIn }: { signedIn: boolean }) {
  return (
    <header className="border-line/60 mx-auto flex max-w-5xl items-center justify-between border-b px-6 py-5">
      <Link href="/" className="font-mono text-xs tracking-widest uppercase">
        Gnanalytica
      </Link>
      <nav className="flex items-center gap-3 text-sm">
        {signedIn ? (
          <>
            <Link href="/dashboard" className="text-muted hover:text-ink">
              Dashboard
            </Link>
            <form action={signOut}>
              <button
                type="submit"
                className="text-muted hover:text-ink text-sm"
                aria-label="Sign out"
              >
                Sign out
              </button>
            </form>
          </>
        ) : (
          <Link href="/start" className="text-muted hover:text-ink">
            Enroll / Sign in
          </Link>
        )}
      </nav>
    </header>
  );
}

function PrimaryCta({ signedIn }: { signedIn: boolean }) {
  if (signedIn) {
    return (
      <Link
        href="/dashboard"
        className="bg-accent text-cta-ink inline-flex items-center gap-2 rounded-md px-6 py-3 text-sm font-medium"
      >
        Go to dashboard <span aria-hidden>→</span>
      </Link>
    );
  }
  return (
    <Link
      href="/start"
      className="bg-accent text-cta-ink inline-flex items-center gap-2 rounded-md px-6 py-3 text-sm font-medium"
    >
      Enroll / Sign in <span aria-hidden>→</span>
    </Link>
  );
}

function Features() {
  const items: { title: string; body: string }[] = [
    {
      title: "Daily curriculum",
      body: "Thirty MDX-authored days, gated by cohort schedule. Labs, capstones, and reflections in one rail.",
    },
    {
      title: "Pods + faculty",
      body: "Small accountability pods with primary/support faculty. Pod events are auditable end-to-end.",
    },
    {
      title: "Grading + analytics",
      body: "Server-enforced grading roles. Cohort and pod analytics at a glance for admins.",
    },
  ];
  return (
    <section className="border-line/60 border-t">
      <div className="mx-auto grid max-w-5xl gap-px bg-transparent px-6 py-16 md:grid-cols-3 md:gap-8">
        {items.map((it) => (
          <div key={it.title} className="border-line/60 rounded-lg border p-6">
            <h3 className="text-base font-semibold tracking-tight">{it.title}</h3>
            <p className="text-muted mt-2 text-sm leading-relaxed">{it.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps: { n: string; title: string; body: string }[] = [
    { n: "01", title: "Enroll", body: "Get an invite code from your admin and create your account." },
    { n: "02", title: "Daily labs", body: "Each day unlocks curriculum, lab tasks, and a check-in." },
    { n: "03", title: "Pod reviews", body: "Your pod's faculty grades labs and unblocks you fast." },
    { n: "04", title: "Capstone", body: "Demo day: ship a portfolio-grade project." },
  ];
  return (
    <section className="border-line/60 border-t">
      <div className="mx-auto max-w-5xl px-6 py-16">
        <p className="text-accent mb-8 font-mono text-xs tracking-widest uppercase">How it works</p>
        <div className="grid gap-8 md:grid-cols-4">
          {steps.map((s) => (
            <div key={s.n}>
              <p className="text-accent font-mono text-xs">{s.n}</p>
              <h3 className="mt-2 text-base font-semibold tracking-tight">{s.title}</h3>
              <p className="text-muted mt-1 text-sm leading-relaxed">{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FooterCta({ signedIn }: { signedIn: boolean }) {
  return (
    <section className="border-line/60 border-t">
      <div className="mx-auto flex max-w-5xl flex-col items-start gap-4 px-6 py-16 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
            {signedIn ? "Pick up where you left off." : "Ready to start?"}
          </h2>
          <p className="text-muted mt-2 text-sm">
            {signedIn
              ? "Your dashboard has today's day card, pod, and any pending reviews."
              : "One CTA, one email, one cohort. We'll detect your account or set you up."}
          </p>
        </div>
        <PrimaryCta signedIn={signedIn} />
      </div>
      <div className="border-line/60 mx-auto max-w-5xl border-t px-6 py-6 text-xs">
        <p className="text-muted">© {new Date().getFullYear()} Gnanalytica · AI Workshop</p>
      </div>
    </section>
  );
}
