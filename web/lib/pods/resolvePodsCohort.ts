import { cache } from "react";
import { getSupabaseServer } from "@/lib/supabase/server";
import { getFacultyCohort } from "@/lib/queries/faculty";
import { getUserCohort, type CohortContext } from "@/lib/queries/user-cohort";

const uuidRe = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * Cohort for `/pods` and `/pods/[id]`: optional `?cohort=` (admin deep link),
 * else the faculty member's current cohort, else fallback: pick the first
 * cohort the user can see.
 */
export const resolvePodsPageCohort = cache(
  async (cohortIdParam?: string | null): Promise<CohortContext | null> => {
    const sb = await getSupabaseServer();
    if (cohortIdParam && uuidRe.test(cohortIdParam)) {
      const { data } = await sb
        .from("cohorts")
        .select("id, slug, name, status")
        .eq("id", cohortIdParam)
        .maybeSingle();
      if (data) return data as CohortContext;
    }
    const f = await getFacultyCohort();
    if (f?.cohort) {
      return {
        id: f.cohort.id,
        slug: f.cohort.slug,
        name: f.cohort.name,
        status: f.cohort.status,
      };
    }
    return getUserCohort();
  },
);
