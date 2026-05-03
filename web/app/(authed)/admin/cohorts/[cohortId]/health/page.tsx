import { notFound } from "next/navigation";
import { CardSub } from "@/components/ui/card";
import { KpiGrid, StatCard } from "@/components/kpi/StatCard";
import { CohortShell } from "@/components/admin-cohort/CohortShell";
import { requireCapability } from "@/lib/auth/requireCapability";
import { getAdminCohortById } from "@/lib/queries/admin-context";
import {
  getCohortKpis,
  listAtRiskStudents,
  listRecentDayFeedback,
  listRecentPulses,
} from "@/lib/queries/faculty-cohort";
import { listCohortDays } from "@/lib/queries/cohort";
import { workingDayNumber } from "@/lib/calendar";
import {
  AtRiskList,
  DayFeedbackList,
  PulseList,
} from "@/components/health/HealthSections";

export default async function AdminCohortHealthPage({
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

  const [kpis, atRisk, dayFeedback, pulses] = await Promise.all([
    getCohortKpis(cohort.id),
    listAtRiskStudents(cohort.id),
    listRecentDayFeedback(cohort.id, recentDayNumbers, null),
    listRecentPulses(cohort.id, 5),
  ]);

  return (
    <>
      <CohortShell cohort={cohort} active="health" />

      <KpiGrid>
        <StatCard label="Students" value={kpis.students} />
        <StatCard label="Pods" value={kpis.pods} />
        <StatCard
          label="Pending review"
          value={kpis.pendingReview}
          tone={kpis.pendingReview > 0 ? "warn" : "default"}
        />
        <StatCard
          label="Help desk (open)"
          value={kpis.helpDeskOpen}
          tone={kpis.helpDeskOpen > 0 ? "danger" : "default"}
          href={`/admin/cohorts/${cohort.id}/help-desk`}
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
          studentHref={(uid) =>
            `/admin/cohorts/${cohort.id}/students/${uid}`
          }
        />
      </section>

      <section>
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="text-lg font-semibold tracking-tight">
            Recent day feedback
          </h2>
          <CardSub className="text-xs">
            last {recentDayNumbers.length} days
          </CardSub>
        </div>
        <DayFeedbackList rows={dayFeedback} />
      </section>

      <section>
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="text-lg font-semibold tracking-tight">
            Recent pulse responses
          </h2>
          <CardSub className="text-xs">last {pulses.length}</CardSub>
        </div>
        <PulseList pulses={pulses} />
      </section>
    </>
  );
}
