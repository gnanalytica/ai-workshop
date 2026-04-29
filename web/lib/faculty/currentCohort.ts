import { cache } from "react";
import { cookies } from "next/headers";
import { getSupabaseServer } from "@/lib/supabase/server";
import { getSupabaseService } from "@/lib/supabase/service";
import { getPreviewCohortId, getTruePersona } from "@/lib/auth/persona";
import { getActiveSandboxCohortId } from "@/lib/sandbox/active";

export interface FacultyCohort {
  id: string;
  slug: string;
  name: string;
  status: "draft" | "live" | "archived";
  starts_on: string;
  ends_on: string;
}

const COOKIE = "currentCohort";

/**
 * All cohorts the current user is faculty in, most recent first. RLS-scoped:
 * a non-faculty user gets [].
 *
 * Special case: when an admin is previewing as faculty, returns ALL cohorts
 * since admins already have full caps cohort-wide.
 */
export const listMyFacultyCohorts = cache(async (): Promise<FacultyCohort[]> => {
  const truePersona = await getTruePersona();
  if (truePersona === "admin") {
    const svc = getSupabaseService();
    const { data } = await svc
      .from("cohorts")
      .select("id, slug, name, status, starts_on, ends_on")
      .order("starts_on", { ascending: false });
    return (data ?? []) as FacultyCohort[];
  }

  const sb = await getSupabaseServer();
  const { data } = await sb
    .from("cohort_faculty")
    .select("cohorts(id, slug, name, status, starts_on, ends_on)")
    .order("created_at", { ascending: false });
  const seen = new Set<string>();
  return (data ?? []).flatMap((row) => {
    const c = (row as unknown as { cohorts: FacultyCohort | null }).cohorts;
    if (!c || seen.has(c.id)) return [];
    seen.add(c.id);
    return [c];
  });
});

/**
 * The faculty user's *current* cohort.
 *   - If admin previewing faculty with a `previewCohortId` set, returns that
 *     cohort.
 *   - Otherwise, cookie-pinned assignment → most recent assignment.
 *   - Null if the user is not faculty (and not admin previewing).
 */
export const getCurrentFacultyCohort = cache(async (): Promise<FacultyCohort | null> => {
  const sandboxId = await getActiveSandboxCohortId();
  if (sandboxId) {
    const svc = getSupabaseService();
    const { data } = await svc
      .from("cohorts")
      .select("id, slug, name, status, starts_on, ends_on")
      .eq("id", sandboxId)
      .maybeSingle();
    if (data) return data as FacultyCohort;
  }

  const previewCohortId = await getPreviewCohortId();
  if (previewCohortId) {
    const svc = getSupabaseService();
    const { data } = await svc
      .from("cohorts")
      .select("id, slug, name, status, starts_on, ends_on")
      .eq("id", previewCohortId)
      .maybeSingle();
    if (data) return data as FacultyCohort;
  }

  const all = await listMyFacultyCohorts();
  if (all.length === 0) return null;
  const store = await cookies();
  const pinned = store.get(COOKIE)?.value;
  if (pinned) {
    const match = all.find((c) => c.id === pinned);
    if (match) return match;
  }
  return all[0] ?? null;
});

export const FACULTY_COHORT_COOKIE = COOKIE;
