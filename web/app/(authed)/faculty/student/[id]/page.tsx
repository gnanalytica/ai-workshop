import Link from "next/link";
import { notFound } from "next/navigation";
import { requireCapability } from "@/lib/auth/requireCapability";
import { Card, CardSub, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { KpiGrid, StatCard } from "@/components/kpi/StatCard";
import { StudentRow } from "@/components/student-row/StudentRow";
import { getFacultyCohort } from "@/lib/queries/faculty";
import { getStudentDrill } from "@/lib/queries/faculty-student";
import { fmtDateTime, relTime } from "@/lib/format";

export default async function StudentDrillPage({ params }: { params: Promise<{ id: string }> }) {
  await requireCapability("roster.read");
  const f = await getFacultyCohort();
  if (!f) return <Card><CardTitle>You aren&apos;t assigned to a cohort.</CardTitle></Card>;
  const { id } = await params;
  const s = await getStudentDrill(f.cohort.id, id);
  if (!s) notFound();

  return (
    <div className="space-y-6">
      <header>
        <p className="text-accent font-mono text-xs tracking-widest uppercase">{f.cohort.name} · Student</p>
        <div className="mt-2">
          <StudentRow
            fullName={s.full_name}
            email={s.email}
            avatarUrl={s.avatar_url}
            hint={s.pod_name ? `Pod · ${s.pod_name}` : "No pod"}
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
        <StatCard label="Recent stuck" value={s.recentStuck.length} tone={s.recentStuck.length > 0 ? "warn" : "default"} />
      </KpiGrid>

      {s.score && (
        <section>
          <h2 className="mb-2 text-lg font-semibold tracking-tight">Score breakdown</h2>
          <Card>
            <div className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-5">
              <Slice label="Quiz" value={s.score.quiz} />
              <Slice label="Submissions" value={s.score.submissions} />
              <Slice label="Posts" value={s.score.posts} />
              <Slice label="Comments" value={s.score.comments} />
              <Slice label="Upvotes" value={s.score.upvotes} />
            </div>
          </Card>
        </section>
      )}

      <section>
        <h2 className="mb-2 text-lg font-semibold tracking-tight">Recent submissions</h2>
        {s.recentSubmissions.length === 0 ? (
          <Card><CardSub>None yet.</CardSub></Card>
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
        <h2 className="mb-2 text-lg font-semibold tracking-tight">Recent stuck</h2>
        {s.recentStuck.length === 0 ? (
          <Card><CardSub>None.</CardSub></Card>
        ) : (
          <Card>
            <ul className="divide-y divide-line/50">
              {s.recentStuck.map((r) => (
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
          <Card><CardSub>No posts.</CardSub></Card>
        ) : (
          <Card>
            <ul className="divide-y divide-line/50">
              {s.recentPosts.map((p) => (
                <li key={p.id} className="flex items-center justify-between py-2 text-sm">
                  <Link href={`/board/${p.id}`} className="hover:text-accent text-ink">
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

function Slice({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <p className="text-muted text-xs uppercase tracking-wider">{label}</p>
      <p className="text-ink mt-1 font-mono text-lg">{value}</p>
    </div>
  );
}
