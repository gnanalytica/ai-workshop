import Link from "next/link";
import { Card, CardSub } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export interface FeedbackPanelProps {
  title?: string;
  subtitle?: string;
  hrefBase: string;
  scope?: string;
  summaries: Array<{
    day_number: number;
    title: string;
    total_responses: number;
    avg_rating: number | null;
  }>;
}

function ratingTone(avg: number | null): "ok" | "warn" | "danger" | "default" {
  if (avg == null) return "default";
  if (avg >= 4) return "ok";
  if (avg >= 3) return "warn";
  return "danger";
}

export function FeedbackPanel({
  title = "Day feedback",
  subtitle,
  hrefBase,
  scope,
  summaries,
}: FeedbackPanelProps) {
  return (
    <section>
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
          {subtitle && <CardSub className="text-xs">{subtitle}</CardSub>}
        </div>
        {scope && (
          <span className="text-muted text-[11px] uppercase tracking-[0.16em]">
            {scope}
          </span>
        )}
      </div>
      {summaries.length === 0 ? (
        <Card>
          <CardSub>No feedback yet for recent days.</CardSub>
        </Card>
      ) : (
        <Card className="p-0">
          <ul className="divide-line/50 divide-y">
            {summaries.map((s) => (
              <li key={s.day_number}>
                <Link
                  href={`${hrefBase}/${s.day_number}`}
                  className="hover:bg-bg-soft flex flex-wrap items-center justify-between gap-3 px-5 py-3 text-sm transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-ink font-medium">
                      Day {s.day_number} · {s.title}
                    </p>
                    <p className="text-muted text-xs">
                      {s.total_responses}{" "}
                      {s.total_responses === 1 ? "response" : "responses"}
                    </p>
                  </div>
                  <Badge variant={ratingTone(s.avg_rating)}>
                    {s.avg_rating == null
                      ? "—"
                      : `${s.avg_rating.toFixed(2)} avg`}
                  </Badge>
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </section>
  );
}
