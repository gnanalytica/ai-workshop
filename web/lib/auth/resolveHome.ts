import { getSession } from "@/lib/auth/session";
import { getSupabaseService } from "@/lib/supabase/service";

/**
 * Resolve the post-auth landing path. Invariants enforced in DB
 * (see migration 0015_role_invariants):
 *   - admin/trainer/tech_support is global; cannot also be student/faculty
 *   - student has at most one confirmed registration
 *   - faculty may be assigned to multiple cohorts (cookie picks current)
 *
 *   /admin        — has any of admin / trainer / tech_support staff_role
 *   /faculty      — has any cohort_faculty assignment
 *   /learn        — has a confirmed registration
 *   /start/claim  — authenticated but no role yet
 *   /start        — not authenticated
 */
const STAFF_HOMES: Record<string, string> = {
  admin: "/admin",
  trainer: "/admin",
  tech_support: "/admin",
};

export async function resolveHome(): Promise<string> {
  const user = await getSession();
  if (!user) return "/start";

  const svc = getSupabaseService();
  const { data: profile } = await svc
    .from("profiles")
    .select("staff_roles")
    .eq("id", user.id)
    .maybeSingle();

  const roles = (profile?.staff_roles ?? []) as string[];
  for (const r of roles) {
    if (STAFF_HOMES[r]) return STAFF_HOMES[r];
  }

  // Not staff — check faculty / student in parallel.
  const [fac, reg] = await Promise.all([
    svc.from("cohort_faculty").select("user_id").eq("user_id", user.id).limit(1).maybeSingle(),
    svc
      .from("registrations")
      .select("user_id")
      .eq("user_id", user.id)
      .eq("status", "confirmed")
      .limit(1)
      .maybeSingle(),
  ]);

  if (fac.data) return "/faculty";
  if (reg.data) return "/learn";
  return "/start/claim";
}
