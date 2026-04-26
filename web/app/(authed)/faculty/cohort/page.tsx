import Link from "next/link";
import { requireCapability } from "@/lib/auth/requireCapability";
import { getSession } from "@/lib/auth/session";
import { Card, CardSub, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { KpiGrid, StatCard } from "@/components/kpi/StatCard";
import { Button } from "@/components/ui/button";
import { Sparkline } from "@/components/sparkline/Sparkline";
import { getFacultyCohort } from "@/lib/queries/faculty";
import {
  getCohortKpis,
  listAtRiskStudents,
} from "@/lib/queries/faculty-cohort";
import { getCohortPodRoster } from "@/lib/queries/cohort-roster";
import { getCohortTrend } from "@/lib/queries/cohort-trends";
import { PodBoard } from "./PodBoard";

export default async function FacultyCohortPage() {
  await requireCapability("roster.read");
  const f = await getFacultyCohort();
  const me = await getSession();
  if (!f || !me) return <Card><CardTitle>You aren&apos;t assigned to a cohort.</CardTitle></Card>;
  const cohortId = f.cohort.id;

  const [kpis, atRisk, roster, trend] = await Promise.all([
    getCohortKpis(cohortId),
    listAtRiskStudents(cohortId),
    getCohortPodRoster(cohortId, me.id),
    getCohortTrend(cohortId),
  ]);

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-accent font-mono text-xs tracking-widest uppercase">{f.cohort.name} · Cohort</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">Cohort overview</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild><Link href="/faculty/leaderboard">Leaderboard →</Link></Button>
          <Button variant="outline" asChild><Link href="/faculty/stuck">Stuck queue →</Link></Button>
        </div>
      </header>

      <KpiGrid>
        <StatCard label="Students" value={kpis.students} />
        <StatCard label="Pods" value={kpis.pods} />
        <StatCard
          label="Unassigned"
          value={kpis.unassignedStudents}
          tone={kpis.unassignedStudents > 0 ? "warn" : "ok"}
        />
        <StatCard
          label="Pending review"
          value={kpis.pendingReview}
          tone={kpis.pendingReview > 0 ? "warn" : "default"}
        />
        <StatCard
          label="Stuck open"
          value={kpis.stuckOpen}
          tone={kpis.stuckOpen > 0 ? "danger" : "default"}
        />
        <StatCard
          label="At risk"
          value={atRisk.length}
          tone={atRisk.length > 0 ? "danger" : "ok"}
          hint=">3d inactive"
        />
      </KpiGrid>

      <section>
        <h2 className="mb-3 text-lg font-semibold tracking-tight">Last 14 days</h2>
        <Card>
          <div className="grid gap-6 sm:grid-cols-3">
            <Sparkline label="Labs done" data={trend.labsDone} total={trend.totalLabs} />
            <Sparkline label="Submissions" data={trend.submissions} total={trend.totalSubmissions} />
            <Sparkline label="Board posts" data={trend.posts} total={trend.totalPosts} />
          </div>
        </Card>
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold tracking-tight">Pods · drag to move</h2>
        </div>
        <PodBoard pods={roster.pods} unassigned={roster.unassigned} />
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold tracking-tight">At-risk students</h2>
        {atRisk.length === 0 ? (
          <Card><CardSub>Everyone has been active in the last 3 days.</CardSub></Card>
        ) : (
          <Card>
            <ul className="divide-y divide-line/50">
              {atRisk.map((s) => (
                <li key={s.user_id} className="flex items-center justify-between py-2 text-sm">
                  <Link href={`/faculty/student/${s.user_id}`} className="hover:text-accent">
                    <span className="text-ink font-medium">{s.full_name ?? "—"}</span>
                    {s.pod_name && <span className="text-muted ml-2">· {s.pod_name}</span>}
                  </Link>
                  <Badge variant="warn">{s.days_since_active}d inactive</Badge>
                </li>
              ))}
            </ul>
          </Card>
        )}
      </section>
    </div>
  );
}
