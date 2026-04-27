import { notFound } from "next/navigation";
import Link from "next/link";
import { Card, CardSub } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { KpiGrid, StatCard } from "@/components/kpi/StatCard";
import { CohortShell } from "@/components/admin-cohort/CohortShell";
import { getAdminCohortById } from "@/lib/queries/admin-context";
import { getAdminCohortKpis } from "@/lib/queries/admin";
import { listCohortActivity, type ActivityKind } from "@/lib/queries/activity";
import { fmtDateTime, relTime } from "@/lib/format";

const KIND_TONE: Record<ActivityKind, "default" | "ok" | "warn" | "accent" | "danger"> = {
  registration: "accent",
  lab: "ok",
  submission: "ok",
  attendance: "default",
  stuck: "warn",
  kudos: "accent",
};

export default async function AdminCohortHome({
  params,
}: {
  params: Promise<{ cohortId: string }>;
}) {
  const { cohortId } = await params;
  const cohort = await getAdminCohortById(cohortId);
  if (!cohort) notFound();

  const [kpis, activity] = await Promise.all([
    getAdminCohortKpis(cohort.id),
    listCohortActivity(cohort.id, 25),
  ]);

  return (
    <>
      <CohortShell cohort={cohort} active="home" />

      <KpiGrid>
        <StatCard
          label="Confirmed"
          value={kpis.confirmed}
          tone="ok"
          hint="students"
          href={`/admin/cohorts/${cohort.id}/roster`}
        />
        <StatCard
          label="Pending"
          value={kpis.pending}
          tone={kpis.pending > 0 ? "warn" : "default"}
          href={`/admin/cohorts/${cohort.id}/roster?status=pending`}
        />
        <StatCard
          label="Faculty"
          value={kpis.faculty}
          href={`/admin/cohorts/${cohort.id}/roster?tab=faculty`}
        />
        <StatCard
          label="Pods"
          value={kpis.pods}
          href={`/admin/cohorts/${cohort.id}/pods`}
        />
      </KpiGrid>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold tracking-tight">Recent activity</h2>
          <CardSub className="text-xs">last {activity.length} events</CardSub>
        </div>
        {activity.length === 0 ? (
          <Card>
            <CardSub>Nothing yet — the cohort hasn&apos;t started moving.</CardSub>
          </Card>
        ) : (
          <Card className="p-0">
            <ul className="divide-line/50 max-h-[480px] divide-y overflow-auto">
              {activity.map((it) => (
                <li
                  key={it.id}
                  className="hover:bg-bg-soft flex items-baseline justify-between gap-3 px-5 py-2.5 text-sm transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <Badge variant={KIND_TONE[it.kind]}>{it.kind}</Badge>
                      <span className="text-ink font-medium">
                        {it.user_name ?? "—"}
                      </span>
                    </div>
                    <p className="text-muted mt-0.5 truncate text-xs">
                      {it.detail} · {fmtDateTime(it.at)}
                    </p>
                  </div>
                  <span className="text-muted shrink-0 text-xs">
                    {relTime(it.at)}
                  </span>
                </li>
              ))}
            </ul>
          </Card>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold tracking-tight">Quick links</h2>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          <Link
            className="border-line hover:border-accent/40 hover:bg-bg-soft rounded-md border p-3 text-sm transition-colors"
            href={`/admin/cohorts/${cohort.id}/grading`}
          >
            <div className="text-ink font-medium">Grading queue</div>
            <div className="text-muted text-xs">Review submissions</div>
          </Link>
          <Link
            className="border-line hover:border-accent/40 hover:bg-bg-soft rounded-md border p-3 text-sm transition-colors"
            href={`/admin/cohorts/${cohort.id}/stuck`}
          >
            <div className="text-ink font-medium">Escalations</div>
            <div className="text-muted text-xs">Tech + cohort-wide tickets</div>
          </Link>
          <Link
            className="border-line hover:border-accent/40 hover:bg-bg-soft rounded-md border p-3 text-sm transition-colors"
            href={`/admin/cohorts/${cohort.id}/analytics`}
          >
            <div className="text-ink font-medium">Analytics</div>
            <div className="text-muted text-xs">Attendance + at-risk</div>
          </Link>
          <Link
            className="border-line hover:border-accent/40 hover:bg-bg-soft rounded-md border p-3 text-sm transition-colors"
            href="/board?mod=1"
          >
            <div className="text-ink font-medium">Board moderation</div>
            <div className="text-muted text-xs">Pin / hide / delete</div>
          </Link>
        </div>
      </section>
    </>
  );
}
