import { notFound } from "next/navigation";
import { CardSub } from "@/components/ui/card";
import { CohortShell } from "@/components/admin-cohort/CohortShell";
import { requireCapability } from "@/lib/auth/requireCapability";
import { getAdminCohortById } from "@/lib/queries/admin-context";
import { listAssignments, listQuizzes } from "@/lib/queries/content";
import { listCohortDays, todayDayNumber } from "@/lib/queries/cohort";
import {
  NewAssignmentForm,
  AssignmentsTable,
  NewQuizForm,
  QuizzesTable,
} from "@/app/(authed)/admin/content/ContentForms";
import { LessonLockList } from "../content/LessonLockList";

export default async function AdminCohortCurriculumPage({
  params,
}: {
  params: Promise<{ cohortId: string }>;
}) {
  await requireCapability("content.write");
  const { cohortId } = await params;
  const cohort = await getAdminCohortById(cohortId);
  if (!cohort) notFound();

  const [assignments, quizzes, days] = await Promise.all([
    listAssignments(cohort.id),
    listQuizzes(cohort.id),
    listCohortDays(cohort.id),
  ]);
  const today = todayDayNumber({
    ...cohort,
    status: cohort.status as "draft" | "live" | "archived",
  });
  const unlockedCount = days.filter((d) => d.is_unlocked).length;

  return (
    <>
      <CohortShell cohort={cohort} active="curriculum" />

      <CardSub>
        Today: Day {today} · {unlockedCount} of {days.length} unlocked ·{" "}
        {assignments.length} assignments · {quizzes.length} quizzes
      </CardSub>

      <section>
        <h2 className="mb-1 text-lg font-semibold tracking-tight">Lessons</h2>
        <p className="text-muted mb-3 text-sm">
          Click a day to view the full lesson as students see it. Toggle to
          lock or unlock for students — locked days are hidden from the
          student lesson view.
        </p>
        <LessonLockList cohortId={cohort.id} days={days} />
      </section>

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
        <QuizzesTable rows={quizzes} cohortId={cohort.id} />
      </section>
    </>
  );
}
