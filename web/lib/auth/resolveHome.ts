import { getSession } from "@/lib/auth/session";
import { getSupabaseService } from "@/lib/supabase/service";

/**
 * Resolve the post-auth landing path. Invariants enforced in DB:
 *   - admin is global; cannot also be student/faculty
 *   - student has at most one confirmed registration
 *   - faculty may be assigned to multiple cohorts (cookie picks current)
 *
 *   /admin        — has admin staff_role
 *   /faculty      — has any cohort_faculty assignment
 *   /learn        — has a confirmed registration
 *   /start/claim  — authenticated but no role yet
 *   /start        — not authenticated
 */
const STAFF_HOMES: Record<string, string> = {
  admin: "/admin",
};

export async function resolveHome(): Promise<string> {
  const user = await getSession();
  if (!user) return "/start";

  const svc = getSupabaseService();
  // Fire all three role checks in parallel — staff is rare, so sequencing it
  // first cost a round-trip on every student/faculty redirect.
  const [profileRes, facRes, regRes] = await Promise.all([
    svc.from("profiles").select("staff_roles").eq("id", user.id).maybeSingle(),
    svc.from("cohort_faculty").select("user_id").eq("user_id", user.id).limit(1).maybeSingle(),
    svc
      .from("registrations")
      .select("user_id")
      .eq("user_id", user.id)
      .eq("status", "confirmed")
      .limit(1)
      .maybeSingle(),
  ]);

  const roles = (profileRes.data?.staff_roles ?? []) as string[];
  for (const r of roles) {
    if (STAFF_HOMES[r]) return STAFF_HOMES[r];
  }

  if (facRes.data) return "/faculty";
  if (regRes.data) return "/learn";
  return "/start/claim";
}
