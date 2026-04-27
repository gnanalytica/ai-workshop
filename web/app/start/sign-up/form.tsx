"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { signUp, type SignUpState } from "@/lib/auth/actions";
import { GoogleButton } from "../GoogleButton";

type Role = "student" | "faculty";
const initial: SignUpState = {};

export function SignUpForm({ email }: { email: string }) {
  const [state, action] = useActionState(signUp, initial);
  const [role, setRole] = useState<Role>("student");

  return (
    <div className="flex flex-col gap-4">
      <GoogleButton next="/start/claim" />
      <Divider />
    <form action={action} className="flex flex-col gap-4">
      <input type="hidden" name="email" value={email} />
      <input type="hidden" name="role" value={role} />

      <Field label="Full name">
        <input
          name="full_name"
          type="text"
          required
          maxLength={120}
          placeholder="Ada Lovelace"
          className="border-line bg-input-bg text-ink placeholder:text-muted rounded-md border px-3 py-2 text-sm"
        />
      </Field>

      <fieldset className="flex flex-col gap-2">
        <legend className="text-muted text-xs font-medium tracking-wide uppercase">
          I&apos;m signing up as
        </legend>
        <div className="grid grid-cols-2 gap-2">
          {(["student", "faculty"] as const).map((r) => (
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
        <Field label="Cohort invite code" hint="From your enrollment confirmation.">
          <input
            name="cohort_code"
            required
            placeholder="e.g. JAN26-XYZ8"
            autoCapitalize="characters"
            className="border-line bg-input-bg text-ink placeholder:text-muted rounded-md border px-3 py-2 font-mono text-sm tracking-wider"
          />
        </Field>
      )}

      {role === "faculty" && (
        <Field label="Faculty invite code" hint="Encodes your cohort and support / executive role.">
          <input
            name="faculty_code"
            required
            placeholder="e.g. FAC-A1B2"
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
    </div>
  );
}

function Divider() {
  return (
    <div className="flex items-center gap-3 text-xs">
      <span className="border-line/60 h-px flex-1 border-t" />
      <span className="text-muted tracking-widest uppercase">or email</span>
      <span className="border-line/60 h-px flex-1 border-t" />
    </div>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-muted text-xs font-medium tracking-wide uppercase">{label}</span>
      {children}
      {hint && <span className="text-muted text-xs">{hint}</span>}
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
      {pending ? "Creating account…" : "Create account →"}
    </button>
  );
}
