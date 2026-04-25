"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Card, CardSub, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { DayQuiz } from "@/lib/queries/day-interactive";
import { submitQuiz } from "@/lib/actions/quizzes";

export function QuizBlock({ quiz, dayNumber }: { quiz: DayQuiz; dayNumber: number }) {
  const completed = !!quiz.attempt?.completed_at;
  const [answers, setAnswers] = useState<Record<string, unknown>>(quiz.attempt?.answers ?? {});
  const [pending, start] = useTransition();

  function setAnswer(qOrdinal: number, value: unknown) {
    setAnswers((a) => ({ ...a, [String(qOrdinal)]: value }));
  }

  function submit() {
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
        <div className="flex justify-end">
          <Button onClick={submit} disabled={pending}>
            {pending ? "Submitting…" : "Submit quiz"}
          </Button>
        </div>
      )}
    </Card>
  );
}
