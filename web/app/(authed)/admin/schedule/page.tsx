import { requireCapability } from "@/lib/auth/requireCapability";
import { Card, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DayCard } from "@/components/day-card/DayCard";
import { getAdminCohort } from "@/lib/queries/admin-context";
import { listCohortDays, todayDayNumber } from "@/lib/queries/cohort";
import { fmtDate } from "@/lib/format";

export default async function AdminSchedulePage() {
  await requireCapability("schedule.write");
  const cohort = await getAdminCohort();
  if (!cohort) return <Card><CardTitle>No cohort</CardTitle></Card>;
  const days = await listCohortDays(cohort.id);

  // Cast: getAdminCohort returns a slimmer cohort; safe for todayDayNumber
  // which only reads starts_on.
  const today = todayDayNumber(
    { ...cohort, status: cohort.status as "draft" | "live" | "archived" },
  );

  // Group by week of 5 weekdays
  const weeks: { week: number; days: typeof days }[] = [];
  for (let w = 0; w < 6; w++) {
    weeks.push({ week: w + 1, days: days.slice(w * 5, w * 5 + 5) });
  }

  return (
    <div className="space-y-6">
      <header>
        <p className="text-accent font-mono text-xs tracking-widest uppercase">Schedule</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">{cohort.name}</h1>
        <p className="text-muted mt-1 text-sm">
          {fmtDate(cohort.starts_on)} → {fmtDate(cohort.ends_on)} ·{" "}
          <Badge variant={cohort.status === "live" ? "ok" : "default"}>{cohort.status}</Badge>
        </p>
        <p className="text-muted mt-1 text-sm">
          Today: Day {today} ·{" "}
          <span className="text-ink">{days.filter((d) => d.is_unlocked).length}</span> of{" "}
          {days.length} unlocked
        </p>
      </header>

      <div className="space-y-6">
        {weeks.map((w) => (
          <div key={w.week}>
            <h2 className="text-muted mb-2 text-xs font-medium tracking-widest uppercase">
              Week {w.week}
            </h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              {w.days.map((d) => (
                <DayCard
                  key={d.day_number}
                  dayNumber={d.day_number}
                  title={d.title}
                  isUnlocked={d.is_unlocked}
                  liveSessionAt={d.live_session_at}
                  capstoneKind={d.capstone_kind}
                  href={`/admin/schedule/${d.day_number}`}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
