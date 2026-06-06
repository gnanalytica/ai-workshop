"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { submitRollNumber, type SubmitState } from "./actions";

const initial: SubmitState = {};

export function RollNumberForm() {
  const [state, action] = useActionState(submitRollNumber, initial);

  return (
    <form action={action} className="flex flex-col gap-4">
      <Field label="Roll number">
        <input
          name="roll_number"
          type="text"
          required
          maxLength={64}
          placeholder="e.g., CSE-2024-001"
          autoComplete="off"
          className="border-line bg-input-bg text-ink placeholder:text-muted rounded-md border px-3 py-2 text-sm transition-[border-color,box-shadow] duration-200 focus-visible:border-accent/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[hsl(var(--accent))]"
        />
      </Field>

      <p className="text-muted -mt-1 text-xs">
        Must be unique in your cohort. You can&apos;t change this later.
      </p>

      <SubmitButton />
      {state.message && (
        <p className={state.ok ? "text-accent text-sm" : "text-danger text-sm"}>
          {state.message}
        </p>
      )}
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-muted text-xs font-medium tracking-wide uppercase">{label}</span>
      {children}
    </label>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="bg-accent text-cta-ink mt-2 rounded-md px-4 py-2.5 text-sm font-medium transition-all duration-200 disabled:opacity-60"
    >
      {pending ? "Saving…" : "Continue →"}
    </button>
  );
}
