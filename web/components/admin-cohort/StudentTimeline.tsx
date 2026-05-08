import { Card, CardSub } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { fmtDateTime } from "@/lib/format";
import type { TimelineEvent, TimelineEventKind } from "@/lib/queries/student-timeline";

const KIND_LABEL: Record<TimelineEventKind, string> = {
  submission: "Submission",
  quiz: "Quiz",
  feedback: "Feedback",
  poll_vote: "Poll vote",
  lab_progress: "Lab",
};

const KIND_TONE: Record<TimelineEventKind, "ok" | "accent" | "warn" | "default"> = {
  submission: "accent",
  quiz: "ok",
  feedback: "default",
  poll_vote: "default",
  lab_progress: "warn",
};

export function StudentTimeline({ events }: { events: TimelineEvent[] }) {
  if (events.length === 0) {
    return (
      <Card>
        <CardSub>No activity captured for this student yet.</CardSub>
      </Card>
    );
  }
  return (
    <Card className="p-0">
      <ol className="divide-line/40 divide-y">
        {events.map((e) => (
          <li
            key={e.id}
            className="hover:bg-bg-soft flex flex-wrap items-baseline gap-3 px-4 py-2.5 text-sm transition-colors"
          >
            <span className="text-muted shrink-0 font-mono text-[10.5px] uppercase tracking-[0.18em] w-16">
              {e.day_number !== null ? `D${String(e.day_number).padStart(2, "0")}` : "—"}
            </span>
            <Badge variant={KIND_TONE[e.kind]}>{KIND_LABEL[e.kind]}</Badge>
            <span className="text-ink min-w-0 flex-1 truncate">{e.title}</span>
            {e.hint && (
              <span className="text-muted shrink-0 text-xs">{e.hint}</span>
            )}
            <span className="text-muted shrink-0 font-mono text-[11px] tabular-nums">
              {fmtDateTime(e.at)}
            </span>
          </li>
        ))}
      </ol>
    </Card>
  );
}
