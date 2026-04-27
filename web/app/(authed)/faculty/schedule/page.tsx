import Link from "next/link";
import { requireCapability } from "@/lib/auth/requireCapability";
import { Card, CardSub, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DayCard } from "@/components/day-card/DayCard";
import { getFacultyCohort } from "@/lib/queries/faculty";
import { listCohortDays, todayDayNumber } from "@/lib/queries/cohort";
import { fmtDate } from "@/lib/format";

export default async function FacultySchedulePage() {
  await requireCapability("roster.read");
  const f = await getFacultyCohort();
  if (!f) {
    return (
      <Card>
        <CardTitle>No cohort to show</CardTitle>
        <CardSub className="mt-2">
          You need a faculty assignment in a cohort to view the schedule and lessons in read-only
          mode.
        </CardSub>
      </Card>
    );
  }
  const { cohort } = f;
  const today = todayDayNumber(cohort);
  const days = await listCohortDays(cohort.id);

  const todayDay = days.find((d) => d.day_number === today);
  const upcoming = days.filter((d) => d.day_number > today && d.day_number <= today + 3);
  const dayHref = (n: number) => `/faculty/day/${n}`;

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-accent font-mono text-xs tracking-widest uppercase">{cohort.name}</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">
            Schedule · Day {today} of 30
          </h1>
          <p className="text-muted mt-1 text-sm">
            {fmtDate(cohort.starts_on)} → {fmtDate(cohort.ends_on)} · read-only
          </p>
        </div>
        {todayDay && (
          <Button asChild>
            <Link href={dayHref(today)}>Open today&apos;s lesson →</Link>
          </Button>
        )}
      </header>

      <Card>
        <CardSub className="text-ink/90 text-sm leading-relaxed">
          Browse the same lessons as your cohort. Check-in, the help desk, and assignments are for
          students only.
        </CardSub>
      </Card>

      {todayDay && (
        <section>
          <h2 className="mb-3 text-lg font-semibold tracking-tight">Today</h2>
          <DayCard
            dayNumber={todayDay.day_number}
            title={todayDay.title}
            isUnlocked={todayDay.is_unlocked}
            liveSessionAt={todayDay.live_session_at}
            capstoneKind={todayDay.capstone_kind}
            href={dayHref(todayDay.day_number)}
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
                href={dayHref(d.day_number)}
              />
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="mb-3 text-lg font-semibold tracking-tight">All days</h2>
        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
          {days.map((d) => (
            <DayCard
              key={d.day_number}
              dayNumber={d.day_number}
              title={d.title}
              isUnlocked={d.is_unlocked}
              liveSessionAt={d.live_session_at}
              capstoneKind={d.capstone_kind}
              href={dayHref(d.day_number)}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
