"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { claimInvite, type SignInState } from "@/lib/auth/actions";

type Role = "student" | "faculty" | "staff";
const initial: SignInState = {};

export function ClaimForm() {
  const [state, action] = useActionState(claimInvite, initial);
  const [role, setRole] = useState<Role>("student");

  return (
    <form action={action} className="flex flex-col gap-4">
      <input type="hidden" name="role" value={role} />
      <fieldset className="flex flex-col gap-2">
        <legend className="text-muted text-xs font-medium tracking-wide uppercase">
          I&apos;m joining as
        </legend>
        <div className="grid grid-cols-3 gap-2">
          {(["student", "faculty", "staff"] as const).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRole(r)}
              className={`cursor-pointer rounded-md border px-3 py-2 text-center text-sm capitalize ${
                role === r
                  ? "border-accent bg-accent/10 text-ink"
                  : "border-line text-muted hover:text-ink"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </fieldset>

      {role === "student" && (
        <Field label="Cohort invite code">
          <input
            name="cohort_code"
            required
            placeholder="e.g. STU-APR2026"
            autoCapitalize="characters"
            className="border-line bg-input-bg text-ink placeholder:text-muted rounded-md border px-3 py-2 font-mono text-sm tracking-wider"
          />
        </Field>
      )}

      {role === "faculty" && (
        <Field label="Faculty invite code">
          <input
            name="faculty_code"
            required
            placeholder="e.g. FAC-SUP2026"
            autoCapitalize="characters"
            className="border-line bg-input-bg text-ink placeholder:text-muted rounded-md border px-3 py-2 font-mono text-sm tracking-wider"
          />
        </Field>
      )}

      {role === "staff" && (
        <Field label="Staff invite code">
          <input
            name="staff_code"
            required
            placeholder="e.g. ADMIN-BOOT01"
            autoCapitalize="characters"
            className="border-line bg-input-bg text-ink placeholder:text-muted rounded-md border px-3 py-2 font-mono text-sm tracking-wider"
          />
        </Field>
      )}

      <SubmitButton />
      {state.message && (
        <p className={state.ok ? "text-accent text-sm" : "text-sm text-red-400"}>{state.message}</p>
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
      className="bg-accent text-cta-ink mt-2 rounded-md px-4 py-2.5 text-sm font-medium disabled:opacity-60"
    >
      {pending ? "Activating…" : "Activate account →"}
    </button>
  );
}
