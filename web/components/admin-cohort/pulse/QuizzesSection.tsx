import { Card, CardSub } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ScoreDistributionBar,
  ScoreDistributionLegend,
} from "@/components/charts/ScoreDistributionBar";
import { ScoreDistributionChart } from "@/components/charts/recharts/ScoreDistributionChart";
import { CollapsibleSection } from "./CollapsibleSection";
import type {
  QuizDayScores,
  QuizPerformanceRow,
} from "@/lib/queries/pulse-scores";

function scoreToneClass(score: number | null): string {
  if (score === null) return "text-muted";
  if (score >= 80) return "text-ok";
  if (score >= 60) return "text-warn";
  return "text-danger";
}

function passToneClass(passed: number, attempts: number): string {
  if (attempts === 0) return "text-muted";
  const r = passed / attempts;
  if (r >= 0.8) return "text-ok";
  if (r >= 0.6) return "text-warn";
  return "text-danger";
}

export function QuizzesSection({
  byDay,
  byQuiz,
  cohortSize,
  dayHrefPattern,
}: {
  byDay: QuizDayScores[];
  byQuiz: QuizPerformanceRow[];
  cohortSize: number;
  dayHrefPattern?: string;
}) {
  // Only days that actually had a published quiz contribute to rates and
  // the per-day list. A quiet day should not drag the cohort score down.
  const opportunityDays = byDay.filter((r) => r.quizzes > 0);
  const totalAttempts = opportunityDays.reduce((s, r) => s + r.attempts, 0);
  const totalPassed = opportunityDays.reduce((s, r) => s + r.passed, 0);
  const overallAvg =
    totalAttempts > 0
      ? opportunityDays.reduce(
          (s, r) => s + (r.avg_score ?? 0) * r.attempts,
          0,
        ) / totalAttempts
      : null;
  const overallPass =
    totalAttempts > 0 ? totalPassed / totalAttempts : null;
  const totalQuizzes = opportunityDays.reduce((s, r) => s + r.quizzes, 0);

  return (
    <CollapsibleSection
      title="Quizzes"
      sub={`${totalQuizzes} published · ${totalAttempts} attempt${totalAttempts === 1 ? "" : "s"} · ${opportunityDays.length} day${opportunityDays.length === 1 ? "" : "s"} with a quiz · pass = score ≥ 60`}
    >

      <div className="grid gap-3 sm:grid-cols-3">
        <MiniStat
          label="Avg quiz score"
          value={overallAvg === null ? "—" : Math.round(overallAvg).toString()}
          hint={
            totalAttempts === 0
              ? "no attempts yet"
              : `across ${totalAttempts} attempts`
          }
          toneClass={scoreToneClass(overallAvg)}
        />
        <MiniStat
          label="Pass rate"
          value={
            overallPass === null
              ? "—"
              : `${Math.round(overallPass * 100)}%`
          }
          hint={`${totalPassed} of ${totalAttempts} passed`}
          toneClass={passToneClass(totalPassed, totalAttempts)}
        />
        <MiniStat
          label="Attempt rate"
          value={(() => {
            if (cohortSize === 0 || opportunityDays.length === 0) return "—";
            const avg =
              opportunityDays.reduce(
                (s, r) => s + r.attempters / cohortSize,
                0,
              ) / opportunityDays.length;
            return `${Math.round(avg * 100)}%`;
          })()}
          hint={`avg unique attempters per day with a quiz`}
          toneClass="text-ink"
        />
      </div>

      {opportunityDays.length > 0 && (
        <CollapsibleSection variant="card" title="Score distribution by day">
          <ScoreDistributionChart
            rows={[...opportunityDays]
              .sort((a, b) => a.day_number - b.day_number)
              .map((r) => ({
                day_number: r.day_number,
                total: r.attempts,
                under_60: r.distribution.under_60,
                band_60_69: r.distribution.band_60_69,
                band_70_79: r.distribution.band_70_79,
                band_80_89: r.distribution.band_80_89,
                band_90_100: r.distribution.band_90_100,
                avg: r.avg_score,
              }))}
            dayHrefPattern={dayHrefPattern}
            metricLabel="attempts"
          />
        </CollapsibleSection>
      )}

      <CollapsibleSection
        variant="card"
        title="Per-day detail"
        defaultOpen={false}
        sub={<ScoreDistributionLegend />}
      >
        <div className="space-y-3">
          {opportunityDays.length === 0 ? (
            <CardSub>No published quizzes in the window.</CardSub>
          ) : (
            <ul className="divide-line divide-y">
              {opportunityDays.map((r) => (
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
                    {r.attempters}/{cohortSize}
                    <br />
                    <span className="text-[10px]">attempted</span>
                  </div>
                  <div className="col-span-5 sm:col-span-6">
                    <ScoreDistributionBar
                      dist={r.distribution}
                      total={r.attempts}
                    />
                  </div>
                  <div
                    className={`col-span-2 text-right text-sm tabular-nums sm:col-span-1 ${scoreToneClass(r.avg_score)}`}
                    title="Average best-attempt score"
                  >
                    {r.avg_score === null ? "—" : Math.round(r.avg_score)}
                  </div>
                  <div
                    className={`col-span-12 text-right text-xs sm:col-span-2 ${passToneClass(r.passed, r.attempts)}`}
                    title="Pass = score >= 60"
                  >
                    {r.attempts === 0
                      ? "—"
                      : `${Math.round((r.passed / r.attempts) * 100)}% pass`}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </CollapsibleSection>

      {byQuiz.length > 0 && (
        <CollapsibleSection variant="card" title="Per-quiz performance">
          <ul className="divide-line divide-y text-sm">
              {byQuiz.map((q) => (
                <li
                  key={q.quiz_id}
                  className="grid grid-cols-12 items-center gap-2 py-2"
                >
                  <div className="col-span-1 font-mono text-xs">
                    D{String(q.day_number).padStart(2, "0")}
                  </div>
                  <div className="col-span-6 truncate" title={q.title}>
                    {q.title}
                  </div>
                  <div className="text-muted col-span-2 text-right text-xs tabular-nums">
                    {q.attempts} attempt{q.attempts === 1 ? "" : "s"}
                  </div>
                  <div
                    className={`col-span-1 text-right tabular-nums ${scoreToneClass(q.avg_score)}`}
                  >
                    {q.avg_score === null ? "—" : Math.round(q.avg_score)}
                  </div>
                  <div className="col-span-2 text-right">
                    {q.attempts === 0 ? (
                      <Badge>no attempts</Badge>
                    ) : (
                      <Badge
                        variant={
                          q.passed / q.attempts >= 0.8
                            ? "ok"
                            : q.passed / q.attempts >= 0.6
                              ? "warn"
                              : "danger"
                        }
                      >
                        {Math.round((q.passed / q.attempts) * 100)}% pass
                      </Badge>
                    )}
                  </div>
                </li>
              ))}
          </ul>
        </CollapsibleSection>
      )}
    </CollapsibleSection>
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
