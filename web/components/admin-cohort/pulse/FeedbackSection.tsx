import { Card, CardSub } from "@/components/ui/card";
import { DivergingRatingBar } from "@/components/charts/DivergingRatingBar";
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

function Sparkline({ values }: { values: number[] }) {
  const w = 96;
  const h = 24;
  if (values.length < 2) return null;
  // ★1–5 scale → map to [0,1] for the y-axis
  const min = 1;
  const max = 5;
  const step = w / (values.length - 1);
  const points = values
    .map((v, i) => `${i * step},${h - ((v - min) / (max - min)) * h}`)
    .join(" ");
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} aria-hidden>
      <polyline
        points={points}
        fill="none"
        stroke="hsl(var(--ok))"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
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

  const sparkValues = summaries
    .slice()
    .sort((a, b) => a.day_number - b.day_number)
    .filter((r) => r.avg_rating !== null)
    .map((r) => r.avg_rating ?? 0);

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
            <div>
              <p className="text-muted font-mono text-[10.5px] font-semibold uppercase tracking-[0.18em]">
                Trend (avg per day)
              </p>
              <div className="mt-2">
                <Sparkline values={sparkValues} />
              </div>
            </div>
          </div>

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
