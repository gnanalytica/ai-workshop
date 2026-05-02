import { getQuizResults } from "@/lib/queries/quiz-detail";

export async function QuizResultsChart({ quizId }: { quizId: string }) {
  const questions = await getQuizResults(quizId);
  if (questions.length === 0) {
    return <p className="text-muted text-sm">No completed attempts yet.</p>;
  }

  return (
    <div className="space-y-6">
      {questions.map((q) => (
        <div key={q.ordinal} className="space-y-2">
          <div className="flex items-baseline justify-between gap-3">
            <p className="text-ink text-sm font-medium">
              Q{q.ordinal}. {q.prompt}
            </p>
            <span className="text-muted text-xs tabular-nums">
              {q.total} {q.total === 1 ? "respondent" : "respondents"}
            </span>
          </div>
          {q.kind === "short" ? (
            <p className="text-muted text-sm">
              {q.total} short {q.total === 1 ? "answer" : "answers"} submitted
            </p>
          ) : q.total === 0 ? (
            <p className="text-muted text-sm">0 votes yet</p>
          ) : (
            <ul className="space-y-2">
              {q.options.map((o) => {
                const pct = q.total > 0 ? Math.round((o.votes / q.total) * 100) : 0;
                return (
                  <li key={o.choice} className="space-y-1">
                    <div className="flex items-baseline justify-between gap-3 text-sm">
                      <span className="text-ink truncate">{o.label}</span>
                      <span className="text-muted tabular-nums text-xs">
                        {o.votes} · {pct}%
                      </span>
                    </div>
                    <div className="bg-bg-soft h-2 w-full overflow-hidden rounded-full">
                      <div
                        className="bg-accent h-full rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
}
