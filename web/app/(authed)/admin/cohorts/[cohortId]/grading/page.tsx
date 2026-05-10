import { notFound } from "next/navigation";
import { requireCapability } from "@/lib/auth/requireCapability";
import { Card, CardSub } from "@/components/ui/card";
import { CohortShell } from "@/components/admin-cohort/CohortShell";
import { getAdminCohortById } from "@/lib/queries/admin-context";
import { listAssignments } from "@/lib/queries/content";
import { listAssignmentSubmissions } from "@/lib/queries/grading";
import { GradingClient } from "@/app/(authed)/admin/grading/GradingClient";
import { AssignmentPicker } from "@/app/(authed)/admin/grading/AssignmentPicker";

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
  // Default selection: first assignment that actually has submissions, else
  // first assignment, else null.
  const fallbackId =
    assignments.find((a) => a.submission_count > 0)?.id ??
    assignments[0]?.id ??
    null;
  const activeId = sp.a ?? fallbackId;
  const activeAssignment = assignments.find((a) => a.id === activeId) ?? null;
  const subs = activeId ? await listAssignmentSubmissions(activeId) : [];

  return (
    <>
      <CohortShell cohort={cohort} />

      <div className="space-y-4">
        <header>
          <h1 className="text-xl font-semibold tracking-tight">Submissions</h1>
          <p className="text-muted mt-1 text-sm">
            Run AI grading in batch, review the AI&apos;s drafts, then publish.
            Until published, students don&apos;t see a score. Quizzes are
            auto-graded (not shown here).
          </p>
        </header>

        {assignments.length === 0 ? (
          <Card>
            <CardSub>
              No assignments yet. Add one from the Curriculum tab.
            </CardSub>
          </Card>
        ) : (
          <>
            <AssignmentPicker
              cohortId={cohort.id}
              assignments={assignments}
              activeId={activeId}
            />
            {activeAssignment && (
              <GradingClient
                key={activeId ?? "none"}
                assignmentId={activeId!}
                autoGrade={activeAssignment.auto_grade}
                initial={subs}
              />
            )}
          </>
        )}
      </div>
    </>
  );
}
