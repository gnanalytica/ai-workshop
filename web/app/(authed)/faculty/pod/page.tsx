import Link from "next/link";
import { requireCapability } from "@/lib/auth/requireCapability";
import { Card, CardSub, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StudentRow } from "@/components/student-row/StudentRow";
import { Sparkline } from "@/components/sparkline/Sparkline";
import { getFacultyCohort } from "@/lib/queries/faculty";
import { getFacultyPods } from "@/lib/queries/faculty-pod";
import { getCohortTrend } from "@/lib/queries/cohort-trends";

function classifyStudent(att: number, labs: number): "ok" | "at_risk" | "stuck" {
  if (att < 3 && labs < 3) return "stuck";
  if (att < 6 || labs < 6) return "at_risk";
  return "ok";
}

export default async function FacultyPodPage() {
  await requireCapability("roster.read");
  const f = await getFacultyCohort();
  if (!f) return <Card><CardTitle>You aren&apos;t assigned to a cohort.</CardTitle></Card>;
  const pods = await getFacultyPods(f.cohort.id);

  return (
    <div className="space-y-6">
      <header>
        <p className="text-accent font-mono text-xs tracking-widest uppercase">My pods</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">{f.cohort.name}</h1>
        <CardSub className="mt-1">
          {pods.length} {pods.length === 1 ? "pod" : "pods"} ·{" "}
          {pods.reduce((s, p) => s + p.members.length, 0)} students total
        </CardSub>
      </header>
      {pods.length === 0 ? (
        <Card><CardSub>You aren&apos;t assigned to a pod in this cohort yet.</CardSub></Card>
      ) : (
        await Promise.all(pods.map(async (p) => {
          const memberIds = p.members.map((m) => m.user_id);
          const trend = await getCohortTrend(f.cohort.id, memberIds);
          return (
            <section key={p.pod_id}>
              <div className="mb-3 flex items-center gap-2">
                <h2 className="text-lg font-semibold tracking-tight">{p.pod_name}</h2>
                <Badge>{p.members.length} members</Badge>
              </div>
              {p.shared_notes && (
                <Card className="mb-3 bg-bg-soft">
                  <CardSub>{p.shared_notes}</CardSub>
                </Card>
              )}
              <Card className="mb-3">
                <p className="text-muted mb-2 text-xs uppercase tracking-wider">
                  Last 14 days · this pod
                </p>
                <div className="grid gap-6 sm:grid-cols-3">
                  <Sparkline label="Labs" data={trend.labsDone} total={trend.totalLabs} />
                  <Sparkline label="Submissions" data={trend.submissions} total={trend.totalSubmissions} />
                  <Sparkline label="Posts" data={trend.posts} total={trend.totalPosts} />
                </div>
              </Card>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {p.members.map((m) => (
                  <Link key={m.user_id} href={`/faculty/student/${m.user_id}`}>
                    <Card className="hover:border-accent/40 p-4 transition-colors">
                      <StudentRow
                        fullName={m.full_name}
                        email={m.email}
                        avatarUrl={m.avatar_url}
                        status={classifyStudent(m.attendance_count, m.labs_done)}
                      />
                      <div className="text-muted mt-3 flex gap-3 text-xs">
                        <span>{m.attendance_count}d present</span>
                        <span>·</span>
                        <span>{m.labs_done} labs</span>
                        {m.pending_submissions > 0 && (
                          <>
                            <span>·</span>
                            <span className="text-amber-400">
                              {m.pending_submissions} to review
                            </span>
                          </>
                        )}
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            </section>
          );
        }))
      )}
    </div>
  );
}
