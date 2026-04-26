import { notFound } from "next/navigation";
import Link from "next/link";
import { requireCapability } from "@/lib/auth/requireCapability";
import { Card, CardSub } from "@/components/ui/card";
import { getQuizDetail } from "@/lib/queries/quiz-detail";
import { QuestionsEditor } from "./QuestionsEditor";

export default async function QuizEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const quiz = await getQuizDetail(id);
  if (!quiz) notFound();
  await requireCapability("content.write", quiz.cohort_id);

  return (
    <div className="space-y-6">
      <header>
        <p className="text-accent font-mono text-xs tracking-widest uppercase">
          Day {quiz.day_number} · v{quiz.version}
        </p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">{quiz.title}</h1>
        <CardSub className="mt-1">
          <Link href="/admin/content" className="hover:text-ink">← All content</Link>
        </CardSub>
      </header>

      <Card className="p-6">
        <QuestionsEditor
          cohortId={quiz.cohort_id}
          quizId={quiz.id}
          initial={quiz.questions}
        />
      </Card>
    </div>
  );
}
