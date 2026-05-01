"use client";

import { CheckCircle2, Circle, ClipboardList, type LucideIcon, Megaphone, MessageSquare, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Phase } from "@/lib/content/phases";

export interface TaskItem {
  id: "checkin" | "poll" | "assignment" | "quiz";
  label: string;
  hint: string;
  done: boolean;
  /** Tab to switch to when this task is clicked. */
  phase: Phase;
}

const ICONS: Record<TaskItem["id"], LucideIcon> = {
  checkin: ClipboardList,
  poll: Megaphone,
  assignment: Pencil,
  quiz: MessageSquare,
};

/**
 * Sticky right-rail checklist for the lesson page. Shows the four interactive
 * tasks with their completion state at a glance, so the student doesn't have
 * to scroll/scan to know what's pending. Clicking a row switches to the
 * relevant phase tab via a custom event PhaseTabs listens for.
 */
export function DayTasksPanel({
  tasks,
  dayNumber,
}: {
  tasks: TaskItem[];
  dayNumber: number;
}) {
  const completed = tasks.filter((t) => t.done).length;
  const total = tasks.length;
  const allDone = total > 0 && completed === total;
  const nextTask = tasks.find((t) => !t.done) ?? null;

  function jumpTo(phase: Phase) {
    if (typeof window === "undefined") return;
    window.dispatchEvent(new CustomEvent("lesson-day:goto-phase", { detail: phase }));
  }

  return (
    <aside
      aria-label={`Day ${dayNumber} tasks`}
      className="border-line bg-card sticky top-20 hidden h-fit w-[260px] shrink-0 self-start rounded-lg border p-4 lg:block"
    >
      <div className="flex items-center justify-between">
        <p className="text-muted text-[10.5px] font-semibold uppercase tracking-[0.18em]">
          Day {dayNumber} · Tasks
        </p>
        <span
          className={cn(
            "font-mono text-[11px] tabular-nums",
            allDone ? "text-ok" : "text-muted/85",
          )}
        >
          {completed}/{total}
        </span>
      </div>

      <div className="bg-bg-soft mt-3 h-1.5 overflow-hidden rounded-full">
        <div
          className={cn(
            "h-full transition-all duration-300 ease-out",
            allDone ? "bg-ok" : "bg-accent",
          )}
          style={{ width: total > 0 ? `${(completed / total) * 100}%` : "0%" }}
        />
      </div>

      <ul className="mt-4 space-y-1">
        {tasks.map((t) => {
          const Icon = ICONS[t.id];
          return (
            <li key={t.id}>
              <button
                type="button"
                onClick={() => jumpTo(t.phase)}
                className={cn(
                  "group flex w-full items-start gap-2.5 rounded-md px-2 py-2 text-left transition-colors",
                  t.done
                    ? "text-muted hover:bg-bg-soft"
                    : "text-ink hover:bg-accent/5",
                )}
              >
                <span className="mt-0.5 shrink-0">
                  {t.done ? (
                    <CheckCircle2 size={16} strokeWidth={2} className="text-ok" />
                  ) : (
                    <Circle size={16} strokeWidth={1.6} className="text-muted/55" />
                  )}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-1.5">
                    <Icon
                      size={12}
                      strokeWidth={1.8}
                      className={cn(
                        "shrink-0",
                        t.done ? "text-muted/60" : "text-accent/85",
                      )}
                    />
                    <span
                      className={cn(
                        "text-[12.5px] font-medium",
                        t.done && "line-through decoration-muted/55",
                      )}
                    >
                      {t.label}
                    </span>
                  </span>
                  <span className="text-muted mt-0.5 block text-[11px] leading-snug">
                    {t.hint}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      {nextTask ? (
        <button
          type="button"
          onClick={() => jumpTo(nextTask.phase)}
          className="
            border-accent bg-accent text-cta-ink hover:opacity-90
            mt-4 flex w-full items-center justify-center gap-1.5 rounded-md border
            px-3 py-2 text-[12.5px] font-semibold transition-opacity
          "
        >
          What&apos;s next · {nextTask.label} →
        </button>
      ) : (
        <div className="border-ok/40 bg-ok/5 mt-4 rounded-md border px-3 py-2 text-center text-[12px]">
          <span className="text-ok font-semibold">All done for today.</span>
        </div>
      )}
    </aside>
  );
}
