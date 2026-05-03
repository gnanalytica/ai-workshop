import Link from "next/link";
import { requireCapability } from "@/lib/auth/requireCapability";
import { getSession } from "@/lib/auth/session";
import { Card, CardSub, CardTitle } from "@/components/ui/card";
import { KpiGrid, StatCard } from "@/components/kpi/StatCard";
import { getFacultyCohort } from "@/lib/queries/faculty";
import { getFacultyPods } from "@/lib/queries/faculty-pod";
import { listCohortDays, todayDayNumber } from "@/lib/queries/cohort";
import {
  getPodKpis,
  listAtRiskInPod,
  listRecentDayFeedback,
  listRecentPulses,
} from "@/lib/queries/faculty-cohort";
import {
  AtRiskList,
  DayFeedbackList,
  PulseList,
} from "@/components/health/HealthSections";

export default async function FacultyPodHealthPage() {
  await requireCapability("roster.read");
  const f = await getFacultyCohort();
  const me = await getSession();
  if (!f || !me)
    return (
      <Card>
        <CardTitle>You aren&apos;t assigned to a cohort.</CardTitle>
      </Card>
    );

  const pods = await getFacultyPods(f.cohort.id, me.id);
  const myPod = pods[0] ?? null;
  if (!myPod) {
    return (
      <div className="space-y-4">
        <header>
          <p className="text-accent font-mono text-xs tracking-widest uppercase">
            {f.cohort.name}
          </p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">
            Pod health
          </h1>
        </header>
        <Card>
          <CardTitle className="mb-2">No pod assigned yet</CardTitle>
          <CardSub>
            Open the{" "}
            <Link
              href="/faculty/cohort#pods"
              className="text-accent hover:underline"
            >
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
    .slice(0, 5);

  const [kpis, atRisk, dayFeedback, pulses] = await Promise.all([
    getPodKpis(f.cohort.id, myPod.pod_id),
    listAtRiskInPod(f.cohort.id, myPod.pod_id),
    listRecentDayFeedback(f.cohort.id, recentDayNumbers, myPod.pod_id),
    listRecentPulses(f.cohort.id, 3),
  ]);

  return (
    <div className="space-y-6">
      <header>
        <p className="text-accent font-mono text-xs tracking-widest uppercase">
          {f.cohort.name} · {myPod.pod_name}
        </p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">
          Pod health
        </h1>
        <CardSub className="mt-1">
          KPIs, at-risk students, and recent feedback for your pod.
        </CardSub>
      </header>

      <KpiGrid>
        <StatCard label="Members" value={kpis.members} />
        <StatCard
          label="Attendance"
          value={`${kpis.attendancePct}%`}
          tone={
            kpis.attendancePct >= 80
              ? "ok"
              : kpis.attendancePct >= 60
                ? "warn"
                : "danger"
          }
        />
        <StatCard
          label="Submission rate"
          value={`${kpis.submissionPct}%`}
          tone={
            kpis.submissionPct >= 70
              ? "ok"
              : kpis.submissionPct >= 50
                ? "warn"
                : "danger"
          }
        />
        <StatCard
          label="Avg feedback"
          value={
            kpis.avgFeedbackRating !== null
              ? kpis.avgFeedbackRating.toFixed(1)
              : "—"
          }
          hint={`last 3 days · ${kpis.feedbackResponses} resp`}
          tone={
            kpis.avgFeedbackRating === null
              ? "default"
              : kpis.avgFeedbackRating >= 4
                ? "ok"
                : kpis.avgFeedbackRating >= 3
                  ? "warn"
                  : "danger"
          }
        />
      </KpiGrid>

      <section>
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="text-lg font-semibold tracking-tight">
            At-risk students
          </h2>
          <CardSub className="text-xs">{atRisk.length} flagged</CardSub>
        </div>
        <AtRiskList
          students={atRisk}
          studentHref={(uid) => `/faculty/student/${uid}`}
        />
      </section>

      <section>
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="text-lg font-semibold tracking-tight">
            Recent day feedback
          </h2>
          <CardSub className="text-xs">last {recentDayNumbers.length} days</CardSub>
        </div>
        <DayFeedbackList
          rows={dayFeedback}
          detailHref={(d) => `/faculty/day/${d}`}
        />
      </section>

      <section>
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="text-lg font-semibold tracking-tight">
            Recent pulse responses
          </h2>
          <CardSub className="text-xs">cohort-wide</CardSub>
        </div>
        <PulseList pulses={pulses} />
      </section>
    </div>
  );
}
