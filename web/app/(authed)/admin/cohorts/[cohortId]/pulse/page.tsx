import { notFound } from "next/navigation";
import { Card, CardSub } from "@/components/ui/card";
import { CohortShell } from "@/components/admin-cohort/CohortShell";
import { StackedBarChart, type BarRow } from "@/components/charts/BarChart";
import { EngagementChart } from "@/components/charts/EngagementChart";
import { ActivityHeatmap } from "@/components/charts/ActivityHeatmap";
import { ChangeBand, type ChangeSignal } from "@/components/health/ChangeBand";
import { PollsExplorer } from "@/components/admin-cohort/PollsExplorer";
import { requireCapability } from "@/lib/auth/requireCapability";
import { getAdminCohortById } from "@/lib/queries/admin-context";
import {
  AtRiskList,
  DayFeedbackList,
} from "@/components/health/HealthSections";
import { FuzzyTopicsPanel } from "@/components/health/FuzzyTopicsPanel";
import { LowRatingTriage } from "@/components/health/LowRatingTriage";
import { CohortProgressCard } from "@/components/health/CohortProgressCard";
import {
  getCohortKpis,
  listAtRiskStudents,
  listRecentDayFeedback,
} from "@/lib/queries/faculty-cohort";
import {
  getActivityMatrix,
  getAnalyticsSummary,
  getAttendanceByDay,
  getCohortProgressByDay,
  getEngagementByDay,
} from "@/lib/queries/analytics";
import {
  listRecentFuzzyTopics,
  listLowRatingFeedback,
} from "@/lib/queries/day-feedback";
import { listCohortPolls } from "@/lib/queries/polls-overview";
import { listCohortDays } from "@/lib/queries/cohort";
import { workingDayNumber } from "@/lib/calendar";
import { listRoster, listPods } from "@/lib/queries/admin";
import { getStudentActivity } from "@/lib/queries/activity-score";
import { PulseTabs, type PulseTab } from "@/components/admin-cohort/pulse/PulseTabs";
import {
  PulsePodsTab,
  type PulsePodRow,
} from "@/components/admin-cohort/pulse/PulsePodsTab";
import {
  PulseStudentsTab,
  type PulseStudentRow,
} from "@/components/admin-cohort/pulse/PulseStudentsTab";

