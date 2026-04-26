import Link from "next/link";
import { requireCapability } from "@/lib/auth/requireCapability";
import { Card, CardSub, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getAdminCohort } from "@/lib/queries/admin-context";
import { listAssignments } from "@/lib/queries/content";
import { listAssignmentSubmissions } from "@/lib/queries/grading";
import { GradingClient } from "./GradingClient";

export default async function AdminGradingPage({
  searchParams,
}: {
  searchParams: Promise<{ a?: string }>;
}) {
  await requireCapability("grading.write:cohort");
  const cohort = await getAdminCohort();
  if (!cohort) return <Card><CardTitle>No cohort</CardTitle></Card>;

  const assignments = await listAssignments(cohort.id);
  const writtenAssignments = assignments.filter((a) => a.kind !== "quiz");
  const sp = await searchParams;
  const activeId = sp.a ?? writtenAssignments[0]?.id ?? null;
  const subs = activeId ? await listAssignmentSubmissions(activeId) : [];

  return (
    <div className="space-y-6">
      <header>
        <p className="text-accent font-mono text-xs tracking-widest uppercase">{cohort.name} · Grading</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">Assignment grading</h1>
        <p className="text-muted mt-1 text-sm">
          Run AI grading in batch, review the AI&apos;s drafts, then publish.
          Until published, students don&apos;t see a score. Quizzes are auto-graded
          (not shown here).
        </p>
      </header>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted">Assignments</h2>
        {writtenAssignments.length === 0 ? (
          <Card><CardSub>No assignments yet.</CardSub></Card>
        ) : (
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {writtenAssignments.map((a) => (
              <Link key={a.id} href={`/admin/grading?a=${a.id}`}>
                <Card
                  className={
                    "transition-colors " +
                    (a.id === activeId ? "border-accent" : "hover:border-accent/40")
                  }
                >
                  <p className="text-muted font-mono text-xs">D{String(a.day_number).padStart(2, "0")} · {a.kind}</p>
                  <CardTitle>{a.title}</CardTitle>
                  <CardSub className="mt-1">{a.submission_count} submissions</CardSub>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>

      {activeId && (
        <section>
          <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold tracking-tight">
            Submissions
            <Badge>{subs.length}</Badge>
            <Badge variant="ok">{subs.filter((s) => s.human_reviewed_at).length} published</Badge>
            <Badge variant="warn">{subs.filter((s) => s.ai_graded && !s.human_reviewed_at).length} AI · pending review</Badge>
            <Badge variant="danger">{subs.filter((s) => !s.ai_graded && s.status === "submitted").length} ungraded</Badge>
          </h2>
          <GradingClient assignmentId={activeId} initial={subs} />
        </section>
      )}
    </div>
  );
}
