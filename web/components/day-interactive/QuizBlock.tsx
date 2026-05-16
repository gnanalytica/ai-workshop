"use client";

import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import { Card, CardSub, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { DayQuiz } from "@/lib/queries/day-interactive";
import { submitQuiz } from "@/lib/actions/quizzes";

function isAnswered(v: unknown): boolean {
  if (v === null || v === undefined) return false;
  if (typeof v === "string") return v.trim().length > 0;
  if (Array.isArray(v)) return v.length > 0;
  return true;
}

export function QuizBlock({ quiz, dayNumber }: { quiz: DayQuiz; dayNumber: number }) {
  const completed = !!quiz.attempt?.completed_at;
  const [answers, setAnswers] = useState<Record<string, unknown>>(quiz.attempt?.answers ?? {});
  const [pending, start] = useTransition();

  useEffect(() => {
    setAnswers((quiz.attempt?.answers as Record<string, unknown> | undefined) ?? {});
  }, [quiz.attempt?.answers]);

  function setAnswer(qOrdinal: number, value: unknown) {
    setAnswers((a) => ({ ...a, [String(qOrdinal)]: value }));
  }

  const answeredCount = quiz.questions.reduce(
    (n, q) => n + (isAnswered(answers[String(q.ordinal)]) ? 1 : 0),
    0,
  );
  const allAnswered = quiz.questions.length > 0 && answeredCount === quiz.questions.length;

  function submit() {
    if (!allAnswered) {
      toast.error(`Answer every question (${quiz.questions.length - answeredCount} left).`);
      return;
    }
    start(async () => {
      const r = await submitQuiz({ quiz_id: quiz.id, answers, day_number: dayNumber });
      if (r.ok) toast.success("Submitted");
      else toast.error(r.error);
    });
  }

  return (
    <Card className="space-y-4 p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <CardTitle>🧠 {quiz.title}</CardTitle>
        <div className="flex items-center gap-2">
          <Badge>{quiz.questions.length} questions</Badge>
          {completed && <Badge variant="ok">Completed</Badge>}
          {quiz.attempt?.score != null && <Badge variant="accent">Score {quiz.attempt.score}</Badge>}
        </div>
      </div>

      {quiz.questions.length === 0 ? (
        <CardSub>No questions yet.</CardSub>
      ) : (
        <ol className="space-y-4">
          {quiz.questions.map((q) => (
            <li key={q.ordinal}>
              <p className="text-ink text-sm font-medium">
                {q.ordinal}. {q.prompt}
              </p>
              <div className="mt-2 space-y-1.5">
                {q.kind === "short" ? (
                  <input
                    type="text"
                    disabled={completed}
                    value={(answers[String(q.ordinal)] as string) ?? ""}
                    onChange={(e) => setAnswer(q.ordinal, e.target.value)}
                    className="border-line bg-input-bg text-ink w-full rounded-md border px-3 py-1.5 text-sm"
                  />
                ) : (
                  q.options.map((opt) => {
                    const cur = answers[String(q.ordinal)];
                    const selected =
                      q.kind === "multi"
                        ? Array.isArray(cur) && cur.includes(opt.id)
                        : cur === opt.id;
                    return (
                      <label key={opt.id} className="flex items-center gap-2 text-sm">
                        <input
                          type={q.kind === "multi" ? "checkbox" : "radio"}
                          name={`q-${q.ordinal}`}
                          disabled={completed}
                          checked={selected}
                          onChange={() => {
                            if (q.kind === "multi") {
                              const arr = Array.isArray(cur) ? [...(cur as string[])] : [];
                              if (selected) arr.splice(arr.indexOf(opt.id), 1);
                              else arr.push(opt.id);
                              setAnswer(q.ordinal, arr);
                            } else setAnswer(q.ordinal, opt.id);
                          }}
                        />
                        {opt.label}
                      </label>
                    );
                  })
                )}
              </div>
            </li>
          ))}
        </ol>
      )}

      {!completed && (
        <div className="flex items-center justify-between gap-3">
          <p className={`text-xs ${allAnswered ? "text-muted" : "text-[hsl(var(--danger))]"}`}>
            {answeredCount} / {quiz.questions.length} answered
            {!allAnswered && " — all questions required"}
          </p>
          <Button onClick={submit} disabled={pending || !allAnswered}>
            {pending ? "Submitting…" : "Submit quiz"}
          </Button>
        </div>
      )}
    </Card>
  );
}
