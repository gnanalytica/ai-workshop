import { Card, CardSub } from "@/components/ui/card";
import { DivergingRatingBar } from "@/components/charts/DivergingRatingBar";
import { FeedbackDistributionChart } from "@/components/charts/recharts/FeedbackDistributionChart";
import { Sparkline } from "@/components/charts/recharts/Sparkline";
import { AdminFeedbackBrowser } from "@/components/admin-cohort/AdminFeedbackBrowser";
import { CollapsibleSection } from "./CollapsibleSection";
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
}: {
  /** Oldest day first → reversed for display (newest first). */
  summaries: DayFeedbackSummary[];
  cohortSize: number;
  fuzzyTopics: React.ComponentProps<typeof AdminFeedbackBrowser>["fuzzyTopics"];
  lowRating: React.ComponentProps<typeof AdminFeedbackBrowser>["lowRating"];
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
    <CollapsibleSection
      title="Feedback"
      sub={`Day-end ★ ratings · ${totalRated} response${totalRated === 1 ? "" : "s"} · ${totalLow} low (≤2★)`}
    >

      <CollapsibleSection
        variant="card"
        title="Avg rating + trend"
        sub={`${summaries.length} day${summaries.length === 1 ? "" : "s"}`}
      >
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
      </CollapsibleSection>

      {summaries.length > 0 && (
        <CollapsibleSection variant="card" title="Distribution by day">
          <FeedbackDistributionChart
            rows={summaries}
            cohortSize={cohortSize}
          />
        </CollapsibleSection>
      )}

      <CollapsibleSection
        variant="card"
        title="Sentiment by day"
        defaultOpen={false}
        sub={
          <div className="text-muted flex gap-3 text-xs">
            <span className="inline-flex items-center gap-1">
              <span className="bg-danger/70 inline-block h-2 w-3 rounded" /> ≤2★
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="bg-warn/40 inline-block h-2 w-3 rounded" /> 3★
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="bg-ok/70 inline-block h-2 w-3 rounded" /> ≥4★
            </span>
          </div>
        }
      >
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
      </CollapsibleSection>

      <CollapsibleSection
        variant="card"
        title="Browse comments"
        sub={`${fuzzyTopics.length} qualitative · ${lowRating.length} ≤2★ · search & filter`}
      >
        <AdminFeedbackBrowser
          fuzzyTopics={fuzzyTopics}
          lowRating={lowRating}
        />
      </CollapsibleSection>
    </CollapsibleSection>
  );
}
