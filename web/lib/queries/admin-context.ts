import { cache } from "react";
import { getSupabaseServer } from "@/lib/supabase/server";

/**
 * Cohort context for admin pages: prefer the first 'live' cohort the user can
 * see, fallback to the most recent draft. Distinct from the student dashboard
 * which keys off a confirmed registration.
 */
export const getAdminCohort = cache(async () => {
  const sb = await getSupabaseServer();
  const { data: live } = await sb
    .from("cohorts")
    .select("id, slug, name, starts_on, ends_on, status")
    .eq("status", "live")
    .order("starts_on", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (live) return live as { id: string; slug: string; name: string; starts_on: string; ends_on: string; status: string };

  const { data } = await sb
    .from("cohorts")
    .select("id, slug, name, starts_on, ends_on, status")
    .order("starts_on", { ascending: false })
    .limit(1)
    .maybeSingle();
  return data as { id: string; slug: string; name: string; starts_on: string; ends_on: string; status: string } | null;
});
