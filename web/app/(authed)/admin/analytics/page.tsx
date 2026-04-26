import { requireCapability } from "@/lib/auth/requireCapability";
import { Card, CardSub, CardTitle } from "@/components/ui/card";
import { KpiGrid, StatCard } from "@/components/kpi/StatCard";
import { StudentRow } from "@/components/student-row/StudentRow";
import { StackedBarChart, type BarRow } from "@/components/charts/BarChart";
import { getAdminCohort } from "@/lib/queries/admin-context";
import {
  getAnalyticsSummary,
  getAttendanceByDay,
  getAtRisk,
} from "@/lib/queries/analytics";

export default async function AdminAnalyticsPage() {
  await requireCapability("analytics.read:cohort");
  const cohort = await getAdminCohort();
  if (!cohort) return <Card><CardTitle>No cohort</CardTitle></Card>;
  const [summary, byDay, atRisk] = await Promise.all([
    getAnalyticsSummary(cohort.id),
    getAttendanceByDay(cohort.id),
    getAtRisk(cohort.id, 3),
  ]);

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
    <div className="space-y-8">
      <header>
        <p className="text-accent font-mono text-xs tracking-widest uppercase">Analytics</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">{cohort.name}</h1>
      </header>

      <KpiGrid>
        <StatCard label="Confirmed" value={summary.totalStudents} tone="ok" />
        <StatCard
          label="Avg days complete"
          value={summary.avgDaysComplete.toFixed(1)}
          hint="of 30"
          tone="accent"
        />
        <StatCard
          label="Attendance rate"
          value={`${(summary.attendanceRate * 100).toFixed(0)}%`}
          tone={summary.attendanceRate > 0.7 ? "ok" : "warn"}
        />
        <StatCard
          label="Pending review"
          value={summary.pendingReview}
          tone={summary.pendingReview > 5 ? "warn" : "default"}
        />
      </KpiGrid>

      <section>
        <h2 className="mb-3 text-lg font-semibold tracking-tight">Attendance by day</h2>
        {chartRows.length === 0 ? (
          <Card><CardSub>No attendance recorded yet.</CardSub></Card>
        ) : (
          <Card>
            <StackedBarChart rows={chartRows} />
            <div className="text-muted mt-4 flex flex-wrap gap-3 text-xs">
              <span><span className="mr-1 inline-block h-2 w-2 rounded bg-emerald-500/70" /> Present</span>
              <span><span className="mr-1 inline-block h-2 w-2 rounded bg-amber-500/70" /> Late</span>
              <span><span className="bg-bg-soft mr-1 inline-block h-2 w-2 rounded" /> Excused</span>
              <span><span className="mr-1 inline-block h-2 w-2 rounded bg-red-500/70" /> Absent</span>
            </div>
          </Card>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold tracking-tight">At-risk students</h2>
        {atRisk.length === 0 ? (
          <Card><CardSub>Everyone&apos;s on track. ✨</CardSub></Card>
        ) : (
          <Card className="space-y-3">
            {atRisk.map((s) => (
              <div key={s.user_id} className="flex items-center gap-3">
                <StudentRow
                  fullName={s.full_name}
                  email={s.email}
                  hint={`${s.days_present}d present · ${s.labs_done} labs done`}
                  status="at_risk"
                  className="flex-1"
                />
              </div>
            ))}
          </Card>
        )}
      </section>
    </div>
  );
}
