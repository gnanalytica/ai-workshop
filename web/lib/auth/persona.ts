import { cache } from "react";
import { cookies } from "next/headers";
import { getSession } from "@/lib/auth/session";
import { getSupabaseService } from "@/lib/supabase/service";

export type Persona = "admin" | "faculty" | "student";

export const PREVIEW_COOKIE = "previewAs";

const STAFF_ADMIN_ROLES = new Set(["admin", "trainer", "tech_support"]);

/**
 * The user's *true* persona based on their stored role/assignments.
 * Mirrors resolveHome: admin > faculty > student. Returns null if the user
 * has no role yet (still on /start/claim path).
 */
export const getTruePersona = cache(async (): Promise<Persona | null> => {
  const user = await getSession();
  if (!user) return null;
  const svc = getSupabaseService();
  const { data: profile } = await svc
    .from("profiles")
    .select("staff_roles")
    .eq("id", user.id)
    .maybeSingle();

  for (const r of (profile?.staff_roles ?? []) as string[]) {
    if (STAFF_ADMIN_ROLES.has(r)) return "admin";
  }
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
  if (fac.data) return "faculty";
  if (reg.data) return "student";
  return null;
});

/**
 * The persona the sidebar/UI should render for. For admins with a previewAs
 * cookie set, this returns the previewed persona. Otherwise the true persona.
 *
 * The preview only changes UI navigation — the user's actual capabilities
 * (and any server-side `requireCapability` checks) are untouched, so an
 * admin previewing as a student still has admin access if they navigate to
 * an admin URL directly.
 */
export const getEffectivePersona = cache(async (): Promise<Persona | null> => {
  const truePersona = await getTruePersona();
  if (truePersona !== "admin") return truePersona;
  const store = await cookies();
  const preview = store.get(PREVIEW_COOKIE)?.value;
  if (preview === "faculty" || preview === "student") return preview;
  return "admin";
});
