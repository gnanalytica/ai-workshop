import Link from "next/link";
import { requireCapability } from "@/lib/auth/requireCapability";
import { Card, CardSub, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getFacultyCohort } from "@/lib/queries/faculty";
import {
  listStudentLeaderboard,
  listPodLeaderboard,
  listTeamLeaderboard,
} from "@/lib/queries/faculty-cohort";

export default async function LeaderboardPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  await requireCapability("roster.read");
  const f = await getFacultyCohort();
  if (!f) return <Card><CardTitle>You aren&apos;t assigned to a cohort.</CardTitle></Card>;
  const cohortId = f.cohort.id;
  const tab = ((await searchParams).tab ?? "student") as "student" | "pod" | "team";

  const [students, pods, teams] = await Promise.all([
    listStudentLeaderboard(cohortId),
    listPodLeaderboard(cohortId),
    listTeamLeaderboard(cohortId),
  ]);

  return (
    <div className="space-y-6">
      <header>
        <p className="text-accent font-mono text-xs tracking-widest uppercase">{f.cohort.name} · Leaderboard</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">Standings</h1>
        <p className="text-muted mt-1 text-sm">
          Cumulative score = quizzes + graded assignments + 5×posts + 2×comments + net upvotes received.
        </p>
      </header>

      <nav className="flex gap-1 border-b border-line/50">
        <TabLink current={tab} value="student" label="Students" />
        <TabLink current={tab} value="pod" label="Pods" />
        <TabLink current={tab} value="team" label="Teams" />
      </nav>

      {tab === "student" && (
        <Card>
          {students.length === 0 ? (
            <CardSub>No scores yet.</CardSub>
          ) : (
            <table className="w-full text-sm">
              <thead className="text-muted text-xs uppercase tracking-wider">
                <tr className="text-left">
                  <th className="py-2">#</th>
                  <th>Student</th>
                  <th>Pod</th>
                  <th className="text-right">Quiz</th>
                  <th className="text-right">Subs</th>
                  <th className="text-right">Posts</th>
                  <th className="text-right">Comm</th>
                  <th className="text-right">Votes</th>
                  <th className="text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s, i) => (
                  <tr key={s.user_id} className="border-t border-line/30">
                    <td className="py-2 text-muted">{i + 1}</td>
                    <td className="text-ink font-medium">
                      <Link href={`/faculty/student/${s.user_id}`} className="hover:text-accent">
                        {s.full_name ?? "—"}
                      </Link>
                    </td>
                    <td className="text-muted">{s.pod_name ?? "—"}</td>
                    <td className="text-right">{s.quiz_score}</td>
                    <td className="text-right">{s.submission_score}</td>
                    <td className="text-right">{s.posts_score}</td>
                    <td className="text-right">{s.comments_score}</td>
                    <td className="text-right">{s.upvotes_score}</td>
                    <td className="text-accent text-right font-semibold">{s.total_score}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
      )}

      {tab === "pod" && (
        <Card>
          {pods.length === 0 ? (
            <CardSub>No pods yet.</CardSub>
          ) : (
            <table className="w-full text-sm">
              <thead className="text-muted text-xs uppercase tracking-wider">
                <tr className="text-left">
                  <th className="py-2">#</th>
                  <th>Pod</th>
                  <th className="text-right">Members</th>
                  <th className="text-right">Avg</th>
                  <th className="text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {pods.map((p, i) => (
                  <tr key={p.pod_id} className="border-t border-line/30">
                    <td className="py-2 text-muted">{i + 1}</td>
                    <td className="text-ink font-medium">{p.pod_name}</td>
                    <td className="text-right">{p.member_count}</td>
                    <td className="text-right">{p.avg_score}</td>
                    <td className="text-accent text-right font-semibold">{p.total_score}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
      )}

      {tab === "team" && (
        <Card>
          {teams.length === 0 ? (
            <CardSub>No teams yet.</CardSub>
          ) : (
            <table className="w-full text-sm">
              <thead className="text-muted text-xs uppercase tracking-wider">
                <tr className="text-left">
                  <th className="py-2">#</th>
                  <th>Team</th>
                  <th className="text-right">Members</th>
                  <th className="text-right">Avg</th>
                  <th className="text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {teams.map((t, i) => (
                  <tr key={t.team_id} className="border-t border-line/30">
                    <td className="py-2 text-muted">{i + 1}</td>
                    <td className="text-ink font-medium">{t.team_name}</td>
                    <td className="text-right">{t.member_count}</td>
                    <td className="text-right">{t.avg_score}</td>
                    <td className="text-accent text-right font-semibold">{t.total_score}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
      )}
    </div>
  );
}

function TabLink({ current, value, label }: { current: string; value: string; label: string }) {
  const active = current === value;
  return (
    <a
      href={`?tab=${value}`}
      className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${
        active ? "border-accent text-ink" : "border-transparent text-muted hover:text-ink"
      }`}
    >
      {label}
      {active && <Badge variant="accent" className="ml-2">Active</Badge>}
    </a>
  );
}
