import { notFound } from "next/navigation";
import { CohortShell } from "@/components/admin-cohort/CohortShell";
import { DayFeedbackList } from "@/components/health/HealthSections";
import { AdminFeedbackBrowser } from "@/components/admin-cohort/AdminFeedbackBrowser";
import { requireCapability } from "@/lib/auth/requireCapability";
import { getAdminCohortById } from "@/lib/queries/admin-context";
import { listRecentDayFeedback, getCohortKpis } from "@/lib/queries/faculty-cohort";
import {
  listRecentFuzzyTopics,
  listLowRatingFeedback,
} from "@/lib/queries/day-feedback";
import { listCohortDays } from "@/lib/queries/cohort";
import { workingDayNumber } from "@/lib/calendar";

export default async function AdminCohortFeedbackPage({
  params,
}: {
  params: Promise<{ cohortId: string }>;
}) {
  const { cohortId } = await params;
  await requireCapability("analytics.read:cohort", cohortId);
  const cohort = await getAdminCohortById(cohortId);
  if (!cohort) notFound();

  const days = await listCohortDays(cohort.id);
  const today = Math.min(30, workingDayNumber(cohort.starts_on));
  const unlockedDayNumbers = days
    .filter((d) => d.is_unlocked && d.day_number <= today)
    .map((d) => d.day_number)
    .sort((a, b) => a - b);

  const [kpis, summaries, fuzzyTopics, lowRating] = await Promise.all([
    getCohortKpis(cohort.id),
    listRecentDayFeedback(cohort.id, unlockedDayNumbers, null),
    listRecentFuzzyTopics(cohort.id, unlockedDayNumbers, 500),
    listLowRatingFeedback(cohort.id, unlockedDayNumbers, 2, 500),
  ]);

  const totalResponses = summaries.reduce((s, r) => s + r.total_responses, 0);
  const weightedSum = summaries.reduce(
    (s, r) => s + (r.avg_rating ?? 0) * r.total_responses,
    0,
  );
  const overallAvg = totalResponses > 0 ? weightedSum / totalResponses : null;

  return (
    <>
      <CohortShell cohort={cohort} active="pulse" />

      <section className="border-line bg-card/60 grid gap-px overflow-hidden rounded-lg border sm:grid-cols-4">
        <Stat
          label="Responses"
          value={String(totalResponses)}
          hint={`across ${summaries.filter((s) => s.total_responses > 0).length} day${summaries.filter((s) => s.total_responses > 0).length === 1 ? "" : "s"}`}
        />
        <Stat
          label="Overall avg"
          value={overallAvg === null ? "—" : overallAvg.toFixed(2)}
          hint="weighted by responses"
          tone={
            overallAvg === null
              ? "default"
              : overallAvg >= 4
                ? "ok"
                : overallAvg >= 3
                  ? "warn"
                  : "danger"
          }
        />
        <Stat
          label="Low ratings"
          value={String(lowRating.length)}
          hint="≤ 2★ across the cohort"
          tone={lowRating.length === 0 ? "ok" : lowRating.length <= 10 ? "warn" : "danger"}
        />
        <Stat
          label="Comments"
          value={String(fuzzyTopics.length)}
          hint="non-empty free-text answers"
        />
      </section>

      <section className="space-y-2">
        <Header
          title="Ratings by day"
          sub={`response rate vs ${kpis.students} confirmed student${kpis.students === 1 ? "" : "s"} · click a row to triage that day`}
        />
        <DayFeedbackList
          rows={summaries}
          cohortSize={kpis.students}
          detailHref={(d) => `/admin/cohorts/${cohort.id}/feedback/${d}`}
        />
      </section>

      <section className="space-y-2">
        <Header
          title="Browse comments"
          sub="search, filter by day or rating, switch to low-rating triage"
        />
        <AdminFeedbackBrowser
          fuzzyTopics={fuzzyTopics}
          lowRating={lowRating}
        />
      </section>
    </>
  );
}

type Tone = "default" | "ok" | "warn" | "danger";

const TONE: Record<Tone, string> = {
  default: "text-ink",
  ok: "text-ok",
  warn: "text-warn",
  danger: "text-danger",
};

function Stat({
  label,
  value,
  hint,
  tone = "default",
}: {
  label: string;
  value: string;
  hint: string;
  tone?: Tone;
}) {
  return (
    <div className="bg-card flex flex-col gap-1.5 px-5 py-4">
      <p className="text-muted font-mono text-[10.5px] font-semibold uppercase tracking-[0.18em]">
        {label}
      </p>
      <p
        className={`font-display text-2xl font-semibold tracking-tight tabular-nums ${TONE[tone]}`}
      >
        {value}
      </p>
      <p className="text-muted mt-auto text-xs">{hint}</p>
    </div>
  );
}

function Header({ title, sub }: { title: string; sub: string }) {
  return (
    <header className="border-line/40 flex flex-wrap items-baseline justify-between gap-2 border-b pb-2">
      <h2 className="text-base font-semibold tracking-tight">{title}</h2>
      <p className="text-muted text-xs">{sub}</p>
    </header>
  );
}
