import { Card, CardSub } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { relTime } from "@/lib/format";
import type { ActivityItem, ActivityKind } from "@/lib/queries/activity";

const KIND_TONE: Record<ActivityKind, "default" | "ok" | "warn" | "accent" | "danger"> = {
  registration: "accent",
  lab: "ok",
  submission: "ok",
  attendance: "default",
  help_desk: "warn",
  kudos: "accent",
};

const KIND_LABEL: Record<ActivityKind, string> = {
  registration: "registration",
  lab: "lab",
  submission: "submission",
  attendance: "attendance",
  help_desk: "help desk",
  kudos: "kudos",
};

/**
 * Live event feed lifted from the retired Overview page — newest-first list
 * of registration / lab / submission / attendance / help-desk / kudos events
 * for the cohort. Lives inside the Engagement tab on Pulse since it's a
 * "what just happened" signal in the engagement family.
 */
export function ActivityFeed({ items }: { items: ActivityItem[] }) {
  if (items.length === 0) {
    return (
      <Card>
        <CardSub>No recorded activity yet.</CardSub>
      </Card>
    );
  }

  return (
    <Card className="p-0">
      <ul className="divide-line/50 max-h-[480px] divide-y overflow-auto">
        {items.map((it) => (
          <li
            key={it.id}
            className="flex flex-wrap items-baseline justify-between gap-3 px-5 py-3 text-sm"
          >
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <Badge variant={KIND_TONE[it.kind]}>{KIND_LABEL[it.kind]}</Badge>
                <span className="text-ink truncate font-medium">
                  {it.user_name ?? "—"}
                </span>
              </div>
              <p className="text-muted mt-0.5 text-xs">{it.detail}</p>
            </div>
            <span
              className="text-muted shrink-0 font-mono text-[11px] tabular-nums"
              title={it.at}
            >
              {relTime(it.at)}
            </span>
          </li>
        ))}
      </ul>
    </Card>
  );
}
