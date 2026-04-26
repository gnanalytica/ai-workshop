import Link from "next/link";
import { KpiGrid, StatCard } from "@/components/kpi/StatCard";
import { Card, CardSub, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DayCard } from "@/components/day-card/DayCard";
import { getMyCurrentCohort, listCohortDays, todayDayNumber } from "@/lib/queries/cohort";
import { getDashboardKpis } from "@/lib/queries/dashboard";
import { fmtDate } from "@/lib/format";

export default async function DashboardPage() {
  const cohort = await getMyCurrentCohort();
  if (!cohort) {
    return (
      <Card>
        <CardTitle>No active cohort</CardTitle>
        <CardSub className="mt-2">
          You don&apos;t have a confirmed registration yet. An admin will confirm your enrollment
          shortly.
        </CardSub>
      </Card>
    );
  }

  const today = todayDayNumber(cohort);
  const [kpis, days] = await Promise.all([
    getDashboardKpis(cohort.id),
    listCohortDays(cohort.id),
  ]);

  const todayDay = days.find((d) => d.day_number === today);
  const upcoming = days.filter((d) => d.day_number > today && d.day_number <= today + 3);

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-accent font-mono text-xs tracking-widest uppercase">{cohort.name}</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">
            Welcome back · Day {today} of 30
          </h1>
          <p className="text-muted mt-1 text-sm">
            {fmtDate(cohort.starts_on)} → {fmtDate(cohort.ends_on)}
          </p>
        </div>
        {todayDay && (
          <Button asChild>
            <Link href={`/day/${today}`}>Open today&apos;s lesson →</Link>
          </Button>
        )}
      </header>

      <KpiGrid>
        <StatCard
          label="Days complete"
          value={kpis.daysComplete}
          hint={`of ${days.length}`}
          tone="accent"
        />
        <StatCard label="Attendance" value={kpis.attendanceCount} hint="days present" />
        <StatCard
          label="Drafts in flight"
          value={kpis.pendingAssignments}
          tone={kpis.pendingAssignments > 0 ? "warn" : "default"}
        />
      </KpiGrid>

      {todayDay && (
        <section>
          <h2 className="mb-3 text-lg font-semibold tracking-tight">Today</h2>
          <DayCard
            dayNumber={todayDay.day_number}
            title={todayDay.title}
            isUnlocked={todayDay.is_unlocked}
            liveSessionAt={todayDay.live_session_at}
            capstoneKind={todayDay.capstone_kind}
            href={`/day/${todayDay.day_number}`}
          />
        </section>
      )}

      {upcoming.length > 0 && (
        <section>
          <h2 className="mb-3 text-lg font-semibold tracking-tight">Coming up</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {upcoming.map((d) => (
              <DayCard
                key={d.day_number}
                dayNumber={d.day_number}
                title={d.title}
                isUnlocked={d.is_unlocked}
                liveSessionAt={d.live_session_at}
                capstoneKind={d.capstone_kind}
                href={`/day/${d.day_number}`}
              />
            ))}
          </div>
        </section>
      )}

    </div>
  );
}
