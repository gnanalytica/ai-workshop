import Link from "next/link";
import { Card, CardSub } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { relTime } from "@/lib/format";
import type { LowRatingEntry } from "@/lib/queries/day-feedback";

/**
 * Students who left a low rating recently. Distinct from the "at-risk"
 * list (which is signal-derived activity drop-off) — this is *direct*
 * "I'm not happy with today" feedback that an admin should reach out on.
 *
 * Anonymous rows render without a link.
 */
export function LowRatingTriage({
  entries,
  studentHref,
}: {
  entries: LowRatingEntry[];
  studentHref: (uid: string) => string;
}) {
  if (entries.length === 0) {
    return (
      <Card>
        <CardSub>
          No 1- or 2-star feedback in the recent window. Either everyone&apos;s
          on board, or the low-raters haven&apos;t spoken up yet.
        </CardSub>
      </Card>
    );
  }
  return (
    <Card className="p-0">
      <ul className="divide-line/50 divide-y">
        {entries.map((e, i) => (
          <li key={i} className="flex flex-wrap items-baseline gap-3 px-5 py-3 text-sm">
            <span className="text-muted shrink-0 w-12 font-mono text-[10.5px] uppercase tracking-[0.16em]">
              D{String(e.day_number).padStart(2, "0")}
            </span>
            <Badge variant={e.rating === 1 ? "danger" : "warn"}>{e.rating}★</Badge>
            <div className="min-w-0 flex-1">
              {e.fuzzy_topic && (
                <p className="text-ink/90 break-words italic">
                  &ldquo;
                  {e.fuzzy_topic.length > 200
                    ? `${e.fuzzy_topic.slice(0, 200)}…`
                    : e.fuzzy_topic}
                  &rdquo;
                </p>
              )}
              <p className="text-muted mt-0.5 text-xs">
                {e.user_id && e.full_name ? (
                  <Link
                    href={studentHref(e.user_id)}
                    className="hover:text-ink hover:underline"
                  >
                    {e.full_name}
                  </Link>
                ) : (
                  <span>{e.anonymous ? "anonymous" : "unknown"}</span>
                )}
                {" · "}
                {relTime(e.created_at)}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
}
