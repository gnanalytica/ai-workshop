"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { startFlow, type StartState } from "@/lib/auth/actions";

const initial: StartState = {};

export function StartForm({ next }: { next: string }) {
  const [state, action] = useActionState(startFlow, initial);
  return (
    <form action={action} className="flex flex-col gap-3">
      <input type="hidden" name="next" value={next} />
      <label className="text-muted text-xs font-medium tracking-wide uppercase" htmlFor="email">
        Email
      </label>
      <input
        id="email"
        name="email"
        type="email"
        required
        autoComplete="email"
        placeholder="you@school.edu"
        className="border-line bg-input-bg text-ink placeholder:text-muted rounded-md border px-3 py-2 text-sm"
      />
      <SubmitButton />
      {state.message && (
        <p className={state.ok ? "text-accent mt-1 text-sm" : "mt-1 text-sm text-red-400"}>
          {state.message}
        </p>
      )}
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="bg-accent text-cta-ink mt-2 rounded-md px-4 py-2.5 text-sm font-medium disabled:opacity-60"
    >
      {pending ? "Checking…" : "Continue →"}
    </button>
  );
}
