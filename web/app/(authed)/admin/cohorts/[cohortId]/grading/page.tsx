import Link from "next/link";
import { notFound } from "next/navigation";
import { requireCapability } from "@/lib/auth/requireCapability";
import { Card, CardSub, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CohortShell } from "@/components/admin-cohort/CohortShell";
import { getAdminCohortById } from "@/lib/queries/admin-context";
import { listAssignments } from "@/lib/queries/content";
import { listAssignmentSubmissions } from "@/lib/queries/grading";
import { GradingClient } from "@/app/(authed)/admin/grading/GradingClient";

export default async function AdminCohortGradingPage({
  params,
  searchParams,
}: {
  params: Promise<{ cohortId: string }>;
  searchParams: Promise<{ a?: string }>;
}) {
  await requireCapability("grading.write:cohort");
  const { cohortId } = await params;
  const cohort = await getAdminCohortById(cohortId);
  if (!cohort) notFound();

  const assignments = await listAssignments(cohort.id);
  const sp = await searchParams;
  const activeId = sp.a ?? assignments[0]?.id ?? null;
  const subs = activeId ? await listAssignmentSubmissions(activeId) : [];

  return (
    <>
      <CohortShell cohort={cohort} active="grading" />

      <p className="text-muted text-sm">
        Run AI grading in batch, review the AI&apos;s drafts, then publish.
        Until published, students don&apos;t see a score. Quizzes are auto-graded
        (not shown here).
      </p>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted">Assignments</h2>
        {assignments.length === 0 ? (
          <Card><CardSub>No assignments yet.</CardSub></Card>
        ) : (
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {assignments.map((a) => (
              <Link key={a.id} href={`/admin/cohorts/${cohort.id}/grading?a=${a.id}`}>
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
    </>
  );
}
