import { notFound } from "next/navigation";
import { Card, CardSub } from "@/components/ui/card";
import { CohortShell } from "@/components/admin-cohort/CohortShell";
import { StackedBarChart, type BarRow } from "@/components/charts/BarChart";
import { requireCapability } from "@/lib/auth/requireCapability";
import { getAdminCohortById } from "@/lib/queries/admin-context";
import {
  AtRiskList,
  DayFeedbackList,
  PulseList,
} from "@/components/health/HealthSections";
import {
  getCohortKpis,
  listAtRiskStudents,
  listRecentDayFeedback,
  listRecentPulses,
} from "@/lib/queries/faculty-cohort";
import {
  getAnalyticsSummary,
  getAttendanceByDay,
} from "@/lib/queries/analytics";
import { listCohortDays } from "@/lib/queries/cohort";
import { workingDayNumber } from "@/lib/calendar";

export default async function AdminCohortPulsePage({
  params,
}: {
  params: Promise<{ cohortId: string }>;
}) {
  const { cohortId } = await params;
  await requireCapability("content.write", cohortId);
  const cohort = await getAdminCohortById(cohortId);
  if (!cohort) notFound();

  const days = await listCohortDays(cohort.id);
  const today = Math.min(30, workingDayNumber(cohort.starts_on));
  const recentDayNumbers = days
    .filter((d) => d.is_unlocked && d.day_number <= today)
    .map((d) => d.day_number)
    .sort((a, b) => b - a)
    .slice(0, 7);

  const [kpis, summary, byDay, atRisk, dayFeedback, pulses] = await Promise.all([
    getCohortKpis(cohort.id),
    getAnalyticsSummary(cohort.id),
    getAttendanceByDay(cohort.id),
    listAtRiskStudents(cohort.id),
    listRecentDayFeedback(cohort.id, recentDayNumbers, null),
    listRecentPulses(cohort.id, 5),
  ]);

  const studentHref = (uid: string) =>
    `/admin/cohorts/${cohort.id}/students/${uid}`;

  // Recent attendance sparkline + headline number = the most recent unlocked day's attendance %.
  const recentByDay = byDay
    .filter((d) => d.day_number <= today)
    .sort((a, b) => a.day_number - b.day_number)
    .slice(-7);

  const bucketTotal = (
    d: { present: number; late: number; excused: number; absent: number },
  ) => d.present + d.late + d.excused + d.absent;

  const todayBucket = recentByDay.at(-1);
  const todayBucketTotal = todayBucket ? bucketTotal(todayBucket) : 0;
  const todayAttendancePct =
    todayBucket && todayBucketTotal > 0
      ? Math.round((todayBucket.present / todayBucketTotal) * 100)
      : null;

  const sparkValues = recentByDay.map((d) => {
    const t = bucketTotal(d);
    return t > 0 ? d.present / t : 0;
  });

  const chartRows: BarRow[] = byDay.map((d) => ({
    id: d.day_number,
    label: `D${String(d.day_number).padStart(2, "0")}`,
    segments: [
      { value: d.present, label: "present", tone: "ok" },
      { value: d.late, label: "late", tone: "warn" },
      { value: d.excused, label: "excused", tone: "default" },
      { value: d.absent, label: "absent", tone: "danger" },
    ],
  }));

  return (
    <>
      <CohortShell cohort={cohort} active="pulse" />

      {/* Hero — three numbers that answer "is anything on fire?" */}
      <section className="border-line bg-card/60 grid gap-px overflow-hidden rounded-lg border sm:grid-cols-3">
        <HeroStat
          label="Today"
          value={`Day ${today}/30`}
          hint={
            kpis.students > 0
              ? `${kpis.students} student${kpis.students === 1 ? "" : "s"}`
              : "no roster yet"
          }
        />
        <HeroStat
          label="Attendance · most recent day"
          value={
            todayAttendancePct === null ? "—" : `${todayAttendancePct}%`
          }
          hint={
            todayBucket
              ? `${todayBucket.present}/${todayBucketTotal} on Day ${todayBucket.day_number}`
              : "no attendance recorded"
          }
          tone={
            todayAttendancePct === null
              ? "default"
              : todayAttendancePct >= 70
                ? "ok"
                : todayAttendancePct >= 50
                  ? "warn"
                  : "danger"
          }
          sparkline={sparkValues}
        />
        <HeroStat
          label="Red flags"
          value={String(atRisk.length + kpis.helpDeskOpen)}
          hint={`${atRisk.length} at-risk · ${kpis.helpDeskOpen} open help`}
          tone={
            atRisk.length + kpis.helpDeskOpen === 0
              ? "ok"
              : atRisk.length + kpis.helpDeskOpen <= 3
                ? "warn"
                : "danger"
          }
        />
      </section>

      {/* Question 1 — Are they showing up? */}
      <Group
        title="Are they showing up?"
        sub="Attendance trends over the cohort run."
      >
        {chartRows.length === 0 ? (
          <Card>
            <CardSub>
              No attendance recorded yet. Mark attendance during a live session
              and this chart fills in.
            </CardSub>
          </Card>
        ) : (
          <Card>
            <StackedBarChart rows={chartRows} />
            <Legend />
          </Card>
        )}
      </Group>

      {/* Question 2 — Are they keeping up? */}
      <Group
        title="Are they keeping up?"
        sub="Curriculum progress, grading queue, and students who need a nudge."
      >
        <div className="grid gap-3 sm:grid-cols-3">
          <MiniStat
            label="Avg days complete"
            value={summary.avgDaysComplete.toFixed(1)}
            hint={`of ${today} unlocked`}
          />
          <MiniStat
            label="Pending review"
            value={summary.pendingReview}
            hint={
              summary.pendingReview === 0
                ? "queue is empty"
                : "submissions waiting on a grader"
            }
            tone={summary.pendingReview > 5 ? "warn" : "default"}
          />
          <MiniStat
            label="Pods"
            value={kpis.pods}
            hint={
              kpis.pods === 0 ? "no pods yet" : "active learning groups"
            }
          />
        </div>
        <div className="space-y-2">
          <SectionHead
            title="At-risk students"
            sub={
              atRisk.length === 0
                ? "no flags"
                : `${atRisk.length} flagged`
            }
          />
          <AtRiskList
            students={atRisk}
            studentHref={studentHref}
            emptyHint="Everyone's on track — no inactivity, missing submissions, or open help-desk threads."
          />
        </div>
      </Group>

      {/* Question 3 — Are they happy? */}
      <Group
        title="Are they happy?"
        sub="What students said about recent days and live polls."
      >
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="space-y-2">
            <SectionHead
              title="Recent day feedback"
              sub={`last ${recentDayNumbers.length} days`}
            />
            <DayFeedbackList rows={dayFeedback} />
          </div>
          <div className="space-y-2">
            <SectionHead
              title="Live poll responses"
              sub={`last ${pulses.length}`}
            />
            <PulseList pulses={pulses} />
          </div>
        </div>
      </Group>
    </>
  );
}

