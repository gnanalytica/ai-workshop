import { Card, CardSub } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { relTime } from "@/lib/format";
import type { FuzzyTopicEntry } from "@/lib/queries/day-feedback";

/**
 * Surface the most recent free-text answers from the "anything fuzzy?"
 * field on day-end feedback. Lets admins scan what students are actually
 * confused about without leaving the Pulse page.
 *
 * `topRecent` is shown un-grouped (newest first). Each row has the day
 * number, a rating badge, the verbatim text, and the author (or
 * "anonymous").
 */
export function FuzzyTopicsPanel({ entries }: { entries: FuzzyTopicEntry[] }) {
  if (entries.length === 0) {
    return (
      <Card>
        <CardSub>
          No fuzzy-topic answers yet for the recent days — either nobody
          flagged anything, or students only sent ratings without notes.
        </CardSub>
      </Card>
    );
  }
  return (
    <Card className="p-0">
      <ul className="divide-line/50 max-h-[480px] divide-y overflow-y-auto">
        {entries.map((e, i) => (
          <li key={i} className="flex items-baseline gap-3 px-5 py-3 text-sm">
            <span className="text-muted shrink-0 w-12 font-mono text-[10.5px] uppercase tracking-[0.16em]">
              D{String(e.day_number).padStart(2, "0")}
            </span>
            <Badge
              variant={
                e.rating >= 4 ? "ok" : e.rating >= 3 ? "warn" : "danger"
              }
            >
              {e.rating}★
            </Badge>
            <p className="text-ink/90 min-w-0 flex-1 break-words whitespace-pre-wrap">
              {e.text.length > 320 ? `${e.text.slice(0, 320)}…` : e.text}
            </p>
            <span className="text-muted shrink-0 text-xs">
              {e.full_name ?? "anonymous"} · {relTime(e.created_at)}
            </span>
          </li>
        ))}
      </ul>
    </Card>
  );
}
