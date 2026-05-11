import { BookOpen, CalendarDays, Compass, Wrench } from "lucide-react";
import { requireCapability } from "@/lib/auth/requireCapability";
import { Card, CardSub, CardTitle } from "@/components/ui/card";
import { listFacultyHandbook } from "@/lib/queries/handbook";
import { HandbookView } from "./HandbookView";
import { StartGuideButton } from "@/components/tour/StartGuideButton";
import { tourFor } from "@/lib/tours";

type Tab = "non_technical" | "technical" | "dashboard_nav" | "day_by_day";

/**
 * DB enum `handbook_category`:
 *   non_technical → "Your role"
 *   technical     → "Setup & tools" (local system, accounts, credentials)
 *   dashboard_nav → "Dashboard navigation" (interactive guide launcher + reference)
 *   day_by_day    → "Day-by-day operation"
 */
const TABS: Array<{
  value: Tab;
  label: string;
  short: string;
  icon: typeof BookOpen;
}> = [
  { value: "non_technical", label: "Your role", short: "Role", icon: BookOpen },
  { value: "technical", label: "Setup & tools", short: "Setup", icon: Wrench },
  { value: "dashboard_nav", label: "Dashboard navigation", short: "Nav", icon: Compass },
  { value: "day_by_day", label: "Day-by-day operation", short: "Days", icon: CalendarDays },
];

export default async function FacultyHandbookPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  await requireCapability("schedule.read");
  const sp = await searchParams;
  const tabRaw = sp.tab;
  const tab: Tab = (
    ["non_technical", "technical", "dashboard_nav", "day_by_day"] as const
  ).includes(tabRaw as Tab)
    ? (tabRaw as Tab)
    : "non_technical";
  const modules = await listFacultyHandbook();

  const filtered = modules.filter((m) => m.category === tab);
  const completed = modules.filter((m) => m.status === "completed").length;
  const total = modules.length;
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

  const counts = TABS.map((t) => ({
    ...t,
    count: modules.filter((m) => m.category === t.value).length,
  }));

  return (
    <div data-tour="handbook-page" className="space-y-8">
      <header className="handbook-hero relative overflow-hidden rounded-2xl border border-hairline bg-card p-6 shadow-soft sm:p-8">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-[radial-gradient(closest-side,hsl(var(--accent)/0.12),transparent)]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-24 left-1/2 h-40 w-72 -translate-x-1/2 bg-[radial-gradient(closest-side,hsl(var(--accent-2)/0.08),transparent)]"
        />
        <div className="relative">
          <p className="text-muted font-mono text-[10px] font-medium tracking-[0.2em] uppercase">
            Faculty reference
          </p>
          <h1 className="font-display text-ink mt-2 text-3xl font-semibold tracking-tight [font-variation-settings:'opsz'72] sm:text-4xl">
            Operating playbook
          </h1>
          <CardSub className="text-ink/75 mt-2 max-w-xl text-base leading-relaxed">
            Onboarding, navigation, and how to run sessions—organized by area so you can skim or
            go deep.
          </CardSub>
          <div className="mt-4">
            <StartGuideButton persona="faculty" />
          </div>

          {total > 0 && (
            <div className="mt-6 max-w-sm">
              <div className="text-muted flex items-baseline justify-between gap-2 text-xs">
                <span>Overall progress</span>
                <span className="font-mono tabular text-ink/90">
                  {completed} / {total} modules
                  <span className="text-muted ml-1.5">({pct}%)</span>
                </span>
              </div>
              <div
                className="bg-line/50 mt-2 h-1.5 overflow-hidden rounded-full"
                role="progressbar"
                aria-valuenow={pct}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Handbook completion"
              >
                <div
                  className="from-accent/90 to-accent h-full rounded-full bg-gradient-to-r transition-[width] duration-500"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </header>

      <div className="space-y-4">
        <p className="text-muted font-mono text-[10px] tracking-[0.18em] uppercase">Browse by area</p>
        <nav
          className="flex flex-col gap-2 sm:flex-row sm:flex-wrap"
          aria-label="Handbook categories"
        >
          {counts.map((row) => {
            const active = tab === row.value;
            const Icon = row.icon;
            return (
              <a
                key={row.value}
                href={`?tab=${row.value}`}
                className={`group flex min-h-[3.25rem] flex-1 items-center gap-3 rounded-xl border px-4 py-3 text-left transition-all sm:min-w-0 sm:flex-[1_1_12rem] ${
                  active
                    ? "border-accent/45 bg-gradient-to-b from-bg-soft to-card shadow-soft ring-1 ring-accent/20"
                    : "border-hairline bg-card/80 hover:border-line hover:bg-bg-soft/50"
                } `}
              >
                <span
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                    active
                      ? "bg-accent/15 text-accent"
                      : "bg-bg-soft text-muted group-hover:text-ink/80"
                  }`}
                >
                  <Icon className="h-4 w-4" strokeWidth={1.75} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="text-ink block text-sm font-semibold leading-tight sm:hidden">
                    {row.short}
                  </span>
                  <span className="text-ink hidden text-sm font-semibold leading-tight sm:block">
                    {row.label}
                  </span>
                  <span className="text-muted font-mono text-[10px] tabular sm:mt-0.5 sm:block">
                    {row.count} module{row.count === 1 ? "" : "s"}
                  </span>
                </span>
                {active && (
                  <span className="bg-accent/20 text-accent h-1.5 w-1.5 shrink-0 rounded-full" />
                )}
              </a>
            );
          })}
        </nav>
      </div>

      {tab === "dashboard_nav" ? (
        <DashboardNavTab supplementary={filtered} />
      ) : filtered.length === 0 ? (
        <Card className="border-dashed border-hairline p-8 text-center">
          <CardSub>No modules published in this section yet.</CardSub>
        </Card>
      ) : (
        <HandbookView modules={filtered} />
      )}
    </div>
  );
}

function DashboardNavTab({
  supplementary,
}: {
  supplementary: Awaited<ReturnType<typeof listFacultyHandbook>>;
}) {
  const tourSteps = tourFor("faculty");
  return (
    <div className="space-y-6">
      <Card className="border-accent/30 bg-accent/[0.04] p-6 sm:p-8">
        <CardTitle className="mb-2 text-lg">Take the interactive guide</CardTitle>
        <CardSub className="mb-4 max-w-2xl text-sm leading-relaxed">
          A step-by-step tour of every screen you&apos;ll use, anchored to the actual
          sidebar links. Takes about two minutes. Replay it anytime — it doesn&apos;t
          re-mark you as a new user.
        </CardSub>
        <div className="flex flex-wrap items-center gap-3">
          <StartGuideButton persona="faculty" />
        </div>
        <div className="mt-6">
          <p className="text-muted text-xs font-medium uppercase tracking-wider">
            What the guide covers
          </p>
          <ul className="text-muted mt-2 grid gap-1.5 text-sm sm:grid-cols-2">
            {tourSteps
              .filter((s) => s.selector)
              .map((s) => (
                <li key={s.title} className="flex items-start gap-2">
                  <span className="text-accent mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-current" />
                  <span>
                    <span className="text-ink font-medium">{s.title}</span> — {s.body}
                  </span>
                </li>
              ))}
          </ul>
        </div>
      </Card>

      {supplementary.length > 0 && (
        <div>
          <p className="text-muted mb-3 font-mono text-[10px] tracking-[0.18em] uppercase">
            Reference reading
          </p>
          <HandbookView modules={supplementary} />
        </div>
      )}
    </div>
  );
}
