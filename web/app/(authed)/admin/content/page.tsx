import { requireCapability } from "@/lib/auth/requireCapability";
import { Card, CardSub, CardTitle } from "@/components/ui/card";
import { getAdminCohort } from "@/lib/queries/admin-context";
import { listAssignments, listQuizzes } from "@/lib/queries/content";
import {
  NewAssignmentForm,
  AssignmentsTable,
  NewQuizForm,
  QuizzesTable,
} from "./ContentForms";

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

      <section className="grid gap-4 md:grid-cols-2">
        <NewAssignmentForm cohortId={cohort.id} />
        <NewQuizForm cohortId={cohort.id} />
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold tracking-tight">Assignments</h2>
        <AssignmentsTable rows={assignments} cohortId={cohort.id} />
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold tracking-tight">Quizzes</h2>
        <QuizzesTable rows={quizzes} />
      </section>
    </div>
  );
}
