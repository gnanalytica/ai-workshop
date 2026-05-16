import { Card, CardSub } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ScoreDistributionBar,
  ScoreDistributionLegend,
} from "@/components/charts/ScoreDistributionBar";
import type { SubmissionDayScores } from "@/lib/queries/pulse-scores";

function scoreToneClass(score: number | null): string {
  if (score === null) return "text-muted";
  if (score >= 80) return "text-ok";
  if (score >= 60) return "text-warn";
  return "text-danger";
}

export function SubmissionsSection({
  rows,
  cohortSize,
}: {
  /** Per-day score rollups, oldest day first. */
  rows: SubmissionDayScores[];
  cohortSize: number;
}) {
  const totalSubmitted = rows.reduce((s, r) => s + r.submitted, 0);
  const totalGraded = rows.reduce((s, r) => s + r.graded, 0);
  const totalUngraded = rows.reduce((s, r) => s + r.ungraded, 0);
  const overallAvg =
    totalGraded > 0
      ? rows.reduce((s, r) => s + (r.avg_score ?? 0) * r.graded, 0) / totalGraded
      : null;
  const oldestUngraded = rows.reduce<number | null>((acc, r) => {
    if (r.oldest_ungraded_hours === null) return acc;
    return acc === null || r.oldest_ungraded_hours > acc
      ? r.oldest_ungraded_hours
      : acc;
  }, null);

  return (
    <section className="space-y-3">
      <header className="border-line/40 flex flex-wrap items-baseline justify-between gap-2 border-b-2 pb-2">
        <h2 className="text-base font-semibold tracking-tight">Submissions</h2>
        <p className="text-muted text-xs">
          {totalSubmitted} submission{totalSubmitted === 1 ? "" : "s"} ·{" "}
          {totalGraded} graded · {totalUngraded} pending review · last{" "}
          {rows.length} day{rows.length === 1 ? "" : "s"}
        </p>
      </header>

      <div className="grid gap-3 sm:grid-cols-3">
        <MiniStat
          label="Avg grade (graded)"
          value={overallAvg === null ? "—" : Math.round(overallAvg).toString()}
          hint={
            totalGraded === 0
              ? "no graded submissions yet"
              : `across ${totalGraded} graded`
          }
          toneClass={scoreToneClass(overallAvg)}
        />
        <MiniStat
          label="Pending review"
          value={totalUngraded.toString()}
          hint={
            oldestUngraded === null
              ? "queue is empty"
              : `oldest ${oldestUngraded}h`
          }
          toneClass={
            totalUngraded === 0
              ? "text-ok"
              : totalUngraded > 10
                ? "text-danger"
                : "text-warn"
          }
        />
        <MiniStat
          label="Avg per-day submit rate"
          value={(() => {
            const daysWithSubs = rows.filter((r) => r.submitted > 0).length;
            if (cohortSize === 0 || daysWithSubs === 0) return "—";
            const avg =
              rows
                .filter((r) => r.submitted > 0)
                .reduce((s, r) => s + r.submitted / cohortSize, 0) / daysWithSubs;
            return `${Math.round(avg * 100)}%`;
          })()}
          hint={`across ${rows.filter((r) => r.submitted > 0).length} day${rows.filter((r) => r.submitted > 0).length === 1 ? "" : "s"} with submissions`}
          toneClass="text-ink"
        />
      </div>

      <Card>
        <div className="space-y-3">
          <div className="flex items-baseline justify-between">
            <h3 className="text-sm font-semibold">Grade distribution by day</h3>
            <ScoreDistributionLegend />
          </div>
          {rows.length === 0 ? (
            <CardSub>No submitted assignments in the window.</CardSub>
          ) : (
            <ul className="divide-line divide-y">
              {rows.map((r) => (
                <li
                  key={r.day_number}
                  className="grid grid-cols-12 items-center gap-2 py-2"
                >
                  <div className="col-span-2 sm:col-span-1">
                    <span className="font-mono text-sm font-medium">
                      D{String(r.day_number).padStart(2, "0")}
                    </span>
                  </div>
                  <div className="text-muted col-span-3 text-xs sm:col-span-2">
                    {r.submitted}/{cohortSize}
                    <br />
                    <span className="text-[10px]">submitted</span>
                  </div>
                  <div className="col-span-5 sm:col-span-6">
                    <ScoreDistributionBar
                      dist={r.distribution}
                      total={r.graded}
                    />
                  </div>
                  <div
                    className={`col-span-2 text-right text-sm tabular-nums sm:col-span-1 ${scoreToneClass(r.avg_score)}`}
                    title="Average graded score"
                  >
                    {r.avg_score === null ? "—" : Math.round(r.avg_score)}
                  </div>
                  <div className="col-span-12 text-right text-xs sm:col-span-2">
                    {r.ungraded > 0 ? (
                      <Badge
                        variant={
                          (r.oldest_ungraded_hours ?? 0) >= 72
                            ? "danger"
                            : (r.oldest_ungraded_hours ?? 0) >= 24
                              ? "warn"
                              : "default"
                        }
                      >
                        {r.ungraded} pending · {r.oldest_ungraded_hours ?? 0}h
                      </Badge>
                    ) : r.submitted > 0 ? (
                      <span className="text-ok text-xs">all graded</span>
                    ) : (
                      <span className="text-muted text-xs">—</span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </Card>
    </section>
  );
}

function MiniStat({
  label,
  value,
  hint,
  toneClass,
}: {
  label: string;
  value: string;
  hint: string;
  toneClass: string;
}) {
  return (
    <Card>
      <p className="text-muted font-mono text-[10.5px] font-semibold uppercase tracking-[0.18em]">
        {label}
      </p>
      <p
        className={`mt-1 font-display text-xl font-semibold tabular-nums ${toneClass}`}
      >
        {value}
      </p>
      <p className="text-muted mt-0.5 text-xs">{hint}</p>
    </Card>
  );
}
