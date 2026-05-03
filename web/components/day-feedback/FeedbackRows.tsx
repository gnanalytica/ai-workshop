import { Card, CardSub } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { relTime } from "@/lib/format";
import type { DayFeedbackSummary } from "@/lib/queries/day-feedback";

const EMOJI: Record<number, string> = {
  1: "😞",
  2: "😕",
  3: "😐",
  4: "🙂",
  5: "🤩",
};

export function FeedbackRows({ summary }: { summary: DayFeedbackSummary }) {
  if (summary.total_responses === 0) {
    return (
      <Card>
        <CardSub>No feedback submitted for this day yet.</CardSub>
      </Card>
    );
  }
  return (
    <div className="space-y-4">
      <Card>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-muted text-[10.5px] font-semibold uppercase tracking-[0.18em]">
              Average
            </p>
            <p className="text-ink mt-1 text-3xl font-semibold tracking-tight">
              {summary.avg_rating == null
                ? "—"
                : summary.avg_rating.toFixed(2)}
            </p>
            <p className="text-muted text-xs">
              {summary.total_responses}{" "}
              {summary.total_responses === 1 ? "response" : "responses"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {summary.distribution.map((count, i) => (
              <div
                key={i}
                className="border-line bg-bg-soft min-w-[3rem] rounded-md border px-2.5 py-1.5 text-center"
              >
                <div className="text-base">{EMOJI[i + 1]}</div>
                <div className="text-ink text-xs font-semibold">{count}</div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      <Card className="p-0">
        <ul className="divide-line/50 divide-y">
          {summary.rows.map((r, idx) => (
            <li key={idx} className="px-5 py-3 text-sm">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-base">{EMOJI[r.rating]}</span>
                  <span className="text-ink font-medium">
                    {r.anonymous ? "Anonymous" : (r.full_name ?? "—")}
                  </span>
                  {r.anonymous && <Badge variant="default">anon</Badge>}
                </div>
                <span className="text-muted text-[11px]">
                  {relTime(r.created_at)}
                </span>
              </div>
              {r.fuzzy_topic && (
                <p className="text-ink/85 mt-1.5">
                  <span className="text-muted text-[10.5px] font-semibold uppercase tracking-[0.18em]">
                    Unclear ·{" "}
                  </span>
                  {r.fuzzy_topic}
                </p>
              )}
              {r.notes && (
                <p className="text-ink/80 mt-1 whitespace-pre-wrap text-[13px] leading-relaxed">
                  {r.notes}
                </p>
              )}
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
