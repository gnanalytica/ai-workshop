"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { submitDayFeedback } from "@/lib/actions/lesson-progress";

export function DayFeedbackModal({
  cohortId,
  dayNumber,
  open,
  onClose,
  onSubmitted,
}: {
  cohortId: string;
  dayNumber: number;
  open: boolean;
  onClose: () => void;
  onSubmitted: () => void;
}) {
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [fuzzy, setFuzzy] = useState("");
  const [notes, setNotes] = useState("");
  const [anon, setAnon] = useState(false);
  const [pending, start] = useTransition();
  const dialogRef = useRef<HTMLDivElement | null>(null);

  // Lock body scroll while open and trap initial focus on the dialog.
  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialogRef.current?.focus();
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  if (!open) return null;

  function submit() {
    if (rating < 1 || rating > 5) {
      toast.error("Please rate the day from 1 to 5");
      return;
    }
    start(async () => {
      const r = await submitDayFeedback({
        cohort_id: cohortId,
        day_number: dayNumber,
        rating,
        fuzzy_topic: fuzzy.trim() || null,
        notes: notes.trim() || null,
        anonymous: anon,
      });
      if (r.ok) {
        toast.success(`Day ${dayNumber} marked complete ✓`);
        onSubmitted();
      } else {
        toast.error(r.error);
      }
    });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="dayfb-title"
    >
      <div
        ref={dialogRef}
        tabIndex={-1}
        className="border-line bg-card w-full max-w-lg space-y-5 rounded-xl border p-6 shadow-xl outline-none"
      >
        <div>
          <p className="text-accent font-mono text-[10.5px] tracking-[0.18em] uppercase">
            Day {dayNumber} · wrap-up
          </p>
          <h2 id="dayfb-title" className="mt-1 text-xl font-semibold tracking-tight">
            One quick question — how did today land?
          </h2>
          <p className="text-muted mt-1 text-sm">
            We use this to fix what felt fuzzy and pace tomorrow. Submit to mark the day complete.
          </p>
        </div>

        <div>
          <p className="text-ink mb-2 text-xs font-semibold uppercase tracking-wider">
            Today's rating <span className="text-danger">*</span>
          </p>
          <div className="flex items-center gap-1.5">
            {[1, 2, 3, 4, 5].map((n) => {
              const filled = n <= (hoverRating || rating);
              return (
                <button
                  key={n}
                  type="button"
                  onClick={() => setRating(n)}
                  onMouseEnter={() => setHoverRating(n)}
                  onMouseLeave={() => setHoverRating(0)}
                  aria-label={`${n} star${n > 1 ? "s" : ""}`}
                  className={cn(
                    "rounded-md p-1 transition-colors",
                    filled ? "text-accent" : "text-muted/40 hover:text-muted",
                  )}
                >
                  <Star size={26} fill={filled ? "currentColor" : "none"} strokeWidth={1.6} />
                </button>
              );
            })}
            {rating > 0 && (
              <span className="text-muted ml-2 text-xs">{rating}/5</span>
            )}
          </div>
        </div>

        <label className="block">
          <span className="text-ink mb-1 block text-xs font-semibold uppercase tracking-wider">
            Anything still fuzzy? <span className="text-muted text-[11px] normal-case">(optional)</span>
          </span>
          <Input
            value={fuzzy}
            onChange={(e) => setFuzzy(e.target.value)}
            placeholder="e.g., the part about temperature"
          />
        </label>

        <label className="block">
          <span className="text-ink mb-1 block text-xs font-semibold uppercase tracking-wider">
            Anything you'd flag <span className="text-muted text-[11px] normal-case">(optional)</span>
          </span>
          <textarea
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Pace, content, audio, anything…"
            className="border-line bg-input-bg text-ink w-full rounded-md border p-2 text-sm"
          />
        </label>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={anon}
            onChange={(e) => setAnon(e.target.checked)}
          />
          <span>Submit anonymously</span>
        </label>

        <div className="flex items-center justify-between gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={pending}
            className="text-muted hover:text-ink text-sm"
          >
            Not now
          </button>
          <Button onClick={submit} disabled={pending || rating === 0}>
            {pending ? "Submitting…" : "Submit & finish day"}
          </Button>
        </div>
      </div>
    </div>
  );
}
