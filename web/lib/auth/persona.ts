import { cache } from "react";
import { cookies } from "next/headers";
import { getSession } from "@/lib/auth/session";
import { getSupabaseService } from "@/lib/supabase/service";

export type Persona = "admin" | "faculty" | "student";

export const PREVIEW_COOKIE = "previewAs";
export const PREVIEW_COHORT_COOKIE = "previewCohortId";
export const PREVIEW_USER_COOKIE = "previewUserId";

const STAFF_ADMIN_ROLES = new Set(["admin", "trainer", "tech_support"]);

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

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

/**
 * UUID of the cohort an admin is previewing faculty UI against. Only honored
 * when the caller is a true admin AND the effective persona is "faculty".
 * Returns null otherwise. A non-admin caller cannot bypass anything via this
 * cookie — fail-closed.
 */
export const getPreviewCohortId = cache(async (): Promise<string | null> => {
  if ((await getTruePersona()) !== "admin") return null;
  if ((await getEffectivePersona()) !== "faculty") return null;
  const store = await cookies();
  const v = store.get(PREVIEW_COHORT_COOKIE)?.value ?? null;
  if (!v || !UUID_RE.test(v)) return null;
  // Fail-closed: if the cohort doesn't exist, treat as null.
  const svc = getSupabaseService();
  const { data } = await svc.from("cohorts").select("id").eq("id", v).maybeSingle();
  return data ? v : null;
});

/**
 * UUID of the student an admin is previewing student UI as. Only honored
 * when the caller is a true admin AND the effective persona is "student".
 */
export const getPreviewUserId = cache(async (): Promise<string | null> => {
  if ((await getTruePersona()) !== "admin") return null;
  if ((await getEffectivePersona()) !== "student") return null;
  const store = await cookies();
  const v = store.get(PREVIEW_USER_COOKIE)?.value ?? null;
  if (!v || !UUID_RE.test(v)) return null;
  // Fail-closed: if the user doesn't exist, treat as null.
  const svc = getSupabaseService();
  const { data } = await svc.from("profiles").select("id").eq("id", v).maybeSingle();
  return data ? v : null;
});

/**
 * The user id that READ-ONLY student-facing queries should resolve against.
 * When an admin is previewing as a student with a target user set, returns
 * that target user. Otherwise returns the real session user's id.
 *
 * IMPORTANT: NEVER call this from server actions / write paths (submit,
 * post, vote, etc.). Writes always go as the real user. This is a read-scope
 * affordance only.
 */
export const getEffectiveUserId = cache(async (): Promise<string | null> => {
  const preview = await getPreviewUserId();
  if (preview) return preview;
  const u = await getSession();
  return u?.id ?? null;
});
