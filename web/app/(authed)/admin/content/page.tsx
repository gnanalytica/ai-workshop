import { requireCapability } from "@/lib/auth/requireCapability";
import { Card, CardSub, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getAdminCohort } from "@/lib/queries/admin-context";
import { listAssignments, listQuizzes } from "@/lib/queries/content";
import { fmtDate } from "@/lib/format";

export default async function AdminContentPage() {
  await requireCapability("content.write");
  const cohort = await getAdminCohort();
  if (!cohort) return <Card><CardTitle>No cohort</CardTitle></Card>;
  const [assignments, quizzes] = await Promise.all([
    listAssignments(cohort.id),
    listQuizzes(cohort.id),
  ]);

  return (
    <div className="space-y-8">
      <header>
        <p className="text-accent font-mono text-xs tracking-widest uppercase">Content</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">{cohort.name}</h1>
        <CardSub className="mt-1">
          {assignments.length} assignments · {quizzes.length} quizzes
        </CardSub>
      </header>

      <section>
        <h2 className="mb-3 text-lg font-semibold tracking-tight">Assignments</h2>
        {assignments.length === 0 ? (
          <Card><CardSub>No assignments yet. Add one per day.</CardSub></Card>
        ) : (
          <div className="border-line overflow-hidden rounded-lg border">
            <table className="w-full text-sm">
              <thead className="bg-bg-soft text-muted text-xs uppercase">
                <tr>
                  <th className="w-16 px-3 py-2 text-left">Day</th>
                  <th className="px-3 py-2 text-left">Title</th>
                  <th className="w-28 px-3 py-2 text-left">Kind</th>
                  <th className="w-32 px-3 py-2 text-left">Due</th>
                  <th className="w-28 px-3 py-2 text-right">Submissions</th>
                </tr>
              </thead>
              <tbody>
                {assignments.map((a) => (
                  <tr key={a.id} className="border-line border-t">
                    <td className="px-3 py-2 font-mono text-xs">D{String(a.day_number).padStart(2, "0")}</td>
                    <td className="px-3 py-2">{a.title}</td>
                    <td className="px-3 py-2"><Badge>{a.kind}</Badge></td>
                    <td className="text-muted px-3 py-2 text-xs">{a.due_at ? fmtDate(a.due_at) : "—"}</td>
                    <td className="px-3 py-2 text-right tabular-nums">{a.submission_count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold tracking-tight">Quizzes</h2>
        {quizzes.length === 0 ? (
          <Card><CardSub>No quizzes yet.</CardSub></Card>
        ) : (
          <div className="border-line overflow-hidden rounded-lg border">
            <table className="w-full text-sm">
              <thead className="bg-bg-soft text-muted text-xs uppercase">
                <tr>
                  <th className="w-16 px-3 py-2 text-left">Day</th>
                  <th className="px-3 py-2 text-left">Title</th>
                  <th className="w-20 px-3 py-2 text-left">Ver</th>
                  <th className="w-28 px-3 py-2 text-right">Questions</th>
                  <th className="w-28 px-3 py-2 text-right">Attempts</th>
                </tr>
              </thead>
              <tbody>
                {quizzes.map((q) => (
                  <tr key={q.id} className="border-line border-t">
                    <td className="px-3 py-2 font-mono text-xs">D{String(q.day_number).padStart(2, "0")}</td>
                    <td className="px-3 py-2">{q.title}</td>
                    <td className="text-muted px-3 py-2 text-xs">v{q.version}</td>
                    <td className="px-3 py-2 text-right tabular-nums">{q.question_count}</td>
                    <td className="px-3 py-2 text-right tabular-nums">{q.attempt_count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <Card>
        <CardSub>
          Authoring assignments + quiz questions inline is not yet available — the canonical
          source for v1 is the curriculum MDX under <code>web/content/day-XX.mdx</code>. Schema
          rows for assignments/quizzes are seeded per cohort and edited in SQL until the editor
          UI ships.
        </CardSub>
      </Card>
    </div>
  );
}
