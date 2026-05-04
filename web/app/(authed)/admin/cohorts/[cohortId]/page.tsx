import { notFound } from "next/navigation";
import Link from "next/link";
import { Card, CardSub } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { KpiGrid, StatCard } from "@/components/kpi/StatCard";
import { CohortShell } from "@/components/admin-cohort/CohortShell";
import { getAdminCohortById } from "@/lib/queries/admin-context";
import { getAdminCohortKpis, listPods } from "@/lib/queries/admin";
import { listCohortDays } from "@/lib/queries/cohort";
import { listCohortActivity, type ActivityKind } from "@/lib/queries/activity";
import { fmtDateTime, relTime } from "@/lib/format";
import { workingDayNumber } from "@/lib/calendar";
import { listRecentDaySummaries } from "@/lib/queries/day-feedback";
import { FeedbackPanel } from "@/components/day-feedback/FeedbackPanel";

const KIND_TONE: Record<ActivityKind, "default" | "ok" | "warn" | "accent" | "danger"> = {
  registration: "accent",
  lab: "ok",
  submission: "ok",
  attendance: "default",
  help_desk: "warn",
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

  const today = Math.min(30, workingDayNumber(cohort.starts_on, new Date()));
  const [kpis, activity, feedbackSummaries, pods, days] = await Promise.all([
    getAdminCohortKpis(cohort.id),
    listCohortActivity(cohort.id, 25),
    listRecentDaySummaries(cohort.id, today, 5),
    listPods(cohort.id),
    listCohortDays(cohort.id),
  ]);
  const unlockedDays = days.filter((d) => d.is_unlocked).length;
  const upcomingDays = days
    .filter((d) => !d.is_unlocked && d.day_number >= today)
    .slice(0, 3);
  const podsWithoutFaculty = pods.filter((p) => p.faculty_count === 0).length;
  const podsBelowMin = pods.filter((p) => p.member_count < 3).length;

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

      <FeedbackPanel
        title="Day feedback"
        subtitle="Last 5 days · cohort-wide · click into a day for individual responses"
        scope="cohort-wide"
        hrefBase={`/admin/cohorts/${cohort.id}/feedback`}
        summaries={feedbackSummaries}
      />

      <section className="grid gap-4 lg:grid-cols-2">
        <Card>
          <div className="flex items-baseline justify-between gap-2">
            <h2 className="text-lg font-semibold tracking-tight">Pods</h2>
            <Link
              href={`/admin/cohorts/${cohort.id}/pods`}
              className="text-accent text-xs"
            >
              Manage →
            </Link>
          </div>
          <CardSub className="mt-1">
            {pods.length} {pods.length === 1 ? "pod" : "pods"}
            {podsWithoutFaculty > 0 && ` · ${podsWithoutFaculty} without faculty`}
            {podsBelowMin > 0 && ` · ${podsBelowMin} below min size`}
          </CardSub>
          {pods.length === 0 ? (
            <CardSub className="mt-3">No pods yet.</CardSub>
          ) : (
            <ul className="divide-line/50 mt-3 divide-y text-sm">
              {pods.slice(0, 6).map((p) => (
                <li
                  key={p.pod_id}
                  className="flex items-baseline justify-between gap-2 py-1.5"
                >
                  <span className="text-ink truncate">{p.name}</span>
                  <span className="text-muted shrink-0 text-xs">
                    {p.member_count} student{p.member_count === 1 ? "" : "s"}
                    {p.faculty_count === 0 ? (
                      <Badge variant="warn" className="ml-2">no faculty</Badge>
                    ) : (
                      ` · ${p.faculty_names[0] ?? `${p.faculty_count} faculty`}`
                    )}
                  </span>
                </li>
              ))}
              {pods.length > 6 && (
                <li className="text-muted py-1.5 text-xs">
                  + {pods.length - 6} more
                </li>
              )}
            </ul>
          )}
        </Card>

        <Card>
          <div className="flex items-baseline justify-between gap-2">
            <h2 className="text-lg font-semibold tracking-tight">Content</h2>
            <Link
              href={`/admin/cohorts/${cohort.id}/curriculum`}
              className="text-accent text-xs"
            >
              Manage →
            </Link>
          </div>
          <CardSub className="mt-1">
            Day {today} of 30 · {unlockedDays} unlocked
          </CardSub>
          {upcomingDays.length === 0 ? (
            <CardSub className="mt-3">All days are unlocked.</CardSub>
          ) : (
            <ul className="divide-line/50 mt-3 divide-y text-sm">
              {upcomingDays.map((d) => (
                <li
                  key={d.day_number}
                  className="flex items-baseline justify-between gap-2 py-1.5"
                >
                  <span className="text-ink truncate">
                    Day {d.day_number} {d.title ? `· ${d.title}` : ""}
                  </span>
                  <Badge variant="default">locked</Badge>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold tracking-tight">More views</h2>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          <Link
            className="border-line hover:border-accent/40 hover:bg-bg-soft rounded-md border p-3 text-sm transition-colors"
            href={`/admin/cohorts/${cohort.id}/help-desk`}
          >
            <div className="text-ink font-medium">Help desk</div>
            <div className="text-muted text-xs">Tickets in this cohort</div>
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
            href={`/admin/cohorts/${cohort.id}/health`}
          >
            <div className="text-ink font-medium">Health</div>
            <div className="text-muted text-xs">Pulses + day feedback</div>
          </Link>
          <Link
            className="border-line hover:border-accent/40 hover:bg-bg-soft rounded-md border p-3 text-sm transition-colors"
            href={`/admin/cohorts/${cohort.id}/capstones`}
          >
            <div className="text-ink font-medium">Capstones</div>
            <div className="text-muted text-xs">Per-student status</div>
          </Link>
          <Link
            className="border-line hover:border-accent/40 hover:bg-bg-soft rounded-md border p-3 text-sm transition-colors"
            href={`/admin/cohorts/${cohort.id}/milestones`}
          >
            <div className="text-ink font-medium">Milestones</div>
            <div className="text-muted text-xs">Capstone phase board</div>
          </Link>
          <Link
            className="border-line hover:border-accent/40 hover:bg-bg-soft rounded-md border p-3 text-sm transition-colors"
            href={`/admin/cohorts/${cohort.id}/polls`}
          >
            <div className="text-ink font-medium">Poll history</div>
            <div className="text-muted text-xs">Past polls + results</div>
          </Link>
          <Link
            className="border-line hover:border-accent/40 hover:bg-bg-soft rounded-md border p-3 text-sm transition-colors"
            href="/community?mod=1"
          >
            <div className="text-ink font-medium">Board moderation</div>
            <div className="text-muted text-xs">Pin / hide / delete</div>
          </Link>
        </div>
      </section>
    </>
  );
}
