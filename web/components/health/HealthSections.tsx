import Link from "next/link";
import { Card, CardSub } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type {
  AtRiskStudent,
  AtRiskSignal,
  DayFeedbackSummary,
  RecentPulse,
} from "@/lib/queries/faculty-cohort";

const SIGNAL_LABEL: Record<AtRiskSignal, string> = {
  no_activity: "Inactive 3d+",
  no_submissions: "No submissions",
  low_labs: "Low labs",
  open_help: "Open help",
};

const SIGNAL_TONE: Record<AtRiskSignal, "warn" | "danger" | "default"> = {
  no_activity: "warn",
  no_submissions: "danger",
  low_labs: "warn",
  open_help: "danger",
};

export function AtRiskList({
  students,
  studentHref,
  emptyHint = "Everyone has been active and is making progress.",
}: {
  students: AtRiskStudent[];
  studentHref: (userId: string) => string;
  emptyHint?: string;
}) {
  if (students.length === 0) {
    return (
      <Card>
        <CardSub>{emptyHint}</CardSub>
      </Card>
    );
  }
  return (
    <Card className="p-0">
      <ul className="divide-line/50 max-h-[480px] divide-y overflow-auto">
        {students.map((s) => (
          <li
            key={s.user_id}
            className="hover:bg-bg-soft flex flex-wrap items-center justify-between gap-3 px-5 py-3 text-sm transition-colors"
          >
            <div className="min-w-0 flex-1">
              <Link
                href={studentHref(s.user_id)}
                className="hover:text-accent text-ink truncate font-medium"
              >
                {s.full_name ?? "—"}
              </Link>
              {s.pod_name && (
                <span className="text-muted ml-2">· {s.pod_name}</span>
              )}
              <div className="mt-1 flex flex-wrap items-center gap-1.5">
                {s.signals.map((sig) => (
                  <Badge key={sig} variant={SIGNAL_TONE[sig]}>
                    {SIGNAL_LABEL[sig]}
                  </Badge>
                ))}
                <span className="text-muted text-[11px]">
                  {s.details.submissions} subs · {s.details.labs_done} labs
                  {s.details.open_help_desk > 0 &&
                    ` · ${s.details.open_help_desk} help`}
                </span>
              </div>
            </div>
            <div className="flex flex-col items-end gap-0.5 shrink-0">
              <span
                className={cn(
                  "font-mono text-sm font-semibold tabular-nums",
                  s.activity_score >= 60
                    ? "text-ok"
                    : s.activity_score >= 30
                      ? "text-warn"
                      : "text-danger",
                )}
                title={`Activity score · last 3 days: ${s.recent_score}%`}
              >
                {s.activity_score}%
              </span>
              {s.days_since_active !== null && s.days_since_active > 0 && (
                <span className="text-muted text-[10px]">
                  {s.days_since_active}d idle
                </span>
              )}
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
}

export function DayFeedbackList({
  rows,
  detailHref,
}: {
  rows: DayFeedbackSummary[];
  detailHref?: (dayNumber: number) => string;
}) {
  const visible = rows.filter((r) => r.total_responses > 0);
  if (visible.length === 0) {
    return (
      <Card>
        <CardSub>No feedback yet for the most recent days.</CardSub>
      </Card>
    );
  }
  return (
    <Card className="p-0">
      <ul className="divide-line/50 divide-y">
        {visible.map((r) => {
          const max = Math.max(
            r.rating_1,
            r.rating_2,
            r.rating_3,
            r.rating_4,
            r.rating_5,
            1,
          );
          const buckets = [r.rating_1, r.rating_2, r.rating_3, r.rating_4, r.rating_5];
          const content = (
            <div className="flex flex-wrap items-center gap-4 px-5 py-3 text-sm">
              <div className="min-w-[5rem]">
                <p className="text-ink font-medium">Day {r.day_number}</p>
                <p className="text-muted text-xs">
                  {r.total_responses} response{r.total_responses === 1 ? "" : "s"}
                </p>
              </div>
              <div className="flex-1 min-w-[12rem]">
                <div className="flex items-end gap-1 h-8">
                  {buckets.map((v, idx) => (
                    <div
                      key={idx}
                      title={`${idx + 1}★ · ${v}`}
                      className={cn(
                        "flex-1 rounded-sm",
                        idx < 2
                          ? "bg-danger/30"
                          : idx === 2
                            ? "bg-warn/30"
                            : "bg-ok/30",
                      )}
                      style={{ height: `${(v / max) * 100}%`, minHeight: 2 }}
                    />
                  ))}
                </div>
              </div>
              {r.avg_rating !== null && (
                <Badge
                  variant={
                    r.avg_rating >= 4
                      ? "ok"
                      : r.avg_rating >= 3
                        ? "warn"
                        : "danger"
                  }
                >
                  {r.avg_rating.toFixed(1)} avg
                </Badge>
              )}
            </div>
          );
          return (
            <li key={r.day_number} className="hover:bg-bg-soft transition-colors">
              {detailHref ? (
                <Link href={detailHref(r.day_number)} className="block">
                  {content}
                </Link>
              ) : (
                content
              )}
            </li>
          );
        })}
      </ul>
    </Card>
  );
}

export function PulseList({ pulses }: { pulses: RecentPulse[] }) {
  if (pulses.length === 0) {
    return (
      <Card>
        <CardSub>No pulses run yet.</CardSub>
      </Card>
    );
  }
  return (
    <div className="space-y-3">
      {pulses.map((p) => (
        <Card key={p.id}>
          <div className="flex items-baseline justify-between gap-3">
            <p className="text-ink text-sm font-medium truncate">{p.question}</p>
            <span className="text-muted shrink-0 text-xs">
              {p.total_votes} vote{p.total_votes === 1 ? "" : "s"}
            </span>
          </div>
          <div className="mt-3 space-y-1.5">
            {p.results.map((r) => {
              const pct =
                p.total_votes > 0 ? Math.round((r.votes / p.total_votes) * 100) : 0;
              return (
                <div key={r.choice} className="flex items-center gap-2 text-xs">
                  <span className="text-muted w-24 shrink-0 truncate">{r.label}</span>
                  <div className="bg-bg-soft border-line relative h-4 flex-1 overflow-hidden rounded-sm border">
                    <div
                      className="bg-accent/30 absolute inset-y-0 left-0"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-ink w-10 shrink-0 text-right tabular-nums">
                    {pct}%
                  </span>
                </div>
              );
            })}
          </div>
        </Card>
      ))}
    </div>
  );
}
