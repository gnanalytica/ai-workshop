import { notFound } from "next/navigation";
import { CardSub } from "@/components/ui/card";
import { DayCard } from "@/components/day-card/DayCard";
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

  const weeks: { week: number; days: typeof days }[] = [];
  for (let w = 0; w < 6; w++) {
    weeks.push({ week: w + 1, days: days.slice(w * 5, w * 5 + 5) });
  }

  return (
    <>
      <CohortShell cohort={cohort} active="curriculum" />

      <CardSub>
        Today: Day {today} · {unlockedCount} of {days.length} unlocked ·{" "}
        {assignments.length} assignments · {quizzes.length} quizzes
      </CardSub>

      <section>
        <header className="mb-3">
          <h2 className="text-lg font-semibold tracking-tight">Calendar</h2>
          <p className="text-muted mt-1 text-sm">
            Click a day to edit its lesson, live session, or capstone.
          </p>
        </header>
        <div className="space-y-6">
          {weeks.map((w) => (
            <div key={w.week}>
              <h3 className="text-muted mb-2 text-xs font-medium tracking-widest uppercase">
                Week {w.week}
              </h3>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                {w.days.map((d) => (
                  <DayCard
                    key={d.day_number}
                    dayNumber={d.day_number}
                    title={d.title}
                    isUnlocked={d.is_unlocked}
                    liveSessionAt={d.live_session_at}
                    capstoneKind={d.capstone_kind}
                    href={`/admin/cohorts/${cohort.id}/schedule/${d.day_number}`}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-1 text-lg font-semibold tracking-tight">Lessons</h2>
        <p className="text-muted mb-3 text-sm">
          Toggle to lock or unlock a day for students. Locked days are hidden
          from the student lesson view.
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
