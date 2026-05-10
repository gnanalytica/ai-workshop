"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { setLabStep, type LabStatus } from "@/lib/actions/lab-progress";

/**
 * Client wrapper around a GFM task-list checkbox. When the page renders
 * MDX with a `progressCtx` (cohortId + dayNumber), each checkbox becomes
 * one of these and persists toggles to lab_progress for the signed-in
 * user. Without ctx, the bare browser-managed checkbox is used.
 */
export function LabCheckbox({
  cohortId,
  dayNumber,
  labId,
  initialDone,
}: {
  cohortId: string;
  dayNumber: number;
  labId: string;
  initialDone: boolean;
}) {
  const [done, setDone] = useState(initialDone);
  const [pending, startTransition] = useTransition();
  const [flash, setFlash] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  return (
    <input
      type="checkbox"
      checked={done}
      disabled={pending}
      onChange={(e) => {
        const next = e.currentTarget.checked;
        const prev = done;
        setDone(next);
        const status: LabStatus = next ? "done" : "in_progress";
        startTransition(async () => {
          const r = await setLabStep({ cohortId, dayNumber, labId, status });
          if (!r.ok) {
            setDone(prev);
            return;
          }
          setFlash(true);
          if (timer.current) clearTimeout(timer.current);
          timer.current = setTimeout(() => setFlash(false), 900);
        });
      }}
      className={`mt-1 h-[1.125rem] w-[1.125rem] shrink-0 cursor-pointer rounded border-2 border-line accent-[hsl(var(--accent))] transition-all hover:border-accent hover:shadow-[0_0_0_3px_hsl(var(--accent)/0.15)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 disabled:opacity-50 ${
        flash ? "ring-2 ring-accent ring-offset-1" : ""
      }`}
      aria-label={labId}
      title="Click to mark complete — your progress is saved"
    />
  );
}