export default async function AdminCohortPulsePage({
  params,
  searchParams,
}: {
  params: Promise<{ cohortId: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const { cohortId } = await params;
  const sp = await searchParams;
  const tab: PulseTab =
    sp.tab === "pods" || sp.tab === "students" ? sp.tab : "class";
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

  const [
    kpis,
    summary,
    byDay,
    engagement,
    atRisk,
    dayFeedback,
    polls,
    fuzzyTopics,
    lowRating,
    progress,
    activityMatrix,
  ] = await Promise.all([
    getCohortKpis(cohort.id),
    getAnalyticsSummary(cohort.id),
    getAttendanceByDay(cohort.id),
    getEngagementByDay(cohort.id),
    listAtRiskStudents(cohort.id),
    listRecentDayFeedback(cohort.id, recentDayNumbers, null),
    listCohortPolls(cohort.id),
    listRecentFuzzyTopics(cohort.id, recentDayNumbers, 25),
    listLowRatingFeedback(cohort.id, recentDayNumbers, 2, 20),
    getCohortProgressByDay(cohort.id, recentDayNumbers),
    getActivityMatrix(
      cohort.id,
      days
        .filter((d) => d.is_unlocked && d.day_number <= today)
        .map((d) => d.day_number),
    ),
  ]);

  const hasMarkedAttendance = byDay.length > 0;
  const recentEngagement = engagement
    .filter((e) => e.day_number <= today)
    .sort((a, b) => a.day_number - b.day_number)
    .slice(-7);

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

  // Activity is the canonical metric. We always show auto-detected engagement
  // first; manual attendance, when present, lives in a collapsible section.
  const todayEngagement = recentEngagement.at(-1);
  const headlinePct = todayEngagement
    ? Math.round(todayEngagement.rate * 100)
    : todayAttendancePct;
  const headlineLabel = "Activity · most recent day";
  const headlineHint = todayEngagement
    ? `${todayEngagement.active}/${todayEngagement.total} active on Day ${todayEngagement.day_number}`
    : hasMarkedAttendance && todayBucket
      ? `${todayBucket.present}/${todayBucketTotal} marked present on Day ${todayBucket.day_number}`
      : "no activity yet";

  const sparkValues =
    recentEngagement.length > 0
      ? recentEngagement.map((e) => e.rate)
      : recentByDay.map((d) => {
          const t = bucketTotal(d);
          return t > 0 ? d.present / t : 0;
        });

  // Trend delta — % point difference vs the previous day shown in the spark.
  const headlineDelta = (() => {
    if (sparkValues.length < 2) return null;
    const cur = sparkValues[sparkValues.length - 1] ?? 0;
    const prev = sparkValues[sparkValues.length - 2] ?? 0;
    return Math.round((cur - prev) * 100);
  })();

  // "What changed since the previous day" — best-effort using deltas we have.
  const prevEngagement = recentEngagement.at(-2);
  const inactiveToday = todayEngagement
    ? todayEngagement.total - todayEngagement.active
    : null;
  const lowRatingToday = todayEngagement
    ? lowRating.filter((r) => r.day_number === todayEngagement.day_number).length
    : 0;
  const recentProgress = progress.at(-1);
  const submissionsCount = recentProgress?.submitted ?? null;
  const submissionsExpected = recentProgress?.submittable_assignments
    ? recentProgress.submittable_assignments * (recentProgress.cohort_size || 0)
    : null;

  const changeSignals: ChangeSignal[] = [];
  if (todayEngagement) {
    const deltaDir =
      headlineDelta === null || headlineDelta === 0
        ? "flat"
        : headlineDelta > 0
          ? "up"
          : "down";
    changeSignals.push({
      label: `Activity Δ`,
      value:
        headlineDelta === null
          ? `${Math.round(todayEngagement.rate * 100)}%`
          : `${headlineDelta > 0 ? "+" : ""}${headlineDelta}pp`,
      hint: prevEngagement
        ? `Day ${todayEngagement.day_number} vs Day ${prevEngagement.day_number}`
        : `Day ${todayEngagement.day_number}`,
      tone:
        headlineDelta === null || headlineDelta === 0
          ? "default"
          : headlineDelta < -5
            ? "danger"
            : headlineDelta < 0
              ? "warn"
              : "ok",
      direction: deltaDir,
    });
  }
  if (inactiveToday !== null && todayEngagement) {
    changeSignals.push({
      label: "Inactive today",
      value: String(inactiveToday),
      hint: `of ${todayEngagement.total} on Day ${todayEngagement.day_number}`,
      tone:
        inactiveToday === 0
          ? "ok"
          : inactiveToday <= Math.max(2, todayEngagement.total * 0.1)
            ? "warn"
            : "danger",
    });
  }
  changeSignals.push({
    label: "New ≤2★ ratings",
    value: String(lowRatingToday),
    hint:
      todayEngagement
        ? `on Day ${todayEngagement.day_number} · ${lowRating.length} in last ${recentDayNumbers.length}d`
        : "no recent day",
    tone: lowRatingToday === 0 ? "ok" : lowRatingToday <= 2 ? "warn" : "danger",
  });
  changeSignals.push({
    label: "Grading queue",
    value: String(summary.pendingReview),
    hint:
      submissionsCount !== null && submissionsExpected
        ? `${submissionsCount}/${submissionsExpected} submitted on Day ${recentProgress?.day_number}`
        : summary.pendingReview === 0
          ? "queue clear"
          : "awaiting review",
    tone:
      summary.pendingReview === 0
        ? "ok"
        : summary.pendingReview > 10
          ? "danger"
          : summary.pendingReview > 5
            ? "warn"
            : "default",
  });

  const heatmapDays = days
    .filter((d) => d.is_unlocked && d.day_number <= today)
    .map((d) => d.day_number);

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

  // Build pods/students breakdowns on demand. React `cache()` dedupes the
  // underlying fetches (registrations, submissions, etc.) so re-running them
  // here is cheap.
  let podRows: PulsePodRow[] = [];
  let studentRows: PulseStudentRow[] = [];
  if (tab === "pods" || tab === "students") {
    const [roster, pods, activity] = await Promise.all([
      listRoster(cohort.id),
      listPods(cohort.id),
      getStudentActivity(cohort.id),
    ]);
    const confirmedRoster = roster.filter((r) => r.status === "confirmed");

    if (tab === "students") {
      studentRows = confirmedRoster.map((r) => {
        const a = activity.get(r.user_id);
        return {
          user_id: r.user_id,
          full_name: r.full_name,
          email: r.email,
          pod_name: r.pod_name,
          score: a?.score ?? 0,
          recent_score: a?.recent_score ?? 0,
          submissions: a?.signals.submissions ?? 0,
          quiz_attempts: a?.signals.quiz_attempts ?? 0,
          feedback: a?.signals.feedback ?? 0,
          poll_votes: a?.signals.poll_votes ?? 0,
          lab_progress: a?.signals.lab_progress ?? 0,
          days_since_active: a?.days_since_active ?? null,
          studentHref: studentHref(r.user_id),
        };
      });
    }

    if (tab === "pods") {
      // Group confirmed students by pod name (RosterRow exposes pod_name only).
      // Pod metadata (faculty names, member_count) comes from listPods.
      const byPod = new Map<string, typeof confirmedRoster>();
      for (const r of confirmedRoster) {
        const key = r.pod_name ?? "__unassigned__";
        const arr = byPod.get(key) ?? [];
        arr.push(r);
        byPod.set(key, arr);
      }

      const aggregate = (members: typeof confirmedRoster) => {
        if (members.length === 0) {
          return {
            avg_activity: 0,
            avg_recent: 0,
            active_3d: 0,
            inactive_3d: 0,
            submissions: 0,
            quiz_attempts: 0,
            feedback: 0,
            poll_votes: 0,
            lab_progress: 0,
          };
        }
        let scoreSum = 0;
        let recentSum = 0;
        let active3d = 0;
        let inactive3d = 0;
        let submissions = 0;
        let quiz_attempts = 0;
        let feedback = 0;
        let poll_votes = 0;
        let lab_progress = 0;
        for (const m of members) {
          const a = activity.get(m.user_id);
          const s = a?.score ?? 0;
          const rs = a?.recent_score ?? 0;
          const dsa = a?.days_since_active ?? null;
          scoreSum += s;
          recentSum += rs;
          if (rs > 0) active3d++;
          if (dsa === null || dsa >= 3) inactive3d++;
          submissions += a?.signals.submissions ?? 0;
          quiz_attempts += a?.signals.quiz_attempts ?? 0;
          feedback += a?.signals.feedback ?? 0;
          poll_votes += a?.signals.poll_votes ?? 0;
          lab_progress += a?.signals.lab_progress ?? 0;
        }
        return {
          avg_activity: scoreSum / members.length,
          avg_recent: recentSum / members.length,
          active_3d: active3d,
          inactive_3d: inactive3d,
          submissions,
          quiz_attempts,
          feedback,
          poll_votes,
          lab_progress,
        };
      };

      podRows = pods.map((p) => {
        const members = byPod.get(p.name) ?? [];
        return {
          pod_id: p.pod_id,
          name: p.name,
          member_count: members.length || p.member_count,
          faculty_names: p.faculty_names,
          ...aggregate(members),
        };
      });

      // Surface an "unassigned" pseudo-pod when there are confirmed students
      // not in any pod, so they're not silently dropped from the view.
      const unassigned = byPod.get("__unassigned__") ?? [];
      if (unassigned.length > 0) {
        podRows.push({
          pod_id: "__unassigned__",
          name: "(Unassigned)",
          member_count: unassigned.length,
          faculty_names: [],
          ...aggregate(unassigned),
        });
      }

    }
  }

  return (
    <>
      <CohortShell cohort={cohort} active="pulse" />

      <PulseTabs active={tab} />

      {tab === "pods" && (
        <section className="space-y-3">
          <header className="border-line/40 flex flex-wrap items-baseline justify-between gap-2 border-b-2 pb-2">
            <h2 className="text-base font-semibold tracking-tight">
              Pods breakdown
            </h2>
            <p className="text-muted text-xs">
              {podRows.length} pod{podRows.length === 1 ? "" : "s"} · sorted
              ascending by recent activity (struggling pods first) — click any
              column to re-sort
            </p>
          </header>
          <PulsePodsTab rows={podRows} />
        </section>
      )}

      {tab === "students" && (
        <section className="space-y-3">
          <header className="border-line/40 flex flex-wrap items-baseline justify-between gap-2 border-b-2 pb-2">
            <h2 className="text-base font-semibold tracking-tight">
              Students breakdown
            </h2>
            <p className="text-muted text-xs">
              {studentRows.length} confirmed student
              {studentRows.length === 1 ? "" : "s"} · sorted ascending by recent
              activity — click any column to re-sort
            </p>
          </header>
          <PulseStudentsTab rows={studentRows} />
        </section>
      )}

      {tab !== "class" ? null : (
        <ClassPulsePanels
          cohortId={cohort.id}
          today={today}
          kpis={kpis}
          summary={summary}
          atRisk={atRisk}
          headlinePct={headlinePct}
          headlineLabel={headlineLabel}
          headlineHint={headlineHint}
          headlineDelta={headlineDelta}
          sparkValues={sparkValues}
          changeSignals={changeSignals}
          engagement={engagement}
          activityMatrix={activityMatrix}
          heatmapDays={heatmapDays}
          chartRows={chartRows}
          hasMarkedAttendance={hasMarkedAttendance}
          progress={progress}
          recentDayNumbers={recentDayNumbers}
          dayFeedback={dayFeedback}
          fuzzyTopics={fuzzyTopics}
          lowRating={lowRating}
          polls={polls}
          studentHref={studentHref}
        />
      )}
    </>
  );
}

function ClassPulsePanels(props: {
  cohortId: string;
  today: number;
  kpis: Awaited<ReturnType<typeof getCohortKpis>>;
  summary: Awaited<ReturnType<typeof getAnalyticsSummary>>;
  atRisk: Awaited<ReturnType<typeof listAtRiskStudents>>;
  headlinePct: number | null;
  headlineLabel: string;
  headlineHint: string;
  headlineDelta: number | null;
  sparkValues: number[];
  changeSignals: ChangeSignal[];
  engagement: Awaited<ReturnType<typeof getEngagementByDay>>;
  activityMatrix: Awaited<ReturnType<typeof getActivityMatrix>>;
  heatmapDays: number[];
  chartRows: BarRow[];
  hasMarkedAttendance: boolean;
  progress: Awaited<ReturnType<typeof getCohortProgressByDay>>;
  recentDayNumbers: number[];
  dayFeedback: Awaited<ReturnType<typeof listRecentDayFeedback>>;
  fuzzyTopics: Awaited<ReturnType<typeof listRecentFuzzyTopics>>;
  lowRating: Awaited<ReturnType<typeof listLowRatingFeedback>>;
  polls: Awaited<ReturnType<typeof listCohortPolls>>;
  studentHref: (uid: string) => string;
}) {
  const {
    today,
    kpis,
    summary,
    atRisk,
    headlinePct,
    headlineLabel,
    headlineHint,
    headlineDelta,
    sparkValues,
    changeSignals,
    engagement,
    activityMatrix,
    heatmapDays,
    chartRows,
    hasMarkedAttendance,
    progress,
    recentDayNumbers,
    dayFeedback,
    fuzzyTopics,
    lowRating,
    polls,
    studentHref,
  } = props;

  return (
    <>
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
          label={headlineLabel}
          value={headlinePct === null ? "—" : `${headlinePct}%`}
          hint={headlineHint}
          tone={
            headlinePct === null
              ? "default"
              : headlinePct >= 70
                ? "ok"
                : headlinePct >= 50
                  ? "warn"
                  : "danger"
          }
          delta={headlineDelta}
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

      {/* What changed since yesterday — a single-glance pulse strip. */}
      <ChangeBand signals={changeSignals} />

      {/* Question 1 — Are they active? */}
      <Group
        title="Are they active?"
        sub="Auto-detected — a student counts as active on a day when they submit, take a quiz, give feedback, vote, or tick a lab."
        tone="accent"
      >
        <div className="space-y-2">
          <SectionHead
            title="Activity by day"
            sub={`${engagement.reduce((s, e) => s + e.active, 0)} active events across ${engagement.length} day${engagement.length === 1 ? "" : "s"}`}
          />
          {engagement.length === 0 ? (
            <Card>
              <CardSub>
                No student activity recorded yet for this cohort.
              </CardSub>
            </Card>
          ) : (
            <Card>
              <EngagementChart rows={engagement} />
            </Card>
          )}
        </div>
        {activityMatrix.length > 0 && heatmapDays.length > 0 && (
          <div className="space-y-2">
            <SectionHead
              title="Who's drifting?"
              sub={`${activityMatrix.length} students × ${heatmapDays.length} day${heatmapDays.length === 1 ? "" : "s"} · sorted by least active first`}
            />
            <ActivityHeatmap
              rows={activityMatrix}
              days={heatmapDays}
              studentHref={studentHref}
            />
          </div>
        )}
        {hasMarkedAttendance && (
          <details className="border-line bg-card/60 group rounded-lg border">
            <summary className="text-muted hover:text-ink cursor-pointer px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em]">
              Manually marked attendance ({chartRows.length} day
              {chartRows.length === 1 ? "" : "s"})
            </summary>
            <div className="px-4 pb-4">
              <StackedBarChart rows={chartRows} />
              <Legend />
            </div>
          </details>
        )}
      </Group>

      {/* Question 2 — Are they keeping up? */}
      <Group
        title="Are they keeping up?"
        sub="Curriculum progress, grading queue, and students who need a nudge."
        tone="warn"
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
            title="Quiz pass & submission rate by day"
            sub={`${recentDayNumbers.length} most recent day${recentDayNumbers.length === 1 ? "" : "s"} · pass = score ≥ 60`}
          />
          <CohortProgressCard rows={progress} />
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
        sub="Day-end feedback ratings, qualitative answers, and low-rating triage."
        tone="ok"
      >
        <div className="space-y-2">
          <SectionHead
            title="Recent day feedback"
            sub={`last ${recentDayNumbers.length} day${recentDayNumbers.length === 1 ? "" : "s"} · response rate vs ${kpis.students} confirmed`}
          />
          <DayFeedbackList rows={dayFeedback} cohortSize={kpis.students} />
        </div>

        <div className="space-y-2">
          <SectionHead
            title="What's still fuzzy?"
            sub={
              fuzzyTopics.length === 0
                ? "no qualitative answers yet"
                : `${fuzzyTopics.length} qualitative answer${fuzzyTopics.length === 1 ? "" : "s"} · noise filtered`
            }
          />
          <FuzzyTopicsPanel entries={fuzzyTopics} />
        </div>

        <div className="space-y-2">
          <SectionHead
            title="Low-rating triage"
            sub={
              lowRating.length === 0
                ? "no 1- or 2-star ratings in the window"
                : `${lowRating.length} student${lowRating.length === 1 ? "" : "s"} flagged ≤ 2★ recently — consider reaching out`
            }
          />
          <LowRatingTriage entries={lowRating} studentHref={studentHref} />
        </div>
      </Group>

      {/* Question 4 — Polls + pulses */}
      <Group
        title="Polls and pulses"
        sub={`${polls.length} total · curriculum polls (with day) and live pulses (no day) across the cohort run.`}
        tone="muted"
      >
        <PollsExplorer polls={polls} />
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
              delta > 0
                ? "text-ok"
                : delta < 0
                  ? "text-danger"
                  : "text-muted"
            }`}
            title="vs previous day"
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

type GroupTone = "default" | "accent" | "ok" | "warn" | "danger" | "muted";

const GROUP_BORDER: Record<GroupTone, string> = {
  default: "border-line/40",
  accent: "border-accent/60",
  ok: "border-ok/60",
  warn: "border-warn/60",
  danger: "border-danger/60",
  muted: "border-line/30",
};

const GROUP_DOT: Record<GroupTone, string> = {
  default: "bg-line",
  accent: "bg-accent",
  ok: "bg-ok",
  warn: "bg-warn",
  danger: "bg-danger",
  muted: "bg-muted/40",
};

function Group({
  title,
  sub,
  tone = "default",
  children,
}: {
  title: string;
  sub: string;
  tone?: GroupTone;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3">
      <header
        className={`flex flex-wrap items-baseline justify-between gap-2 border-b-2 ${GROUP_BORDER[tone]} pb-2`}
      >
        <h2 className="flex items-center gap-2 text-base font-semibold tracking-tight">
          <span
            aria-hidden
            className={`inline-block h-2 w-2 rounded-full ${GROUP_DOT[tone]}`}
          />
          {title}
        </h2>
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
