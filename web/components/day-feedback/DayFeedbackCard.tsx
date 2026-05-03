"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { submitDayFeedback } from "@/lib/actions/day-feedback";

const EMOJI: Array<{ value: 1 | 2 | 3 | 4 | 5; emoji: string; label: string }> = [
  { value: 1, emoji: "😞", label: "Difficult" },
  { value: 2, emoji: "😕", label: "Not great" },
  { value: 3, emoji: "😐", label: "OK" },
  { value: 4, emoji: "🙂", label: "Good" },
  { value: 5, emoji: "🤩", label: "Excellent" },
];

export interface DayFeedbackCardProps {
  cohortId: string;
  dayNumber: number;
  dayTitle?: string;
  existing?: {
    rating: number;
    fuzzy_topic: string | null;
    notes: string | null;
    anonymous: boolean;
  };
}

export function DayFeedbackCard({
  cohortId,
  dayNumber,
  dayTitle,
  existing,
}: DayFeedbackCardProps) {
  const [rating, setRating] = useState<number | null>(existing?.rating ?? null);
  const [fuzzy, setFuzzy] = useState(existing?.fuzzy_topic ?? "");
  const [notes, setNotes] = useState(existing?.notes ?? "");
  const [anonymous, setAnonymous] = useState(existing?.anonymous ?? false);
  const [showNotes, setShowNotes] = useState(!!existing?.notes);
  const [pending, start] = useTransition();
  const [submitted, setSubmitted] = useState(!!existing);

  function send() {
    if (rating == null) {
      toast.error("Please choose a rating");
      return;
    }
    start(async () => {
      const r = await submitDayFeedback({
        cohort_id: cohortId,
        day_number: dayNumber,
        rating,
        fuzzy_topic: fuzzy.trim() || undefined,
        notes: notes.trim() || undefined,
        anonymous,
      });
      if (r.ok) {
        toast.success(submitted ? "Feedback updated" : "Thank you for your feedback");
        setSubmitted(true);
      } else {
        toast.error(r.error);
      }
    });
  }

  return (
    <section className="border-line bg-card rounded-lg border p-4">
      <header className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
        <div className="min-w-0">
          <p className="text-accent font-mono text-[10.5px] tracking-widest uppercase">
            Day {dayNumber} feedback
          </p>
          {dayTitle && (
            <h3 className="text-ink mt-0.5 truncate text-sm font-semibold">
              {dayTitle}
            </h3>
          )}
        </div>
        {submitted && (
          <span className="text-muted text-[11px]">Submitted · you can edit it</span>
        )}
      </header>

      <div className="flex flex-wrap items-center gap-1.5">
        {EMOJI.map((e) => {
          const active = rating === e.value;
          return (
            <button
              key={e.value}
              type="button"
              aria-label={e.label}
              aria-pressed={active}
              disabled={pending}
              onClick={() => setRating(e.value)}
              className={
                active
                  ? "border-accent bg-accent/10 ring-accent/15 rounded-md border-2 px-2.5 py-1.5 text-xl ring-2 transition-colors disabled:opacity-50"
                  : "border-line bg-bg hover:border-accent/55 hover:bg-accent/5 rounded-md border px-2.5 py-1.5 text-xl transition-colors disabled:opacity-50"
              }
            >
              {e.emoji}
            </button>
          );
        })}
      </div>

      <div className="mt-3">
        <label
          htmlFor={`fuzzy-${dayNumber}`}
          className="text-muted mb-1 block text-[10.5px] font-semibold uppercase tracking-[0.18em]"
        >
          What was unclear?
        </label>
        <input
          id={`fuzzy-${dayNumber}`}
          value={fuzzy}
          onChange={(e) => setFuzzy(e.target.value)}
          disabled={pending}
          maxLength={280}
          placeholder="Optional — one short topic you did not understand"
          className="border-line bg-input-bg text-ink focus:border-accent focus:ring-accent/15 w-full rounded-md border px-3 py-2 text-sm transition-colors focus:outline-none focus:ring-2 disabled:opacity-50"
        />
      </div>

      {showNotes ? (
        <div className="mt-3">
          <label
            htmlFor={`notes-${dayNumber}`}
            className="text-muted mb-1 block text-[10.5px] font-semibold uppercase tracking-[0.18em]"
          >
            Notes
          </label>
          <textarea
            id={`notes-${dayNumber}`}
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            disabled={pending}
            maxLength={2000}
            placeholder="Anything else to share with faculty?"
            className="border-line bg-input-bg text-ink focus:border-accent focus:ring-accent/15 w-full rounded-md border p-3 text-sm leading-relaxed transition-colors focus:outline-none focus:ring-2 disabled:opacity-50"
          />
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setShowNotes(true)}
          className="text-accent mt-3 text-xs font-semibold hover:underline"
        >
          Add notes
        </button>
      )}

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <label className="text-muted flex items-center gap-2 text-xs">
          <input
            type="checkbox"
            checked={anonymous}
            onChange={(e) => setAnonymous(e.target.checked)}
            disabled={pending}
            className="border-line accent-accent rounded"
          />
          Submit anonymously
        </label>
        <Button
          onClick={send}
          disabled={pending || rating == null}
          size="sm"
        >
          {pending ? "Saving…" : submitted ? "Update" : "Submit"}
        </Button>
      </div>
    </section>
  );
}
