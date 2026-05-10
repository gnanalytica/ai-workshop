import { Card, CardSub } from "@/components/ui/card";
import type { CohortDayProgress } from "@/lib/queries/analytics";

/**
 * Per-day quiz pass rate and submission rate. Both axes can be null when
 * nothing was deployed that day — we dash them out rather than show 0% so
 * empty days don't look like failure.
 */
export function CohortProgressCard({ rows }: { rows: CohortDayProgress[] }) {
  if (rows.length === 0) {
    return (
      <Card>
        <CardSub>No assignments or quizzes deployed yet.</CardSub>
      </Card>
    );
  }
  return (
    <Card className="p-0">
      <div className="grid grid-cols-[auto_1fr_1fr] gap-x-4 gap-y-0">
        <div className="text-muted col-span-3 grid grid-cols-[auto_1fr_1fr] gap-x-4 border-b border-line/50 px-5 py-2 text-[10.5px] uppercase tracking-[0.16em]">
          <span>Day</span>
          <span>Quiz · passed</span>
          <span>Submitted</span>
        </div>
        {rows.map((r) => (
          <div
            key={r.day_number}
            className="hover:bg-bg-soft col-span-3 grid grid-cols-[auto_1fr_1fr] gap-x-4 border-b border-line/30 px-5 py-2.5 text-sm last:border-b-0"
          >
            <span className="text-ink font-mono text-xs">D{String(r.day_number).padStart(2, "0")}</span>
            <ProgressBar
              passed={r.quiz_passed}
              attempted={r.quiz_attempts}
              cohort={r.cohort_size}
              dashLabel="no quiz"
              passLabel="passed (≥ 60)"
            />
            <ProgressBar
              passed={r.submitted}
              attempted={null}
              cohort={r.cohort_size}
              dashLabel="no assignment"
              passLabel="submitted"
            />
          </div>
        ))}
      </div>
    </Card>
  );
}

function ProgressBar({
  passed,
  attempted,
  cohort,
  dashLabel,
  passLabel,
}: {
  passed: number | null;
  attempted: number | null;
  cohort: number;
  dashLabel: string;
  passLabel: string;
}) {
  if (passed === null) {
    return <span className="text-muted text-xs">{dashLabel}</span>;
  }
  const denom = cohort > 0 ? cohort : 1;
  const pct = Math.round((passed / denom) * 100);
  const tone = pct >= 70 ? "bg-ok/30" : pct >= 40 ? "bg-warn/30" : "bg-danger/30";
  return (
    <div className="flex items-center gap-2">
      <div className="bg-bg-soft border-line relative h-3 flex-1 overflow-hidden rounded-sm border">
        <div
          className={`absolute inset-y-0 left-0 ${tone}`}
          style={{ width: `${Math.min(100, pct)}%` }}
        />
      </div>
      <span
        className="text-ink shrink-0 font-mono text-xs tabular-nums"
        title={
          attempted !== null
            ? `${passed}/${attempted} attempted ${passLabel}, ${cohort} students in cohort`
            : `${passed}/${cohort} ${passLabel}`
        }
      >
        {passed}/{cohort} · {pct}%
      </span>
    </div>
  );
}
