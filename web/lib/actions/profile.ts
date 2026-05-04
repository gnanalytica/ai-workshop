"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { withSupabase, actionFail, actionOk } from "./_helpers";
import { getSupabaseServer } from "@/lib/supabase/server";

const profileSchema = z.object({
  full_name: z.string().trim().min(1).max(120),
  college: z.string().trim().max(120).nullable().optional(),
  avatar_url: z.string().trim().url().nullable().optional().or(z.literal("")),
});

const emailSchema = z.object({ email: z.string().trim().email().max(254) });

/**
 * Initiate an email change. Supabase sends a confirmation link to the new
 * address; the change only takes effect once the user clicks it. The old
 * address keeps signing in until then. We do NOT update profiles.email here —
 * the on-update trigger that mirrors auth.users.email into profiles handles
 * that after confirmation.
 */
export async function updateMyEmail(input: z.infer<typeof emailSchema>) {
  const parsed = emailSchema.safeParse(input);
  if (!parsed.success) return actionFail("Enter a valid email address.");
  const sb = await getSupabaseServer();
  const { data: u } = await sb.auth.getUser();
  if (!u.user) return actionFail("Not signed in.");
  const newEmail = parsed.data.email.toLowerCase();
  if (newEmail === (u.user.email ?? "").toLowerCase()) {
    return actionFail("That's already your current email.");
  }
  const { error } = await sb.auth.updateUser({ email: newEmail });
  if (error) return actionFail(error.message);
  return actionOk({ pending: newEmail });
}

/**
 * Mark the first-login tour as seen. Called when the user finishes or skips
 * the overlay. Idempotent — only sets the timestamp if it's still null so
 * a "show me the tour again" feature could clear and replay later.
 */
export async function markOnboarded() {
  const sb = await getSupabaseServer();
  const { data: u } = await sb.auth.getUser();
  if (!u.user) return actionFail("Not signed in.");
  const { error } = await sb
    .from("profiles")
    .update({ onboarded_at: new Date().toISOString() })
    .eq("id", u.user.id)
    .is("onboarded_at", null);
  if (error) return actionFail(error.message);
  revalidatePath("/onboarding");
  revalidatePath("/learn");
  revalidatePath("/", "layout");
  return actionOk();
}

/**
 * Form-action wrapper. `<form action={...}>` requires a `(formData) => void`
 * signature; `markOnboarded` returns an ActionResult so consumers can react.
 * This thin wrapper drops the result and accepts a FormData arg so it can
 * be used directly as `action={markOnboardedFromForm}`.
 */
export async function markOnboardedFromForm(_formData: FormData): Promise<void> {
  await markOnboarded();
}

export async function updateMyProfile(input: z.infer<typeof profileSchema>) {
  const parsed = profileSchema.safeParse(input);
  if (!parsed.success) return actionFail("Invalid input");
  return withSupabase(async (sb) => {
    const { data: u } = await sb.auth.getUser();
    if (!u.user) return { data: null, error: { message: "Not signed in" } };
    return sb
      .from("profiles")
      .update({
        full_name: parsed.data.full_name,
        college: parsed.data.college || null,
        avatar_url: parsed.data.avatar_url || null,
      })
      .eq("id", u.user.id)
      .select()
      .single();
  }, "/settings/profile");
}
