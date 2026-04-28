"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { claimInvite, type SignInState } from "@/lib/auth/actions";
import { InviteCodeField } from "../InviteCodeField";

const initial: SignInState = {};

export function ClaimForm({ defaultName = "" }: { defaultName?: string }) {
  const [state, action] = useActionState(claimInvite, initial);

  return (
    <form action={action} className="flex flex-col gap-4">
      <Field label="Full name">
        <input
          name="full_name"
          type="text"
          required
          maxLength={120}
          defaultValue={defaultName}
          placeholder="Ada Lovelace"
          className="border-line bg-input-bg text-ink placeholder:text-muted rounded-md border px-3 py-2 text-sm transition-[border-color,box-shadow] duration-200 focus-visible:border-accent/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[hsl(var(--accent))]"
        />
      </Field>

      <InviteCodeField name="code" label="Invite code" />

      <SubmitButton />
      {state.message && (
        <p className={state.ok ? "text-accent text-sm" : "text-danger text-sm"}>{state.message}</p>
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
      {pending ? "Activating…" : "Activate account →"}
    </button>
  );
}
