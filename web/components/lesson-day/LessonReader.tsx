"use client";

import {
  Children,
  isValidElement,
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { DayFeedbackModal } from "./DayFeedbackModal";

export function LessonReader({
  titles,
  children,
  trailing,
  sectionAddons,
  cohortId,
  dayNumber,
  triggerFeedbackOnLast,
  dayFeedbackSubmitted,
}: {
  titles: (string | null)[];
  children: ReactNode;
  trailing?: ReactNode;
  sectionAddons?: Record<number, ReactNode>;
  cohortId?: string;
  dayNumber?: number;
  /** When true (post phase only), the last section gets a "Mark day as completed" button that opens the feedback modal. */
  triggerFeedbackOnLast?: boolean;
  /** True if the user has already submitted feedback for this day. Hides the modal trigger. */
  dayFeedbackSubmitted?: boolean;
}) {
  const items = Children.toArray(children).filter(isValidElement);
  const total = items.length;

  const [idx, setIdx] = useState(0);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedbackDone, setFeedbackDone] = useState(!!dayFeedbackSubmitted);
  const rootRef = useRef<HTMLDivElement | null>(null);

  const goto = useCallback(
    (next: number) => {
      setIdx(Math.max(0, Math.min(total - 1, next)));
    },
    [total],
  );

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
        goto(total - 1);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [idx, total, goto]);

  const firstMount = useRef(true);
  useEffect(() => {
    if (firstMount.current) {
      firstMount.current = false;
      return;
    }
    rootRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [idx]);

  if (total === 0) return null;

  const showDayCompleteButton =
    triggerFeedbackOnLast && !!cohortId && !!dayNumber && idx === total - 1;

  const dayCompleteButton = showDayCompleteButton ? (
    <div className="mt-8 flex justify-center">
      <button
        type="button"
        onClick={() => !feedbackDone && setFeedbackOpen(true)}
        disabled={feedbackDone}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-md px-5 py-2.5 text-[13px] font-semibold transition-opacity",
          feedbackDone
            ? "bg-ok/15 text-ok cursor-default"
            : "bg-accent text-cta-ink hover:opacity-90",
        )}
      >
        {feedbackDone ? (
          <>
            <Check size={14} strokeWidth={2.4} />
            Day completed
          </>
        ) : (
          "Mark day as completed"
        )}
      </button>
    </div>
  ) : null;

  const feedbackModal =
    cohortId && dayNumber ? (
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
    ) : null;

  // Single section → render without chrome.
  if (total === 1) {
    return (
      <>
        <div ref={rootRef}>
          {items[0]}
          {sectionAddons?.[0] && <div className="mt-6">{sectionAddons[0]}</div>}
          {trailing}
          {dayCompleteButton}
        </div>
        {feedbackModal}
      </>
    );
  }

  const isFirst = idx === 0;
  const isLast = idx === total - 1;
  const title = titles[idx] ?? null;

  return (
    <>
      <div ref={rootRef} className="relative space-y-6 scroll-mt-20">
        {/* Section header */}
        <div className="border-line bg-card flex flex-wrap items-center justify-between gap-3 rounded-lg border p-3">
          <div className="min-w-0">
            <p className="text-muted text-[10.5px] font-semibold uppercase tracking-[0.18em]">
              Section {idx + 1} of {total}
            </p>
            {title && (
              <p className="text-ink mt-0.5 text-[14px] font-semibold tracking-tight">
                {title}
              </p>
            )}
          </div>
          <DotStrip total={total} idx={idx} onPick={goto} />
        </div>

        <div>{items[idx]}</div>

        {sectionAddons?.[idx] && <div className="mt-6">{sectionAddons[idx]}</div>}

        {isLast && trailing}
        {isLast && dayCompleteButton}

        <div className="border-line flex items-center justify-between gap-3 border-t pt-4">
          {!isFirst ? (
            <button
              type="button"
              onClick={() => goto(idx - 1)}
              className="inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-[13px] font-medium text-ink hover:bg-bg-soft transition-colors"
            >
              <ArrowLeft size={14} strokeWidth={2.1} />
              Previous
            </button>
          ) : (
            <span />
          )}
          <span className="text-muted/70 hidden text-[10.5px] uppercase tracking-[0.18em] md:inline">
            ← / → keys
          </span>
          {!isLast ? (
            <button
              type="button"
              onClick={() => goto(idx + 1)}
              className="inline-flex items-center gap-1.5 rounded-md bg-accent px-4 py-2 text-[13px] font-semibold text-cta-ink hover:opacity-90 transition-opacity"
            >
              Next
              <ArrowRight size={14} strokeWidth={2.2} />
            </button>
          ) : (
            <span />
          )}
        </div>
      </div>

      {feedbackModal}
    </>
  );
}

function DotStrip({
  total,
  idx,
  onPick,
}: {
  total: number;
  idx: number;
  onPick: (i: number) => void;
}) {
  return (
    <div className="flex items-center gap-1.5" role="tablist" aria-label="Section progress">
      {Array.from({ length: total }).map((_, i) => {
        const active = i === idx;
        return (
          <button
            key={i}
            type="button"
            role="tab"
            aria-selected={active}
            aria-label={`Section ${i + 1}`}
            onClick={() => onPick(i)}
            className={cn(
              "h-1.5 rounded-full transition-all duration-200",
              active ? "bg-accent w-6" : "bg-line w-3 hover:bg-muted/50",
            )}
          />
        );
      })}
    </div>
  );
}
