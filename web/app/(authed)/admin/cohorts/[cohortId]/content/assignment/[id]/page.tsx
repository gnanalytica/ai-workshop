import { notFound } from "next/navigation";
import Link from "next/link";
import { requireCapability } from "@/lib/auth/requireCapability";
import { Card, CardSub } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CohortShell } from "@/components/admin-cohort/CohortShell";
import { getAdminCohortById } from "@/lib/queries/admin-context";
import { getAssignmentDetail } from "@/lib/queries/assignment-detail";
import { AssignmentEditor } from "./AssignmentEditor";

export default async function AssignmentEditorPage({
  params,
}: {
  params: Promise<{ cohortId: string; id: string }>;
}) {
  const { cohortId, id } = await params;
  const cohort = await getAdminCohortById(cohortId);
  if (!cohort) notFound();
  const assignment = await getAssignmentDetail(id);
  if (!assignment || assignment.cohort_id !== cohort.id) notFound();
  await requireCapability("content.write", assignment.cohort_id);

  return (
    <>
      <CohortShell cohort={cohort} active="content" />

      <header>
        <p className="text-accent font-mono text-xs tracking-widest uppercase">
          Day {assignment.day_number} · <Badge>{assignment.kind}</Badge>
        </p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">
          {assignment.title}
        </h1>
        <CardSub className="mt-1">
          <Link
            href={`/admin/cohorts/${cohort.id}/curriculum`}
            className="hover:text-ink"
          >
            ← All curriculum
          </Link>
          <span className="ml-3">{assignment.submission_count} submissions</span>
        </CardSub>
      </header>

      <Card className="p-6">
        <AssignmentEditor
          cohortId={cohort.id}
          initial={{
            id: assignment.id,
            title: assignment.title,
            body_md: assignment.body_md ?? "",
            kind: assignment.kind,
            due_at: assignment.due_at,
            weight: assignment.weight,
            auto_grade: assignment.auto_grade,
          }}
        />
      </Card>
    </>
  );
}
