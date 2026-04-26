import Link from "next/link";
import { requireCapability } from "@/lib/auth/requireCapability";
import { getSession } from "@/lib/auth/session";
import { Card, CardSub, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { KpiGrid, StatCard } from "@/components/kpi/StatCard";
import { Button } from "@/components/ui/button";
import {
  getFacultyCohort,
  getFacultyTodayKpis,
  listPendingSubmissions,
  listStuckOpen,
} from "@/lib/queries/faculty";
import { todayDayNumber, listCohortDays } from "@/lib/queries/cohort";
import { listAtRiskStudents } from "@/lib/queries/faculty-cohort";
import { fmtDateTime, relTime } from "@/lib/format";

export default async function FacultyTodayPage() {
  await requireCapability("schedule.read");
  const me = await getSession();
  const f = await getFacultyCohort();
  if (!f || !me) {
    return <Card><CardTitle>You aren&apos;t assigned to a cohort.</CardTitle></Card>;
  }
  const [kpis, days, subs, stuck, atRisk] = await Promise.all([
    getFacultyTodayKpis(f.cohort.id, me.id),
    listCohortDays(f.cohort.id),
    listPendingSubmissions(f.cohort.id, me.id),
    listStuckOpen(f.cohort.id, me.id),
    listAtRiskStudents(f.cohort.id),
  ]);
  const today = todayDayNumber(f.cohort);
  const todayDay = days.find((d) => d.day_number === today);

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-accent font-mono text-xs tracking-widest uppercase">
            {f.cohort.name} · Faculty
          </p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">Today&apos;s queue</h1>
          {todayDay && (
            <p className="text-muted mt-1 text-sm">
              Day {today}: {todayDay.title}
              {todayDay.live_session_at && ` · live at ${fmtDateTime(todayDay.live_session_at)}`}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/faculty/pod">My pod</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/day/today">Today&apos;s lesson</Link>
          </Button>
          <Button asChild>
            <Link href="/faculty/review">Open review queue</Link>
          </Button>
        </div>
      </header>

      <KpiGrid>
        <StatCard label="To review" value={kpis.pendingReview} tone={kpis.pendingReview > 0 ? "warn" : "ok"} />
        <StatCard label="Stuck open" value={kpis.stuckOpen} tone={kpis.stuckOpen > 0 ? "danger" : "default"} />
        <StatCard label="Pod size" value={kpis.podSize} />
        <StatCard
          label="At risk"
          value={atRisk.length}
          tone={atRisk.length > 0 ? "danger" : "ok"}
          hint=">3d inactive"
        />
        <StatCard label="Day" value={today} hint="of 30" tone="accent" />
      </KpiGrid>

      <section>
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold tracking-tight">Pending reviews</h2>
          <Button asChild size="sm" variant="ghost">
            <Link href="/faculty/review">See all</Link>
          </Button>
        </div>
        {subs.length === 0 ? (
          <Card><CardSub>Inbox zero. Nice.</CardSub></Card>
        ) : (
          <div className="space-y-2">
            {subs.slice(0, 8).map((s) => (
              <Card key={s.id} className="flex items-center justify-between p-4">
                <div className="min-w-0">
                  <p className="text-ink truncate text-sm font-medium">{s.user_name ?? "—"}</p>
                  <p className="text-muted text-xs">
                    Day {s.day_number} · {s.assignment_title} · {relTime(s.updated_at)}
                  </p>
                </div>
                <Button asChild size="sm" variant="outline">
                  <Link href={`/faculty/review?id=${s.id}`}>Review</Link>
                </Button>
              </Card>
            ))}
          </div>
        )}
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold tracking-tight">Stuck queue</h2>
          <Button asChild size="sm" variant="ghost">
            <Link href="/faculty/stuck">Open queue</Link>
          </Button>
        </div>
        {stuck.length === 0 ? (
          <Card><CardSub>No one stuck right now.</CardSub></Card>
        ) : (
          <div className="space-y-2">
            {stuck.map((s) => (
              <Card key={s.id} className="flex items-center justify-between p-4">
                <div className="min-w-0">
                  <p className="text-ink text-sm font-medium">{s.user_name ?? "—"}</p>
                  <p className="text-muted text-xs">
                    {s.message ?? "—"}
                    {s.claimed_by_name && ` · helping: ${s.claimed_by_name}`}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={s.kind === "tech" ? "danger" : "warn"}>{s.kind}</Badge>
                  <Badge variant={s.status === "helping" ? "accent" : "default"}>{s.status}</Badge>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
