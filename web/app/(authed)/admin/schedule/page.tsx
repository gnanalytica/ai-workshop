import Link from "next/link";
import { requireCapability } from "@/lib/auth/requireCapability";
import { Card, CardSub, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DayCard } from "@/components/day-card/DayCard";
import { getAdminCohort } from "@/lib/queries/admin-context";
import { listCohortDays, todayDayNumber } from "@/lib/queries/cohort";
import { getSupabaseServer } from "@/lib/supabase/server";
import { fmtDate } from "@/lib/format";
import { CreateCohortForm } from "./CreateCohortForm";
import { CohortRowActions } from "./CohortRowActions";

export default async function AdminSchedulePage() {
  await requireCapability("schedule.write");

  const sb = await getSupabaseServer();
  const { data: cohorts } = await sb
    .from("cohorts")
    .select("id, slug, name, starts_on, ends_on, status, created_at")
    .order("created_at", { ascending: false });

  const cohort = await getAdminCohort();
  const days = cohort ? await listCohortDays(cohort.id) : [];

  const today = cohort
    ? todayDayNumber({ ...cohort, status: cohort.status as "draft" | "live" | "archived" })
    : 0;

  const weeks: { week: number; days: typeof days }[] = [];
  for (let w = 0; w < 6; w++) {
    weeks.push({ week: w + 1, days: days.slice(w * 5, w * 5 + 5) });
  }

  return (
    <div className="space-y-8">
      <header>
        <p className="text-accent font-mono text-xs tracking-widest uppercase">Schedule</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">Cohorts</h1>
        <p className="text-muted mt-1 text-sm">
          Create and manage cohorts. The currently-active cohort&apos;s 30-day calendar appears
          below.
        </p>
      </header>

      <section>
        <h2 className="mb-3 text-lg font-semibold tracking-tight">All cohorts</h2>
        {(cohorts ?? []).length === 0 ? (
          <Card>
            <CardSub>No cohorts yet — create one below to start.</CardSub>
          </Card>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {(cohorts ?? []).map((c) => (
              <Card key={c.id}>
                <div className="flex items-baseline justify-between">
                  <CardTitle>{c.name}</CardTitle>
                  <Badge variant={c.status === "live" ? "ok" : "default"}>{c.status}</Badge>
                </div>
                <CardSub className="mt-1 font-mono text-xs">{c.slug}</CardSub>
                <p className="text-muted mt-3 text-sm">
                  {fmtDate(c.starts_on)} → {fmtDate(c.ends_on)}
                </p>
                <CohortRowActions cohortId={c.id} name={c.name} />
              </Card>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold tracking-tight">New cohort</h2>
        <Card>
          <CardSub className="mb-4">
            Creates the cohort row and seeds the standard 30-day curriculum. You can edit
            individual days afterwards.
          </CardSub>
          <CreateCohortForm />
        </Card>
      </section>

      {cohort && (
        <section>
          <header className="mb-3">
            <p className="text-muted text-xs tracking-widest uppercase">Active calendar</p>
            <h2 className="text-lg font-semibold tracking-tight">{cohort.name}</h2>
            <p className="text-muted mt-1 text-sm">
              Today: Day {today} ·{" "}
              <span className="text-ink">{days.filter((d) => d.is_unlocked).length}</span> of{" "}
              {days.length} unlocked
            </p>
          </header>
          <div className="space-y-6">
            {weeks.map((w) => (
              <div key={w.week}>
                <h3 className="text-muted mb-2 text-xs font-medium tracking-widest uppercase">
                  Week {w.week}
                </h3>
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
        </section>
      )}
    </div>
  );
}
