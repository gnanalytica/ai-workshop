import { Card, CardSub } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { relTime } from "@/lib/format";
import type { TimelineEvent } from "@/lib/queries/student-timeline";

/**
 * Per-axis drill of a student's score. Renders three sections — Quiz,
 * Submissions, and Activity calendar — from the same getStudentTimeline
 * output used by other surfaces.
 *
 * Shared between the student leaderboard ("Your scorecard" follow-up) and
 * the faculty student drill page. Pass `totalDays` (cohort length, usually
 * 30) so the calendar grid sizes correctly.
 */
export function ScoreBreakdown({
  events,
  totalDays = 30,
  emptyHint,
}: {
  events: TimelineEvent[];
  totalDays?: number;
  emptyHint?: string;
}) {
  const quizzes = events
    .filter((e) => e.kind === "quiz")
    .sort((a, b) => (a.day_number ?? 0) - (b.day_number ?? 0));

  const submissions = events
    .filter((e) => e.kind === "submission")
    .sort((a, b) => (a.day_number ?? 0) - (b.day_number ?? 0));

  // Days with at least one activity event (any kind).
  const activeDays = new Set<number>();
  for (const e of events) {
    if (typeof e.day_number === "number") activeDays.add(e.day_number);
  }

  // Per-day signal map — used to tooltip the calendar squares.
  type DaySignal = "submission" | "quiz" | "feedback" | "poll_vote" | "lab_progress";
  const perDay = new Map<number, Set<DaySignal>>();
  for (const e of events) {
    if (typeof e.day_number !== "number") continue;
    let set = perDay.get(e.day_number);
    if (!set) {
      set = new Set();
      perDay.set(e.day_number, set);
    }
    set.add(e.kind as DaySignal);
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold tracking-tight">Score breakdown</h2>

      <details className="border-line group rounded-lg border" open>
        <summary className="hover:bg-bg-soft flex cursor-pointer items-center justify-between gap-3 px-4 py-3">
          <div className="min-w-0">
            <p className="text-ink text-sm font-medium">Quizzes</p>
            <p className="text-muted text-xs">
              {quizzes.length} attempted
              {quizzes.length > 0 &&
                ` · avg ${Math.round(
                  quizzes.reduce((s, q) => s + parsePctHint(q.hint), 0) / quizzes.length,
                )}%`}
            </p>
          </div>
          <span className="text-muted text-xs group-open:hidden">Expand</span>
          <span className="text-muted hidden text-xs group-open:inline">Collapse</span>
        </summary>
        <div className="border-line/60 border-t">
          {quizzes.length === 0 ? (
            <p className="text-muted px-4 py-4 text-sm">
              No quizzes attempted yet.
            </p>
          ) : (
            <ul className="divide-line/40 divide-y">
              {quizzes.map((q) => (
                <li
                  key={q.id}
                  className="flex flex-wrap items-baseline gap-3 px-4 py-2.5 text-sm"
                >
                  <span className="text-muted shrink-0 w-14 font-mono text-[10.5px] uppercase tracking-[0.16em]">
                    {q.day_number !== null ? `D${String(q.day_number).padStart(2, "0")}` : "—"}
                  </span>
                  <span className="text-ink min-w-0 flex-1 truncate">{q.title}</span>
                  <Badge variant={tone(parsePctHint(q.hint))}>{q.hint ?? "—"}</Badge>
                  <span className="text-muted shrink-0 text-xs">{relTime(q.at)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </details>

      <details className="border-line group rounded-lg border" open>
        <summary className="hover:bg-bg-soft flex cursor-pointer items-center justify-between gap-3 px-4 py-3">
          <div className="min-w-0">
            <p className="text-ink text-sm font-medium">Submissions</p>
            <p className="text-muted text-xs">
              {submissions.length} total ·{" "}
              {submissions.filter((s) => /score \d/.test(s.hint ?? "")).length} graded
            </p>
          </div>
          <span className="text-muted text-xs group-open:hidden">Expand</span>
          <span className="text-muted hidden text-xs group-open:inline">Collapse</span>
        </summary>
        <div className="border-line/60 border-t">
          {submissions.length === 0 ? (
            <p className="text-muted px-4 py-4 text-sm">
              No submissions yet.
            </p>
          ) : (
            <ul className="divide-line/40 divide-y">
              {submissions.map((s) => {
                const scoreMatch = s.hint?.match(/score (\d+)/);
                const score = scoreMatch ? Number(scoreMatch[1]) : null;
                const isPending = !scoreMatch && s.hint;
                return (
                  <li
                    key={s.id}
                    className="flex flex-wrap items-baseline gap-3 px-4 py-2.5 text-sm"
                  >
                    <span className="text-muted shrink-0 w-14 font-mono text-[10.5px] uppercase tracking-[0.16em]">
                      {s.day_number !== null ? `D${String(s.day_number).padStart(2, "0")}` : "—"}
                    </span>
                    <span className="text-ink min-w-0 flex-1 truncate">{s.title}</span>
                    {score !== null ? (
                      <Badge variant={tone(score)}>score {score}</Badge>
                    ) : isPending ? (
                      <Badge variant="warn">{s.hint}</Badge>
                    ) : null}
                    <span className="text-muted shrink-0 text-xs">{relTime(s.at)}</span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </details>

      <details className="border-line group rounded-lg border" open>
        <summary className="hover:bg-bg-soft flex cursor-pointer items-center justify-between gap-3 px-4 py-3">
          <div className="min-w-0">
            <p className="text-ink text-sm font-medium">Activity calendar</p>
            <p className="text-muted text-xs">
              {activeDays.size} day{activeDays.size === 1 ? "" : "s"} active across {totalDays} days
            </p>
          </div>
          <span className="text-muted text-xs group-open:hidden">Expand</span>
          <span className="text-muted hidden text-xs group-open:inline">Collapse</span>
        </summary>
        <div className="border-line/60 border-t p-4">
          <div className="grid grid-cols-[repeat(10,minmax(0,1fr))] gap-1.5 sm:grid-cols-[repeat(15,minmax(0,1fr))]">
            {Array.from({ length: totalDays }, (_, i) => i + 1).map((day) => {
              const signals = perDay.get(day);
              const active = !!signals && signals.size > 0;
              const intensity = signals?.size ?? 0;
              return (
                <div
                  key={day}
                  title={
                    active && signals
                      ? `Day ${day} · ${Array.from(signals).join(", ")}`
                      : `Day ${day} · no activity`
                  }
                  className={`aspect-square rounded text-[9px] flex items-center justify-center font-mono ${
                    !active
                      ? "border-line/60 text-muted/60 border"
                      : intensity >= 3
                        ? "bg-accent text-bg"
                        : intensity === 2
                          ? "bg-accent/60 text-bg"
                          : "bg-accent/30 text-ink"
                  }`}
                >
                  {day}
                </div>
              );
            })}
          </div>
          <p className="text-muted mt-3 text-xs">
            Each square is one of the {totalDays} workshop days. Filled = at
            least one signal (submission, quiz, poll vote, lab, or feedback).
            Darker = more signals on that day.
          </p>
        </div>
      </details>

      {events.length === 0 && emptyHint && (
        <Card>
          <CardSub>{emptyHint}</CardSub>
        </Card>
      )}
    </div>
  );
}

function parsePctHint(hint: string | undefined): number {
  if (!hint) return 0;
  const m = hint.match(/(\d+)%/);
  return m ? Number(m[1]) : 0;
}

function tone(pct: number): "ok" | "warn" | "danger" | "default" {
  if (pct >= 70) return "ok";
  if (pct >= 40) return "warn";
  if (pct > 0) return "danger";
  return "default";
}
