"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { signUp, type SignUpState } from "@/lib/auth/actions";
import { GoogleButton } from "../GoogleButton";
import { InviteCodeField } from "../InviteCodeField";

const initial: SignUpState = {};

export function SignUpForm({ email }: { email: string }) {
  const [state, action] = useActionState(signUp, initial);

  return (
    <div className="flex flex-col gap-4">
      <GoogleButton next="/start/claim" />
      <Divider />
      <form action={action} className="flex flex-col gap-4">
        <input type="hidden" name="email" value={email} />

        <Field label="Full name">
          <input
            name="full_name"
            type="text"
            required
            maxLength={120}
            placeholder="Ada Lovelace"
            className="border-line bg-input-bg text-ink placeholder:text-muted rounded-md border px-3 py-2 text-sm transition-[border-color,box-shadow] duration-200 focus-visible:border-accent/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[hsl(var(--accent))]"
          />
        </Field>

        <InviteCodeField name="code" label="Invite code" />

        <SubmitButton />
        {state.message && (
          <p className={state.ok ? "text-accent text-sm" : "text-danger text-sm"}>
            {state.message}
          </p>
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
      className="bg-accent text-cta-ink mt-2 rounded-md px-4 py-2.5 text-sm font-medium transition-all duration-200 disabled:opacity-60"
    >
      {pending ? "Creating account…" : "Create account →"}
    </button>
  );
}
