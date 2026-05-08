import Link from "next/link";
import { requireCapability } from "@/lib/auth/requireCapability";
import { getSession } from "@/lib/auth/session";
import { Card, CardSub, CardTitle } from "@/components/ui/card";
import { EngagementChart } from "@/components/charts/EngagementChart";
import { PollsExplorer } from "@/components/admin-cohort/PollsExplorer";
import {
  AtRiskList,
  DayFeedbackList,
} from "@/components/health/HealthSections";
import { getFacultyCohort } from "@/lib/queries/faculty";
import { getFacultyPods } from "@/lib/queries/faculty-pod";
import { listCohortDays, todayDayNumber } from "@/lib/queries/cohort";
import {
  getPodKpis,
  listAtRiskInPod,
  listRecentDayFeedback,
} from "@/lib/queries/faculty-cohort";
import { getEngagementByDay } from "@/lib/queries/analytics";
import { listCohortPolls } from "@/lib/queries/polls-overview";

export default async function FacultyPodPulsePage() {
  await requireCapability("roster.read");
  const f = await getFacultyCohort();
  const me = await getSession();
  if (!f || !me) {
    return (
      <Card>
        <CardTitle>You aren&apos;t assigned to a cohort.</CardTitle>
      </Card>
    );
  }

  const pods = await getFacultyPods(f.cohort.id, me.id);
  const myPod = pods[0] ?? null;
  if (!myPod) {
    return (
      <div className="space-y-4">
        <header>
          <p className="text-accent font-mono text-xs tracking-widest uppercase">
            {f.cohort.name}
          </p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">Pod Pulse</h1>
        </header>
        <Card>
          <CardTitle className="mb-2">No pod assigned yet</CardTitle>
          <CardSub>
            Open the{" "}
            <Link href="/faculty/cohort#pods" className="text-accent hover:underline">
              cohort kanban
            </Link>{" "}
            to get assigned to a pod first.
          </CardSub>
        </Card>
      </div>
    );
  }

  const today = todayDayNumber(f.cohort);
  const days = await listCohortDays(f.cohort.id);
  const recentDayNumbers = days
    .filter((d) => d.is_unlocked && d.day_number <= today)
    .map((d) => d.day_number)
    .sort((a, b) => b - a)
    .slice(0, 7);

  const memberIds = myPod.members.map((m) => m.user_id);

  const [kpis, atRisk, dayFeedback, podEngagement, cohortEngagement, polls] =
    await Promise.all([
      getPodKpis(f.cohort.id, myPod.pod_id),
      listAtRiskInPod(f.cohort.id, myPod.pod_id),
      listRecentDayFeedback(f.cohort.id, recentDayNumbers, myPod.pod_id),
      getEngagementByDay(f.cohort.id, memberIds),
      getEngagementByDay(f.cohort.id),
      listCohortPolls(f.cohort.id),
    ]);

  const podToday = podEngagement
    .filter((e) => e.day_number <= today)
    .sort((a, b) => a.day_number - b.day_number)
    .slice(-7);
  const headPodEng = podToday.at(-1);
  const podPct = headPodEng ? Math.round(headPodEng.rate * 100) : null;
  const cohortToday = cohortEngagement
    .filter((e) => e.day_number <= today)
    .sort((a, b) => a.day_number - b.day_number)
    .slice(-7);
  const headCohEng = cohortToday.at(-1);
  const cohortPct = headCohEng ? Math.round(headCohEng.rate * 100) : null;
  const podSparkValues = podToday.map((e) => e.rate);

  const podDelta =
    podSparkValues.length >= 2
      ? Math.round(
          ((podSparkValues[podSparkValues.length - 1] ?? 0) -
            (podSparkValues[podSparkValues.length - 2] ?? 0)) *
            100,
        )
      : null;

  return (
    <div className="space-y-6">
      <header>
        <p className="text-accent font-mono text-xs tracking-widest uppercase">
          {f.cohort.name} · {myPod.pod_name}
        </p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">Pod Pulse</h1>
        <CardSub className="mt-1">
          Activity, at-risk students, day feedback, and polls — scoped to your pod.
        </CardSub>
      </header>

      {/* Hero strip */}
      <section className="border-line bg-card/60 grid gap-px overflow-hidden rounded-lg border sm:grid-cols-3">
        <Hero label="Pod size" value={`${kpis.members}`} hint={`Day ${today}/30`} />
        <Hero
          label="Pod activity · most recent day"
          value={podPct === null ? "—" : `${podPct}%`}
          hint={
            headPodEng
              ? `${headPodEng.active}/${headPodEng.total} active on Day ${headPodEng.day_number}`
              : "no activity yet"
          }
          tone={
            podPct === null
              ? "default"
              : podPct >= 70
                ? "ok"
                : podPct >= 50
                  ? "warn"
                  : "danger"
          }
          delta={podDelta}
          sparkline={podSparkValues}
        />
        <Hero
          label="Cohort activity · same day"
          value={cohortPct === null ? "—" : `${cohortPct}%`}
          hint={
            cohortPct !== null && podPct !== null
              ? podPct >= cohortPct
                ? `${podPct - cohortPct}pp above cohort`
                : `${cohortPct - podPct}pp below cohort`
              : "for comparison"
          }
          tone={
            cohortPct === null || podPct === null
              ? "default"
              : podPct >= cohortPct
                ? "ok"
                : podPct + 10 >= cohortPct
                  ? "warn"
                  : "danger"
          }
        />
      </section>

      {/* Activity */}
      <Group
        title="Are they active?"
        sub="A pod member counts as active on a day if they submit, take a quiz, give feedback, vote, or tick a lab."
      >
        {podEngagement.length === 0 ? (
          <Card>
            <CardSub>No activity yet for your pod.</CardSub>
          </Card>
        ) : (
          <Card>
            <EngagementChart rows={podEngagement} />
          </Card>
        )}
      </Group>

      {/* At-risk */}
      <Group
        title="Are they keeping up?"
        sub={atRisk.length === 0 ? "no flags" : `${atRisk.length} flagged`}
      >
        <AtRiskList
          students={atRisk}
          studentHref={(uid) => `/faculty/student/${uid}`}
          emptyHint="Everyone in your pod is on track."
        />
      </Group>

      {/* Feedback */}
      <Group
        title="Are they happy?"
        sub={`day-end feedback from your pod · last ${recentDayNumbers.length} days`}
      >
        <DayFeedbackList
          rows={dayFeedback}
          detailHref={(d) => `/faculty/day/${d}`}
        />
      </Group>

      {/* Polls */}
      <Group title="Polls and pulses" sub={`${polls.length} cohort-wide`}>
        <PollsExplorer polls={polls} />
      </Group>
    </div>
  );
}

