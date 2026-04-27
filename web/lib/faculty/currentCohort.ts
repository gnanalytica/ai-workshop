import { cache } from "react";
import { cookies } from "next/headers";
import { getSupabaseServer } from "@/lib/supabase/server";

export interface FacultyCohort {
  id: string;
  slug: string;
  name: string;
  status: "draft" | "live" | "archived";
  starts_on: string;
  ends_on: string;
  college_role: "support" | "executive";
}

const COOKIE = "currentCohort";

/**
 * All cohorts the current user is faculty in, most recent first. RLS-scoped:
 * a non-faculty user gets [].
 */
export const listMyFacultyCohorts = cache(async (): Promise<FacultyCohort[]> => {
  const sb = await getSupabaseServer();
  const { data } = await sb
    .from("cohort_faculty")
    .select("college_role, cohorts(id, slug, name, status, starts_on, ends_on)")
    .order("created_at", { ascending: false });
  const seen = new Set<string>();
  return (data ?? []).flatMap((row) => {
    const c = (row as unknown as { cohorts: FacultyCohort | null }).cohorts;
    if (!c || seen.has(c.id)) return [];
    seen.add(c.id);
    return [{ ...c, college_role: (row as { college_role: "support" | "executive" }).college_role }];
  });
});

/**
 * The faculty user's *current* cohort: cookie value if it's still a valid
 * assignment, otherwise the most recent. Null if the user is not faculty.
 */
export const getCurrentFacultyCohort = cache(async (): Promise<FacultyCohort | null> => {
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
