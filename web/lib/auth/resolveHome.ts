import { getSession } from "@/lib/auth/session";
import { getSupabaseService } from "@/lib/supabase/service";

const STAFF_HOMES: Record<string, string> = {
  admin: "/admin",
  trainer: "/admin",
  tech_support: "/admin",
};

/**
 * Resolve the post-auth landing path for the current user.
 *
 *   /admin        — has any of admin / trainer / tech_support staff_role
 *   /faculty      — has any cohort_faculty assignment
 *   /learn        — has any confirmed registration
 *   /start/claim  — authenticated but no role yet (just signed in via OAuth)
 *   /start        — not authenticated
 *
 * Single source of truth — every "go home" link, callback, and post-claim
 * redirect should pass through here so role-routing isn't sprinkled around.
 */
export async function resolveHome(): Promise<string> {
  const user = await getSession();
  if (!user) return "/start";

  const svc = getSupabaseService();
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

  const staffRoles = (profileRes.data?.staff_roles ?? []) as string[];
  for (const role of staffRoles) {
    if (STAFF_HOMES[role]) return STAFF_HOMES[role];
  }
  if (facRes.data) return "/faculty";
  if (regRes.data) return "/learn";
  return "/start/claim";
}
