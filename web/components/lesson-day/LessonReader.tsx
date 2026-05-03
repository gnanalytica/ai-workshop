"use client";

import {
  Children,
  isValidElement,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
  type ReactNode,
} from "react";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { markSectionComplete } from "@/lib/actions/lesson-progress";
import { DayFeedbackModal } from "./DayFeedbackModal";

export type LessonReaderPhase = "pre" | "live" | "post" | "extra";

/**
 * "Chunked reader" wrapper for a markdown phase. Replaces the long-form
 * scroll with one-section-at-a-time presentation: title + content + clear
 * Prev / Next controls and a dot progress strip. Keyboard arrows + Home/End
 * navigate. Smoothly scrolls the reader into view on section change.
 *
 * When `cohortId`, `dayNumber`, and `phase` are provided, the footer "Next"
 * button becomes "Mark complete & continue" and persists per-section
 * completion to lesson_section_progress. Sections marked complete show a
 * green check in the dot strip.
 *
 * When `triggerFeedbackOnLast` is true (post phase only), marking the final
 * section complete opens the day-feedback modal — submitting that doubles as
 * the "day complete" marker.
 */
export function LessonReader({
  titles,
  children,
  trailing,
  sectionAddons,
  cohortId,
  dayNumber,
  phase,
  initialCompleted,
  triggerFeedbackOnLast,
  dayFeedbackSubmitted,
}: {
  titles: (string | null)[];
  children: ReactNode;
  /** Optional extra content to render after the last section (poll, tools, etc). */
  trailing?: ReactNode;
  /** Optional inline content keyed by section index — renders right under that section's body. */
  sectionAddons?: Record<number, ReactNode>;
  cohortId?: string;
  dayNumber?: number;
  phase?: LessonReaderPhase;
  /** Section indices already marked complete on the server (loaded once at SSR). */
  initialCompleted?: number[];
  /** Post phase only: open feedback modal after marking the final section complete. */
  triggerFeedbackOnLast?: boolean;
  /** True if the user has already submitted feedback for this day. Suppresses the modal. */
  dayFeedbackSubmitted?: boolean;
}) {
  const items = Children.toArray(children).filter(isValidElement);
  const total = items.length;

  const [idx, setIdx] = useState(0);
  const [completed, setCompleted] = useState<Set<number>>(
    () => new Set(initialCompleted ?? []),
  );
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedbackDone, setFeedbackDone] = useState(!!dayFeedbackSubmitted);
  const [pending, startTransition] = useTransition();
  const rootRef = useRef<HTMLDivElement | null>(null);

  const persistEnabled = !!(cohortId && dayNumber && phase);

  // Furthest section the user is allowed to view: section 0 + every section
  // immediately following a contiguous run of completed sections. So if 0,1,2
  // are done they can view through 3 ("the next thing to do") but not 4+.
  // When persistence is off (read-only / faculty preview), nothing is locked.
  const maxUnlocked = useMemo(() => {
    if (!persistEnabled) return total - 1;
    let n = 0;
    while (n < total - 1 && completed.has(n)) n += 1;
    return n;
  }, [persistEnabled, total, completed]);

  const goto = useCallback(
    (next: number) => {
      const clamped = Math.max(0, Math.min(maxUnlocked, next));
      setIdx(clamped);
    },
    [maxUnlocked],
  );

  const advance = useCallback(() => {
    const isLastSection = idx === total - 1;
    if (isLastSection) {
      if (triggerFeedbackOnLast && !feedbackDone) setFeedbackOpen(true);
      return;
    }
    goto(idx + 1);
  }, [idx, total, triggerFeedbackOnLast, feedbackDone, goto]);

  const markCurrentDoneAndAdvance = useCallback(() => {
    if (!persistEnabled) {
      advance();
      return;
    }
    // Optimistic local mark, then persist. We don't roll back on error: the
    // section is already visually advanced and the next render will reconcile
    // from initialCompleted on the next page load. Errors surface as toasts.
    setCompleted((prev) => {
      if (prev.has(idx)) return prev;
      const next = new Set(prev);
      next.add(idx);
      return next;
    });
    const captured = idx;
    startTransition(async () => {
      await markSectionComplete({
        cohort_id: cohortId!,
        day_number: dayNumber!,
        phase: phase!,
        section_index: captured,
      });
    });
    advance();
  }, [persistEnabled, idx, cohortId, dayNumber, phase, advance]);

  useEffect(() => {
    if (total <= 1) return;
    function onKey(e: KeyboardEvent) {
      const t = e.target as HTMLElement | null;
      if (t && /^(input|textarea|select)$/i.test(t.tagName)) return;
      if (t?.isContentEditable) return;

      if (e.key === "ArrowRight" || e.key === "PageDown") {
        e.preventDefault();
        goto(idx + 1);
      } else if (e.key === "ArrowLeft" || e.key === "PageUp") {
        e.preventDefault();
        goto(idx - 1);
      } else if (e.key === "Home") {
        e.preventDefault();
        goto(0);
      } else if (e.key === "End") {
        e.preventDefault();
        // End jumps to the furthest unlocked section, never past the gate.
        goto(maxUnlocked);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [idx, total, goto]);

  // Smoothly scroll the reader into view when the section changes (skip first mount).
  const firstMount = useRef(true);
  useEffect(() => {
    if (firstMount.current) {
      firstMount.current = false;
      return;
    }
    rootRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [idx]);

  const completedArray = useMemo(() => Array.from(completed).sort((a, b) => a - b), [completed]);

  if (total === 0) return null;

  // Single section → render without chrome (preserves the existing feel for short phases).
  if (total === 1) {
    return (
      <>
        <div ref={rootRef}>
          {items[0]}
          {sectionAddons?.[0] && <div className="mt-6">{sectionAddons[0]}</div>}
          {trailing}
          {persistEnabled && (
            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={markCurrentDoneAndAdvance}
                disabled={pending}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-md px-4 py-2 text-[13px] font-semibold transition-opacity",
                  completed.has(0)
                    ? "bg-ok/15 text-ok"
                    : "bg-accent text-cta-ink hover:opacity-90",
                )}
              >
                {completed.has(0) ? (
                  <>
                    <Check size={14} strokeWidth={2.4} />
                    Section complete
                    {triggerFeedbackOnLast && !feedbackDone && " — finish day"}
                  </>
                ) : (
                  <>
                    Mark complete{triggerFeedbackOnLast ? " & finish day" : " & continue"}
                  </>
                )}
              </button>
            </div>
          )}
        </div>
        {cohortId && dayNumber && (
          <DayFeedbackModal
            cohortId={cohortId}
            dayNumber={dayNumber}
            open={feedbackOpen}
            onClose={() => setFeedbackOpen(false)}
            onSubmitted={() => {
              setFeedbackOpen(false);
              setFeedbackDone(true);
            }}
          />
        )}
      </>
    );
  }

  const isFirst = idx === 0;
  const isLast = idx === total - 1;
  const title = titles[idx] ?? null;
  const currentDone = completed.has(idx);
  const isFinalAndUnsubmitted = isLast && triggerFeedbackOnLast && !feedbackDone;

  // Footer button label depends on context.
  let primaryLabel: string;
  if (currentDone && !isLast) primaryLabel = "Next";
  else if (currentDone && isFinalAndUnsubmitted) primaryLabel = "Finish day";
  else if (currentDone && isLast) primaryLabel = "Section complete";
  else if (isFinalAndUnsubmitted) primaryLabel = "Mark complete & finish day";
  else if (persistEnabled) primaryLabel = "Mark complete & continue";
  else primaryLabel = isLast ? "Section complete" : "Next";

  return (
    <>
      <div ref={rootRef} className="space-y-6 scroll-mt-20">
        {/* Section header */}
        <div className="border-line bg-card flex flex-wrap items-center justify-between gap-3 rounded-lg border p-3">
          <div className="min-w-0">
            <p className="text-muted text-[10.5px] font-semibold uppercase tracking-[0.18em]">
              Section {idx + 1} of {total}
              {persistEnabled && completedArray.length > 0 && (
                <span className="text-ok ml-2 normal-case">
                  · {completedArray.length} done
                </span>
              )}
            </p>
            {title && (
              <p className="text-ink mt-0.5 text-[14px] font-semibold tracking-tight">
                {title}
              </p>
            )}
          </div>
          <DotStrip
            total={total}
            idx={idx}
            completed={completed}
            maxUnlocked={maxUnlocked}
            onPick={goto}
          />
        </div>

        {/* Section content — only the active child is rendered */}
        <div>{items[idx]}</div>

        {/* Inline addon for this specific section (e.g., AssignmentBlock under
            the "Assignment" H2). Renders directly below the section body so
            the submit form is on the same page as the narrative. */}
        {sectionAddons?.[idx] && <div className="mt-6">{sectionAddons[idx]}</div>}

        {/* Trailing widgets only on the last section */}
        {isLast && trailing}

        {/* Footer nav */}
        <div className="border-line flex items-center justify-between gap-3 border-t pt-4">
          <button
            type="button"
            onClick={() => goto(idx - 1)}
            disabled={isFirst}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-[13px] font-medium transition-colors",
              isFirst
                ? "text-muted/50 cursor-not-allowed"
                : "text-ink hover:bg-bg-soft",
            )}
          >
            <ArrowLeft size={14} strokeWidth={2.1} />
            Previous
          </button>
          <span className="text-muted/70 hidden text-[10.5px] uppercase tracking-[0.18em] md:inline">
            ← / → keys
          </span>
          <button
            type="button"
            onClick={() => {
              if (currentDone) advance();
              else markCurrentDoneAndAdvance();
            }}
            disabled={pending || (currentDone && isLast && !isFinalAndUnsubmitted)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md px-4 py-2 text-[13px] font-semibold transition-opacity",
              currentDone && isLast && !isFinalAndUnsubmitted
                ? "bg-ok/15 text-ok cursor-default"
                : "bg-accent text-cta-ink hover:opacity-90",
            )}
          >
            {currentDone && isLast && !isFinalAndUnsubmitted && (
              <Check size={14} strokeWidth={2.4} />
            )}
            {primaryLabel}
            {!currentDone && !isLast && <ArrowRight size={14} strokeWidth={2.2} />}
            {currentDone && !isLast && <ArrowRight size={14} strokeWidth={2.2} />}
          </button>
        </div>
      </div>

      {cohortId && dayNumber && (
        <DayFeedbackModal
          cohortId={cohortId}
          dayNumber={dayNumber}
          open={feedbackOpen}
          onClose={() => setFeedbackOpen(false)}
          onSubmitted={() => {
            setFeedbackOpen(false);
            setFeedbackDone(true);
          }}
        />
      )}
    </>
  );
}

function DotStrip({
  total,
  idx,
  completed,
  maxUnlocked,
  onPick,
}: {
  total: number;
  idx: number;
  completed?: Set<number>;
  /** Highest section index the user is allowed to view; later dots show as locked. */
  maxUnlocked?: number;
  onPick: (i: number) => void;
}) {
  return (
    <div className="flex items-center gap-1.5" role="tablist" aria-label="Section progress">
      {Array.from({ length: total }).map((_, i) => {
        const active = i === idx;
        const done = completed?.has(i) ?? i < idx;
        const locked = maxUnlocked != null && i > maxUnlocked;
        return (
          <button
            key={i}
            type="button"
            role="tab"
            aria-selected={active}
            aria-label={`Section ${i + 1}${done ? " (complete)" : locked ? " (locked)" : ""}`}
            disabled={locked}
            onClick={() => !locked && onPick(i)}
            className={cn(
              "h-1.5 rounded-full transition-all duration-200",
              active
                ? "bg-accent w-6"
                : done
                  ? "bg-ok w-3"
                  : locked
                    ? "bg-line/40 w-3 cursor-not-allowed"
                    : "bg-line w-3 hover:bg-muted/50",
            )}
          />
        );
      })}
    </div>
  );
}
