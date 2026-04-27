import Link from "next/link";
import { notFound } from "next/navigation";
import { requireCapability } from "@/lib/auth/requireCapability";
import { getSession } from "@/lib/auth/session";
import { Card, CardSub, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { KpiGrid, StatCard } from "@/components/kpi/StatCard";
import { StudentRow } from "@/components/student-row/StudentRow";
import { getFacultyCohort } from "@/lib/queries/faculty";
import { getStudentDrill } from "@/lib/queries/faculty-student";
import { listCohortPods } from "@/lib/queries/faculty-cohort";
import { listPodNotesForStudent } from "@/lib/queries/faculty-pod-notes";
import { fmtDateTime, relTime } from "@/lib/format";
import { StudentActions } from "./StudentActions";
import { PodNotesPanel } from "./PodNotesPanel";

export default async function StudentDrillPage({ params }: { params: Promise<{ id: string }> }) {
  await requireCapability("roster.read");
  const f = await getFacultyCohort();
  const me = await getSession();
  if (!f || !me) return <Card><CardTitle>You aren&apos;t assigned to a cohort.</CardTitle></Card>;
  const { id } = await params;
  const [s, pods, notes] = await Promise.all([
    getStudentDrill(f.cohort.id, id),
    listCohortPods(f.cohort.id, ""),
    listPodNotesForStudent(f.cohort.id, id),
  ]);
  if (!s) notFound();
  const podOptions = pods.map((p) => ({ pod_id: p.pod_id, name: p.name }));

  return (
    <div className="space-y-6">
      <header className="space-y-3">
        <p className="text-accent font-mono text-xs tracking-widest uppercase">{f.cohort.name} · Student</p>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <StudentRow
            fullName={s.full_name}
            email={s.email}
            avatarUrl={s.avatar_url}
            hint={s.pod_name ? `Pod · ${s.pod_name}` : "No pod"}
          />
          <StudentActions
            userId={s.user_id}
            email={s.email}
            currentPodId={s.pod_id}
            pods={podOptions}
          />
        </div>
      </header>

      <KpiGrid>
        <StatCard label="Total score" value={s.score?.total ?? 0} tone="accent" />
        <StatCard label="Labs done" value={s.labsDone} />
        <StatCard
          label="Last active"
          value={s.lastActiveAt ? relTime(s.lastActiveAt) : "—"}
          hint={s.lastActiveAt ? fmtDateTime(s.lastActiveAt) : ""}
        />
        <StatCard label="Help desk" value={s.recentHelpDesk.length} hint="recent" tone={s.recentHelpDesk.length > 0 ? "warn" : "default"} />
      </KpiGrid>

      {s.score && (
        <section>
          <h2 className="mb-2 text-lg font-semibold tracking-tight">Score breakdown</h2>
          <Card>
            <div className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-5">
              <Slice label="Quiz" value={s.score.quiz} total={s.score.total} />
              <Slice label="Submissions" value={s.score.submissions} total={s.score.total} />
              <Slice label="Posts" value={s.score.posts} total={s.score.total} />
              <Slice label="Comments" value={s.score.comments} total={s.score.total} />
              <Slice label="Upvotes" value={s.score.upvotes} total={s.score.total} />
            </div>
            <div className="border-line mt-4 flex items-center justify-between border-t pt-3 text-sm">
              <span className="text-muted">Total</span>
              <span className="text-accent font-mono text-lg font-semibold">
                {s.score.total}
              </span>
            </div>
          </Card>
        </section>
      )}

      <section>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-lg font-semibold tracking-tight">Pod notes</h2>
          {notes.some((n) => n.needs_followup) && (
            <Badge variant="warn">
              {notes.filter((n) => n.needs_followup).length} needs follow-up
            </Badge>
          )}
        </div>
        <PodNotesPanel
          cohortId={f.cohort.id}
          studentId={s.user_id}
          notes={notes}
          currentUserId={me.id}
        />
      </section>

      <section>
        <h2 className="mb-2 text-lg font-semibold tracking-tight">Recent submissions</h2>
        {s.recentSubmissions.length === 0 ? (
          <Card><CardSub>No submissions yet — student hasn&apos;t turned in any assignments.</CardSub></Card>
        ) : (
          <Card>
            <ul className="divide-y divide-line/50">
              {s.recentSubmissions.map((r) => (
                <li key={r.id} className="flex items-center justify-between py-2 text-sm">
                  <div>
                    <span className="text-ink font-medium">Day {r.day_number} · {r.assignment_title}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={r.status === "graded" ? "ok" : r.status === "submitted" ? "warn" : "default"}>
                      {r.status}
                    </Badge>
                    {r.score !== null && <span className="text-accent font-mono text-xs">{r.score}</span>}
                    <span className="text-muted text-xs">{relTime(r.updated_at)}</span>
                  </div>
                </li>
              ))}
            </ul>
          </Card>
        )}
      </section>

      <section>
        <h2 className="mb-2 text-lg font-semibold tracking-tight">Help desk (recent)</h2>
        {s.recentHelpDesk.length === 0 ? (
          <Card><CardSub>No help desk activity for this student.</CardSub></Card>
        ) : (
          <Card>
            <ul className="divide-y divide-line/50">
              {s.recentHelpDesk.map((r) => (
                <li key={r.id} className="py-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Badge variant={r.kind === "tech" ? "danger" : "warn"}>{r.kind}</Badge>
                    <Badge>{r.status}</Badge>
                    <span className="text-muted text-xs">{relTime(r.created_at)}</span>
                  </div>
                  {r.message && <p className="text-ink/85 mt-1">{r.message}</p>}
                </li>
              ))}
            </ul>
          </Card>
        )}
      </section>

      <section>
        <h2 className="mb-2 text-lg font-semibold tracking-tight">Recent board activity</h2>
        {s.recentPosts.length === 0 ? (
          <Card><CardSub>Hasn&apos;t posted on the community board yet.</CardSub></Card>
        ) : (
          <Card>
            <ul className="divide-y divide-line/50">
              {s.recentPosts.map((p) => (
                <li key={p.id} className="flex items-center justify-between py-2 text-sm">
                  <Link href={`/community/${p.id}`} className="hover:text-accent text-ink">
                    {p.title}
                  </Link>
                  <span className="text-muted text-xs">{relTime(p.created_at)}</span>
                </li>
              ))}
            </ul>
          </Card>
        )}
      </section>
    </div>
  );
}

function Slice({ label, value, total }: { label: string; value: number; total: number }) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div>
      <p className="text-muted text-xs uppercase tracking-wider">{label}</p>
      <p className="text-ink mt-1 font-mono text-lg">{value}</p>
      <p className="text-muted text-[10px]">{pct}% of total</p>
    </div>
  );
}
