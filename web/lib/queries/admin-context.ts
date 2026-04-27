import { cache } from "react";
import { getSupabaseServer } from "@/lib/supabase/server";

export interface AdminCohortRef {
  id: string;
  slug: string;
  name: string;
  starts_on: string;
  ends_on: string;
  status: string;
}

export const getAdminCohort = cache(async (): Promise<AdminCohortRef | null> => {
  const sb = await getSupabaseServer();
  const { data: live } = await sb
    .from("cohorts")
    .select("id, slug, name, starts_on, ends_on, status")
    .eq("status", "live")
    .order("starts_on", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (live) return live as AdminCohortRef;

  const { data } = await sb
    .from("cohorts")
    .select("id, slug, name, starts_on, ends_on, status")
    .order("starts_on", { ascending: false })
    .limit(1)
    .maybeSingle();
  return (data as AdminCohortRef | null) ?? null;
});

export const getAdminCohortById = cache(
  async (cohortId: string): Promise<AdminCohortRef | null> => {
    if (!/^[0-9a-f-]{36}$/i.test(cohortId)) return null;
    const sb = await getSupabaseServer();
    const { data } = await sb
      .from("cohorts")
      .select("id, slug, name, starts_on, ends_on, status")
      .eq("id", cohortId)
      .maybeSingle();
    return (data as AdminCohortRef | null) ?? null;
  },
);

export const listAdminCohorts = cache(async (): Promise<AdminCohortRef[]> => {
  const sb = await getSupabaseServer();
  const { data } = await sb
    .from("cohorts")
    .select("id, slug, name, starts_on, ends_on, status")
    .order("starts_on", { ascending: false });
  return (data ?? []) as AdminCohortRef[];
});
