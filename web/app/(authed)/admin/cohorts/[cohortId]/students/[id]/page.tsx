import { notFound } from "next/navigation";
import { Card, CardSub } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StudentRow } from "@/components/student-row/StudentRow";
import { CohortShell } from "@/components/admin-cohort/CohortShell";
import { StudentTimeline } from "@/components/admin-cohort/StudentTimeline";
import { getAdminCohortById } from "@/lib/queries/admin-context";
import { getStudentDetail } from "@/lib/queries/student-detail";
import { getStudentTimeline } from "@/lib/queries/student-timeline";
import { getStudentActivity } from "@/lib/queries/activity-score";
import { fmtDate, relTime } from "@/lib/format";

export default async function StudentDetailPage({
  params,
}: {
  params: Promise<{ cohortId: string; id: string }>;
}) {
  const { cohortId, id } = await params;
  const cohort = await getAdminCohortById(cohortId);
  if (!cohort) notFound();
  const [student, timeline, activityMap] = await Promise.all([
    getStudentDetail(cohort.id, id),
    getStudentTimeline(cohort.id, id),
    getStudentActivity(cohort.id, [id]),
  ]);
  if (!student) notFound();
  const activity = activityMap.get(id) ?? null;

  return (
    <>
      <CohortShell cohort={cohort} active="roster" />

      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <p className="text-accent font-mono text-xs tracking-widest uppercase">
            Student
          </p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">
            {student.full_name ?? student.email}
          </h1>
          <p className="text-muted mt-1 text-sm">
            {student.email} · {student.college ?? "—"} ·{" "}
            {student.pod_name ?? "no pod"}
          </p>
        </div>
        {activity && (
          <div className="border-line bg-card flex items-stretch gap-px overflow-hidden rounded-lg border text-xs">
            <ActivityCell
              label="Activity"
              value={`${activity.score}%`}
              hint={`${activity.active_days}/${activity.unlocked_days} days`}
              tone={
                activity.score >= 60
                  ? "ok"
                  : activity.score >= 30
                    ? "warn"
                    : "danger"
              }
            />
            <ActivityCell
              label="Last 3 days"
              value={`${activity.recent_score}%`}
              hint="recent"
              tone={
                activity.recent_score >= 60
                  ? "ok"
                  : activity.recent_score >= 30
                    ? "warn"
                    : "danger"
              }
            />
            <ActivityCell
              label="Last seen"
              value={
                activity.last_active_at ? relTime(activity.last_active_at) : "—"
              }
              hint={
                activity.days_since_active === null
                  ? "no activity"
                  : `${activity.days_since_active}d ago`
              }
            />
          </div>
        )}
      </header>

      <section>
        <div className="mb-3 flex items-baseline justify-between gap-3">
          <h2 className="text-lg font-semibold tracking-tight">Activity timeline</h2>
          <CardSub className="text-xs">latest {timeline.length}</CardSub>
        </div>
        <StudentTimeline events={timeline} />
      </section>

      {student.attendance.length > 0 && (
        <section>
          <h2 className="mb-3 text-lg font-semibold tracking-tight">
            Manually marked attendance
          </h2>
          <Card>
            <div className="flex flex-wrap gap-1.5 text-xs">
              {student.attendance.map((a) => (
                <span
                  key={a.day_number}
                  className="border-line bg-bg-soft rounded border px-2 py-0.5 font-mono"
                  title={a.status}
                >
                  D{String(a.day_number).padStart(2, "0")}:{" "}
                  {a.status[0]?.toUpperCase()}
                </span>
              ))}
            </div>
          </Card>
        </section>
      )}

      <section>
        <h2 className="mb-3 text-lg font-semibold tracking-tight">Labs</h2>
        <Card>
          <p className="text-muted text-sm">
            {student.labs.filter((l) => l.status === "done").length} done /{" "}
            {student.labs.length} attempted
          </p>
        </Card>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold tracking-tight">
          Submissions ({student.submissions.length})
        </h2>
        {student.submissions.length === 0 ? (
          <Card>
            <CardSub>None yet.</CardSub>
          </Card>
        ) : (
          <div className="space-y-3">
            {student.submissions.map((s) => (
              <Card key={s.id} className="space-y-2 p-4">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="text-ink text-sm font-medium">
                    Day {s.day_number} · {s.title}
                  </p>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={
                        s.status === "graded"
                          ? "ok"
                          : s.status === "submitted"
                            ? "warn"
                            : "default"
                      }
                    >
                      {s.status}
                    </Badge>
                    {s.score !== null && (
                      <Badge variant="accent">{s.score}</Badge>
                    )}
                    <span className="text-muted text-xs">
                      {fmtDate(s.updated_at)}
                    </span>
                  </div>
                </div>
                {s.body && (
                  <p className="bg-bg-soft border-line text-ink/85 max-h-40 overflow-y-auto rounded-md border p-3 text-xs whitespace-pre-line">
                    {s.body}
                  </p>
                )}
                {s.feedback_md && (
                  <p className="border-accent/40 bg-accent/5 text-ink/85 rounded-md border p-3 text-xs whitespace-pre-line">
                    <span className="text-accent font-mono text-[10px] uppercase">
                      Feedback ·{" "}
                    </span>
                    {s.feedback_md}
                  </p>
                )}
              </Card>
            ))}
          </div>
        )}
      </section>

      <Card className="p-4">
        <StudentRow
          fullName={student.full_name}
          email={student.email}
          pod={student.pod_name}
          hint="Quick contact"
        />
      </Card>
    </>
  );
}

function ActivityCell({
  label,
  value,
  hint,
  tone = "default",
}: {
  label: string;
  value: string;
  hint: string;
  tone?: "default" | "ok" | "warn" | "danger";
}) {
  const toneCls =
    tone === "ok"
      ? "text-ok"
      : tone === "warn"
        ? "text-warn"
        : tone === "danger"
          ? "text-danger"
          : "text-ink";
  return (
    <div className="bg-card flex min-w-[6.5rem] flex-col gap-0.5 px-3 py-2.5">
      <p className="text-muted font-mono text-[10px] uppercase tracking-[0.18em]">
        {label}
      </p>
      <p className={`font-display text-base font-semibold tabular-nums ${toneCls}`}>
        {value}
      </p>
      <p className="text-muted text-[10.5px]">{hint}</p>
    </div>
  );
}
