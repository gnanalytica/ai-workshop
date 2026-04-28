import { cache } from "react";
import { cookies } from "next/headers";
import { getSession } from "@/lib/auth/session";
import { getSupabaseService } from "@/lib/supabase/service";
import { getTruePersona } from "@/lib/auth/persona";

/**
 * Sandbox cookie + helpers.
 *
 * When set, this cookie pins the current user into the demo cohort for the
 * scope of any cohort-aware UI. It's separate from `currentCohort` (which
 * pins among the user's *real* cohort assignments) and `previewCohortId`
 * (admin-only "preview as faculty" tour).
 *
 * Honored when:
 *   - The user is a true admin (they have global caps everywhere), OR
 *   - The user is a member of cohort_faculty for the demo cohort (which
 *     happens automatically via the trigger from migration 0049).
 *
 * Fail-closed for everyone else (e.g. a student) so a leaked cookie can't
 * give visibility outside the user's normal scope.
 */

export const SANDBOX_COHORT_COOKIE = "sandboxCohortId";

/** UUID of the demo cohort created in 0049_demo_cohort.sql. */
export const DEMO_COHORT_ID = "99999999-9999-9999-9999-999999999999";

/**
 * Returns DEMO_COHORT_ID when the cookie is set AND the user is allowed
 * to enter the sandbox. Returns null otherwise.
 */
export const getActiveSandboxCohortId = cache(async (): Promise<string | null> => {
  const store = await cookies();
  const set = store.get(SANDBOX_COHORT_COOKIE)?.value === DEMO_COHORT_ID;
  if (!set) return null;

  const user = await getSession();
  if (!user) return null;

  // Admins always allowed.
  if ((await getTruePersona()) === "admin") return DEMO_COHORT_ID;

  // Non-admin: must have a cohort_faculty row in the demo cohort. Faculty
  // get one auto-inserted by the migration trigger. Students do not.
  const svc = getSupabaseService();
  const { data } = await svc
    .from("cohort_faculty")
    .select("user_id")
    .eq("user_id", user.id)
    .eq("cohort_id", DEMO_COHORT_ID)
    .maybeSingle();
  return data ? DEMO_COHORT_ID : null;
});

/** Lightweight client/server utility — true when sandbox is currently on. */
export async function isSandboxActive(): Promise<boolean> {
  return (await getActiveSandboxCohortId()) !== null;
}
