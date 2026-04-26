import { cache } from "react";
import { getSupabaseServer } from "@/lib/supabase/server";

export interface CohortContext {
  id: string;
  name: string;
  slug: string;
  status: string;
}

/**
 * Cohort context for routes that span admin + faculty (e.g. /pods). Resolves in
 * this order:
 *   1. Most recent live cohort the caller can see (admins/trainers will see all
 *      cohorts; faculty/students see only their own through RLS).
 *   2. Most recent draft/archived cohort otherwise.
 * Returns null if the caller has access to no cohort.
 */
export const getUserCohort = cache(async (): Promise<CohortContext | null> => {
  const sb = await getSupabaseServer();
  const { data: live } = await sb
    .from("cohorts")
    .select("id, slug, name, status, starts_on")
    .eq("status", "live")
    .order("starts_on", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (live) return live as CohortContext;

  const { data } = await sb
    .from("cohorts")
    .select("id, slug, name, status, starts_on")
    .order("starts_on", { ascending: false })
    .limit(1)
    .maybeSingle();
  return (data as CohortContext | null) ?? null;
});
