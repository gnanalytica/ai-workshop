"use client";

import { useState, useTransition } from "react";
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
            // revert on failure so the UI stays honest
            setDone(prev);
          }
        });
      }}
      className="accent-[hsl(var(--accent))] mt-1.5 h-3.5 w-3.5 cursor-pointer disabled:opacity-50"
      aria-label={labId}
    />
  );
}
