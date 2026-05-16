import { Card, CardSub } from "@/components/ui/card";
import { DivergingRatingBar } from "@/components/charts/DivergingRatingBar";
import { FeedbackDistributionChart } from "@/components/charts/recharts/FeedbackDistributionChart";
import { Sparkline } from "@/components/charts/recharts/Sparkline";
import { FuzzyTopicsPanel } from "@/components/health/FuzzyTopicsPanel";
import { LowRatingTriage } from "@/components/health/LowRatingTriage";
import type { DayFeedbackSummary } from "@/lib/queries/faculty-cohort";

function ratingToneClass(avg: number | null): string {
  if (avg === null) return "text-muted";
  if (avg >= 4.5) return "text-ok";
  if (avg >= 4.0) return "text-ok";
  if (avg >= 3.0) return "text-warn";
  return "text-danger";
}

export function FeedbackSection({
  summaries,
  cohortSize,
  fuzzyTopics,
  lowRating,
  studentHref,
}: {
  /** Oldest day first → reversed for display (newest first). */
  summaries: DayFeedbackSummary[];
  cohortSize: number;
  fuzzyTopics: React.ComponentProps<typeof FuzzyTopicsPanel>["entries"];
  lowRating: React.ComponentProps<typeof LowRatingTriage>["entries"];
  studentHref: (uid: string) => string;
}) {
  const newestFirst = [...summaries].sort(
    (a, b) => b.day_number - a.day_number,
  );

  const totalRated = summaries.reduce((s, r) => s + r.total_responses, 0);
  const weightedSum = summaries.reduce(
    (s, r) => s + (r.avg_rating ?? 0) * r.total_responses,
    0,
  );
  const overallAvg = totalRated > 0 ? weightedSum / totalRated : null;
  const totalLow = summaries.reduce((s, r) => s + r.rating_1 + r.rating_2, 0);

  const sparkPoints = summaries
    .slice()
    .sort((a, b) => a.day_number - b.day_number)
    .filter((r) => r.avg_rating !== null)
    .map((r) => ({
      label: `Day ${r.day_number}`,
      value: Number((r.avg_rating ?? 0).toFixed(2)),
      hint: "★",
    }));

  return (
    <section className="space-y-3">
      <header className="border-line/40 flex flex-wrap items-baseline justify-between gap-2 border-b-2 pb-2">
        <h2 className="text-base font-semibold tracking-tight">Feedback</h2>
        <p className="text-muted text-xs">
          Day-end ★ ratings · {totalRated} response
          {totalRated === 1 ? "" : "s"} · {totalLow} low (≤2★)
        </p>
      </header>

      <Card>
        <div className="space-y-3">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-muted font-mono text-[10.5px] font-semibold uppercase tracking-[0.18em]">
                Avg rating
              </p>
              <div className="flex items-end gap-2">
                <p
                  className={`font-display text-2xl font-semibold tabular-nums ${ratingToneClass(overallAvg)}`}
                >
                  {overallAvg === null ? "—" : overallAvg.toFixed(2)}
                </p>
                <span className="text-muted text-xs">/5</span>
              </div>
              <p className="text-muted mt-0.5 text-xs">
                across {summaries.length} day
                {summaries.length === 1 ? "" : "s"}
              </p>
            </div>
            <div className="min-w-[140px]">
              <p className="text-muted font-mono text-[10.5px] font-semibold uppercase tracking-[0.18em]">
                Trend (avg per day)
              </p>
              <div className="mt-1">
                <Sparkline points={sparkPoints} tone="ok" height={32} />
              </div>
            </div>
          </div>

          {summaries.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold">Distribution by day</h3>
              <FeedbackDistributionChart
                rows={summaries}
                cohortSize={cohortSize}
              />
            </div>
          )}

          <div className="space-y-2">
            <div className="flex items-baseline justify-between">
              <h3 className="text-sm font-semibold">Sentiment by day</h3>
              <div className="text-muted flex gap-3 text-xs">
                <span className="inline-flex items-center gap-1">
                  <span className="bg-danger/70 inline-block h-2 w-3 rounded" />{" "}
                  ≤2★
                </span>
                <span className="inline-flex items-center gap-1">
                  <span className="bg-warn/40 inline-block h-2 w-3 rounded" />{" "}
                  3★
                </span>
                <span className="inline-flex items-center gap-1">
                  <span className="bg-ok/70 inline-block h-2 w-3 rounded" />{" "}
                  ≥4★
                </span>
              </div>
            </div>
            {newestFirst.length === 0 ? (
              <CardSub>No feedback rows yet.</CardSub>
            ) : (
              <ul className="divide-line divide-y">
                {newestFirst.map((r) => (
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
                      {r.total_responses}/{cohortSize}
                      <br />
                      <span className="text-[10px]">responded</span>
                    </div>
                    <div className="col-span-5 sm:col-span-7">
                      <DivergingRatingBar
                        rating_1={r.rating_1}
                        rating_2={r.rating_2}
                        rating_3={r.rating_3}
                        rating_4={r.rating_4}
                        rating_5={r.rating_5}
                        total={r.total_responses}
                      />
                    </div>
                    <div
                      className={`col-span-2 text-right text-sm tabular-nums ${ratingToneClass(r.avg_rating)}`}
                    >
                      {r.avg_rating === null ? "—" : r.avg_rating.toFixed(1)}★
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </Card>

      <div className="grid gap-3 md:grid-cols-2">
        <Card>
          <h3 className="text-sm font-semibold">What&apos;s still fuzzy?</h3>
          <p className="text-muted mb-2 text-xs">
            {fuzzyTopics.length === 0
              ? "no qualitative answers yet"
              : `${fuzzyTopics.length} qualitative answer${fuzzyTopics.length === 1 ? "" : "s"} · noise filtered`}
          </p>
          <FuzzyTopicsPanel entries={fuzzyTopics} />
        </Card>
        <Card>
          <h3 className="text-sm font-semibold">Low-rating triage</h3>
          <p className="text-muted mb-2 text-xs">
            {lowRating.length === 0
              ? "no 1- or 2-star ratings in the window"
              : `${lowRating.length} student${lowRating.length === 1 ? "" : "s"} flagged ≤ 2★ — consider reaching out`}
          </p>
          <LowRatingTriage entries={lowRating} studentHref={studentHref} />
        </Card>
      </div>
    </section>
  );
}