type Tone = "default" | "ok" | "warn" | "danger";
const TONE_RING: Record<Tone, string> = {
  default: "text-ink",
  ok: "text-ok",
  warn: "text-warn",
  danger: "text-danger",
};

function Hero({
  label,
  value,
  hint,
  tone = "default",
  delta,
  sparkline,
}: {
  label: string;
  value: string;
  hint: string;
  tone?: Tone;
  delta?: number | null;
  sparkline?: number[];
}) {
  return (
    <div className="bg-card flex flex-col gap-1.5 px-5 py-4">
      <p className="text-muted font-mono text-[10.5px] font-semibold uppercase tracking-[0.18em]">
        {label}
      </p>
      <div className="flex items-baseline gap-2">
        <p
          className={`font-display text-2xl font-semibold tracking-tight tabular-nums ${TONE_RING[tone]}`}
        >
          {value}
        </p>
        {delta !== null && delta !== undefined && (
          <span
            className={`font-mono text-[11px] font-semibold tabular-nums ${
              delta > 0 ? "text-ok" : delta < 0 ? "text-danger" : "text-muted"
            }`}
          >
            {delta > 0 ? "↑" : delta < 0 ? "↓" : "→"} {Math.abs(delta)}pp
          </span>
        )}
      </div>
      <div className="mt-auto flex items-end justify-between gap-3 pt-1">
        <p className="text-muted text-xs">{hint}</p>
        {sparkline && sparkline.length > 1 && (
          <Sparkline values={sparkline} tone={tone} />
        )}
      </div>
    </div>
  );
}

function Sparkline({ values, tone }: { values: number[]; tone: Tone }) {
  const w = 72;
  const h = 22;
  const max = Math.max(...values, 0.0001);
  const step = values.length > 1 ? w / (values.length - 1) : 0;
  const points = values
    .map((v, i) => `${i * step},${h - (v / max) * h}`)
    .join(" ");
  const stroke =
    tone === "ok"
      ? "hsl(var(--ok))"
      : tone === "warn"
        ? "hsl(var(--warn))"
        : tone === "danger"
          ? "hsl(var(--danger))"
          : "hsl(var(--accent))";
  return (
    <svg
      width={w}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      className="shrink-0"
      aria-hidden
    >
      <polyline
        points={points}
        fill="none"
        stroke={stroke}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Group({
  title,
  sub,
  children,
}: {
  title: string;
  sub: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3">
      <header className="border-line/40 flex flex-wrap items-baseline justify-between gap-2 border-b pb-2">
        <h2 className="text-base font-semibold tracking-tight">{title}</h2>
        <p className="text-muted text-xs">{sub}</p>
      </header>
      <div className="space-y-4">{children}</div>
    </section>
  );
}
