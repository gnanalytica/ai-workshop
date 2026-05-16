import { Card, CardSub } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ScoreDistributionBar,
  ScoreDistributionLegend,
} from "@/components/charts/ScoreDistributionBar";
import { ScoreDistributionChart } from "@/components/charts/recharts/ScoreDistributionChart";
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
  dayHrefPattern,
}: {
  /** Per-day score rollups, oldest day first. Days with no assignments are silently filtered from the per-day list and rate denominators. */
  rows: SubmissionDayScores[];
  cohortSize: number;
  /** URL template for click-to-day navigation in the chart. `{n}` is replaced by day_number. */
  dayHrefPattern?: string;
}) {
  // A day only contributes to rates if it actually had an assignment.
  // Otherwise students had nothing to submit — counting it would penalize
  // them for the curriculum's gap, not their own behaviour.
  const opportunityRows = rows.filter((r) => r.assignments > 0);
  const totalSubmitted = opportunityRows.reduce((s, r) => s + r.submitted, 0);
  const totalGraded = opportunityRows.reduce((s, r) => s + r.graded, 0);
  const totalUngraded = opportunityRows.reduce((s, r) => s + r.ungraded, 0);
  const overallAvg =
    totalGraded > 0
      ? opportunityRows.reduce((s, r) => s + (r.avg_score ?? 0) * r.graded, 0) /
        totalGraded
      : null;
  const oldestUngraded = opportunityRows.reduce<number | null>((acc, r) => {
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
            if (cohortSize === 0 || opportunityRows.length === 0) return "—";
            const avg =
              opportunityRows.reduce(
                (s, r) => s + r.submitted / (cohortSize * r.assignments),
                0,
              ) / opportunityRows.length;
            return `${Math.round(avg * 100)}%`;
          })()}
          hint={`across ${opportunityRows.length} day${opportunityRows.length === 1 ? "" : "s"} with assignments`}
          toneClass="text-ink"
        />
      </div>

      {opportunityRows.length > 0 && (
        <Card>
          <div className="space-y-2">
            <h3 className="text-sm font-semibold">Grade distribution by day</h3>
            <ScoreDistributionChart
              rows={[...opportunityRows]
                .sort((a, b) => a.day_number - b.day_number)
                .map((r) => ({
                  day_number: r.day_number,
                  total: r.graded,
                  under_60: r.distribution.under_60,
                  band_60_69: r.distribution.band_60_69,
                  band_70_79: r.distribution.band_70_79,
                  band_80_89: r.distribution.band_80_89,
                  band_90_100: r.distribution.band_90_100,
                  avg: r.avg_score,
                }))}
              dayHrefPattern={dayHrefPattern}
            />
          </div>
        </Card>
      )}

      <Card>
        <div className="space-y-3">
          <div className="flex items-baseline justify-between">
            <h3 className="text-sm font-semibold">Per-day detail</h3>
            <ScoreDistributionLegend />
          </div>
          {opportunityRows.length === 0 ? (
            <CardSub>No assignments deployed in the window.</CardSub>
          ) : (
            <ul className="divide-line divide-y">
              {opportunityRows.map((r) => (
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
                    {r.submitted}/{cohortSize * r.assignments}
                    <br />
                    <span className="text-[10px]">
                      {r.assignments === 1
                        ? "submitted"
                        : `submitted · ${r.assignments} asg`}
                    </span>
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
