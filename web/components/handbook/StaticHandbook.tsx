import Link from "next/link";
import { Card, CardSub, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StartGuideButton } from "@/components/tour/StartGuideButton";
import { EnterSandboxButton } from "@/components/sandbox/EnterSandboxButton";
import type { Persona } from "@/lib/auth/persona";
import { VideoSlot } from "@/components/handbook/VideoSlot";

export interface HandbookVideoEntry {
  url: string;
  caption?: string | null;
  thumbnailUrl?: string | null;
}

/**
 * Map of `"<tab>.<slugified-title>"` → entry (or null when no video yet).
 * `null` keys are placeholders staff fill in later.
 */
export type HandbookVideoManifest = Record<string, HandbookVideoEntry | null>;

function slugifyTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export interface HandbookSection {
  title: string;
  body: React.ReactNode;
}

/**
 * Four-tab handbook layout, matching the faculty handbook's structure:
 *   1. Your role
 *   2. Setup & Tools
 *   3. Dashboard navigation  (interactive guide launcher + checklist)
 *   4. Day-by-day operation
 *
 * Each section accepts a list of cards. The Dashboard tab is rendered
 * specially with a CTA + checklist generated from the role's tour steps.
 */
export interface StaticHandbookProps {
  persona: Persona;
  eyebrow: string;
  title: string;
  intro: string;
  yourRole: HandbookSection[];
  setup: HandbookSection[];
  dayByDay: HandbookSection[];
  /** Optional supplementary cards beneath the interactive-guide CTA. */
  dashboardExtras?: HandbookSection[];
  /** Active tab from the URL searchParams. Defaults to "your_role". */
  tab: HandbookTab;
  /** Optional per-section video manifest, scoped to this persona. */
  videoManifest?: HandbookVideoManifest;
}

export type HandbookTab = "your_role" | "setup" | "dashboard_nav" | "day_by_day";

const TABS: Array<{ value: HandbookTab; label: string; short: string }> = [
  { value: "your_role", label: "Your role", short: "Role" },
  { value: "setup", label: "Setup & Tools", short: "Setup" },
  { value: "dashboard_nav", label: "Dashboard navigation", short: "Nav" },
  { value: "day_by_day", label: "Day-by-day operation", short: "Days" },
];

export function StaticHandbook({
  persona,
  eyebrow,
  title,
  intro,
  yourRole,
  setup,
  dayByDay,
  dashboardExtras = [],
  tab,
  videoManifest,
}: StaticHandbookProps) {
  const activeSections =
    tab === "your_role" ? yourRole : tab === "setup" ? setup : dayByDay;
  return (
    <div data-tour="handbook-page" className="space-y-8">
      <header className="border-hairline bg-card relative overflow-hidden rounded-2xl border p-6 shadow-soft sm:p-8">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-[radial-gradient(closest-side,hsl(var(--accent)/0.12),transparent)]"
        />
        <div className="relative">
          <p className="text-muted font-mono text-[10px] font-medium tracking-[0.2em] uppercase">
            {eyebrow}
          </p>
          <h1 className="text-ink mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
            {title}
          </h1>
          <CardSub className="text-ink/75 mt-2 max-w-2xl text-base leading-relaxed">
            {intro}
          </CardSub>
        </div>
      </header>

      <nav
        className="flex flex-col gap-2 sm:flex-row sm:flex-wrap"
        aria-label="Handbook sections"
      >
        {TABS.map((t) => {
          const active = tab === t.value;
          return (
            <a
              key={t.value}
              href={`?tab=${t.value}`}
              className={`group flex min-h-[3.25rem] flex-1 items-center gap-3 rounded-xl border px-4 py-3 text-left transition-all sm:min-w-0 sm:flex-[1_1_12rem] ${
                active
                  ? "border-accent/45 bg-gradient-to-b from-bg-soft to-card shadow-soft ring-1 ring-accent/20"
                  : "border-hairline bg-card/80 hover:border-line hover:bg-bg-soft/50"
              }`}
            >
              <span className="min-w-0 flex-1">
                <span className="text-ink block text-sm font-semibold leading-tight sm:hidden">
                  {t.short}
                </span>
                <span className="text-ink hidden text-sm font-semibold leading-tight sm:block">
                  {t.label}
                </span>
              </span>
              {active && (
                <span className="bg-accent/20 text-accent h-1.5 w-1.5 shrink-0 rounded-full" />
              )}
            </a>
          );
        })}
      </nav>

      {tab === "dashboard_nav" ? (
        <DashboardNavTab persona={persona} extras={dashboardExtras} />
      ) : (
        <SectionGrid
          sections={activeSections}
          tab={tab}
          videoManifest={videoManifest}
        />
      )}
    </div>
  );
}

function SectionGrid({
  sections,
  tab,
  videoManifest,
}: {
  sections: HandbookSection[];
  tab?: HandbookTab;
  videoManifest?: HandbookVideoManifest;
}) {
  if (sections.length === 0) {
    return (
      <Card className="border-dashed border-hairline p-8 text-center">
        <CardSub>This section is empty for now.</CardSub>
      </Card>
    );
  }
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {sections.map((s) => {
        const key = tab ? `${tab}.${slugifyTitle(s.title)}` : null;
        const video = key && videoManifest ? videoManifest[key] : null;
        return (
          <Card key={s.title} className="p-6">
            <CardTitle className="mb-2 text-base">{s.title}</CardTitle>
            {video ? (
              <VideoSlot
                url={video.url}
                caption={video.caption ?? null}
                thumbnailUrl={video.thumbnailUrl ?? null}
              />
            ) : null}
            <div className="text-muted text-sm leading-relaxed [&_p]:mb-2 [&_strong]:text-ink [&_a]:text-accent [&_a]:underline [&_ul]:ml-4 [&_ul]:list-disc [&_ul]:space-y-1 [&_li]:my-0">
              {s.body}
            </div>
          </Card>
        );
      })}
    </div>
  );
}

function DashboardNavTab({
  persona,
  extras,
}: {
  persona: Persona;
  extras: HandbookSection[];
}) {
  return (
    <div className="space-y-6">
      <Card className="border-accent/30 bg-accent/[0.04] p-6 sm:p-8">
        <CardTitle className="mb-2 text-lg">Take the interactive guide</CardTitle>
        <CardSub className="mb-4 max-w-2xl text-sm leading-relaxed">
          A step-by-step tour of every screen you will use, linked to the actual
          sidebar items. You can replay it any time — it will not mark you as a new user again.
        </CardSub>
        <div className="flex flex-wrap items-center gap-3">
          <StartGuideButton persona={persona} />
          {persona === "student" && (
            <Button variant="outline" asChild>
              <Link href="/onboarding">Open Day 0</Link>
            </Button>
          )}
          {(persona === "admin" || persona === "faculty") && (
            <EnterSandboxButton />
          )}
        </div>
        {(persona === "admin" || persona === "faculty") && (
          <p className="text-muted mt-3 text-xs leading-relaxed">
            Tip: open the sandbox first, then start the guide. You will explore
            the platform with realistic sample students — every action, grade,
            or post is real, but limited to the sandbox cohort. Click{" "}
            <span className="text-ink">Exit sandbox</span> at any time to leave.
          </p>
        )}
      </Card>

      {extras.length > 0 && <SectionGrid sections={extras} />}
    </div>
  );
}

export function parseHandbookTab(raw?: string): HandbookTab {
  return (TABS.map((t) => t.value) as string[]).includes(raw ?? "")
    ? (raw as HandbookTab)
    : "your_role";
}
