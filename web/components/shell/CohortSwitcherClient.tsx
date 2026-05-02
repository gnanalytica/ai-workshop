"use client";

import { useRef } from "react";
import { setCurrentFacultyCohort } from "@/lib/actions/faculty-cohort";

export function CohortSwitcherClient({
  cohorts,
  currentId,
}: {
  cohorts: { id: string; name: string }[];
  currentId: string;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  return (
    // Remount whenever the server-resolved cohort changes so the
    // uncontrolled <select> picks up the new defaultValue.
    <form
      key={currentId}
      ref={formRef}
      action={setCurrentFacultyCohort}
      className="flex items-center gap-2"
    >
      <label htmlFor="cohort_id" className="text-muted text-xs tracking-wide uppercase">
        Cohort
      </label>
      <select
        id="cohort_id"
        name="cohort_id"
        defaultValue={currentId}
        onChange={() => formRef.current?.requestSubmit()}
        className="border-line bg-input-bg text-ink rounded-md border px-2 py-1 text-sm transition-[border-color,box-shadow] duration-200 focus-visible:border-accent/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[hsl(var(--accent))]"
      >
        {cohorts.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>
    </form>
  );
}
