import { notFound } from "next/navigation";
import Link from "next/link";
import { requireCapability } from "@/lib/auth/requireCapability";
import { Card, CardSub, CardTitle } from "@/components/ui/card";
import { CohortShell } from "@/components/admin-cohort/CohortShell";
import { getAdminCohortById } from "@/lib/queries/admin-context";
import { getQuizDetail } from "@/lib/queries/quiz-detail";
import { QuestionsEditor } from "@/app/(authed)/admin/content/quiz/[id]/QuestionsEditor";
import { QuizResultsChart } from "@/app/(authed)/admin/content/quiz/[id]/QuizResultsChart";
import { PublishToggle } from "./PublishToggle";

export default async function QuizEditorPage({
  params,
}: {
  params: Promise<{ cohortId: string; id: string }>;
}) {
  const { cohortId, id } = await params;
  const cohort = await getAdminCohortById(cohortId);
  if (!cohort) notFound();
  const quiz = await getQuizDetail(id);
  if (!quiz || quiz.cohort_id !== cohort.id) notFound();
  await requireCapability("content.write", quiz.cohort_id);

  return (
    <>
      <CohortShell cohort={cohort} active="content" />

      <header>
        <p className="text-accent font-mono text-xs tracking-widest uppercase">
          Day {quiz.day_number} · v{quiz.version}
        </p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">
          {quiz.title}
        </h1>
        <CardSub className="mt-1">
          <Link
            href={`/admin/cohorts/${cohort.id}/content`}
            className="hover:text-ink"
          >
            ← All content
          </Link>
        </CardSub>
      </header>

      <Card className="p-5">
        <PublishToggle
          cohortId={quiz.cohort_id}
          quizId={quiz.id}
          initial={quiz.is_published}
          questionCount={quiz.questions.length}
        />
      </Card>

      <Card className="p-6">
        <QuestionsEditor
          cohortId={quiz.cohort_id}
          quizId={quiz.id}
          initial={quiz.questions}
        />
      </Card>

      <Card className="space-y-4 p-6">
        <CardTitle>Results</CardTitle>
        <QuizResultsChart quizId={quiz.id} />
      </Card>
    </>
  );
}