type Tone = "default" | "ok" | "warn" | "danger";

const TONE_RING: Record<Tone, string> = {
  default: "text-ink",
  ok: "text-ok",
  warn: "text-warn",
  danger: "text-danger",
};

function HeroStat({
  label,
  value,
  hint,
  tone = "default",
  sparkline,
}: {
  label: string;
  value: string;
  hint: string;
  tone?: Tone;
  sparkline?: number[];
}) {
  return (
    <div className="bg-card flex flex-col gap-1.5 px-5 py-4">
      <p className="text-muted font-mono text-[10.5px] font-semibold uppercase tracking-[0.18em]">
        {label}
      </p>
      <p
        className={`font-display text-2xl font-semibold tracking-tight tabular-nums ${TONE_RING[tone]}`}
      >
        {value}
      </p>
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

function MiniStat({
  label,
  value,
  hint,
  tone = "default",
}: {
  label: string;
  value: string | number;
  hint: string;
  tone?: Tone;
}) {
  return (
    <Card>
      <p className="text-muted font-mono text-[10.5px] font-semibold uppercase tracking-[0.18em]">
        {label}
      </p>
      <p
        className={`mt-1 font-display text-xl font-semibold tabular-nums ${TONE_RING[tone]}`}
      >
        {value}
      </p>
      <p className="text-muted mt-0.5 text-xs">{hint}</p>
    </Card>
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

function SectionHead({ title, sub }: { title: string; sub: string }) {
  return (
    <div className="flex items-baseline justify-between gap-2">
      <h3 className="text-sm font-semibold tracking-tight">{title}</h3>
      <CardSub className="text-xs">{sub}</CardSub>
    </div>
  );
}

function Legend() {
  return (
    <div className="text-muted mt-4 flex flex-wrap gap-3 text-xs">
      <span>
        <span className="bg-ok/70 mr-1 inline-block h-2 w-2 rounded" /> Present
      </span>
      <span>
        <span className="bg-warn/70 mr-1 inline-block h-2 w-2 rounded" /> Late
      </span>
      <span>
        <span className="bg-bg-soft mr-1 inline-block h-2 w-2 rounded" />{" "}
        Excused
      </span>
      <span>
        <span className="bg-danger/70 mr-1 inline-block h-2 w-2 rounded" />{" "}
        Absent
      </span>
    </div>
  );
}
