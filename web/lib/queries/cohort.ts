import { cache } from "react";
import { getSupabaseServer } from "@/lib/supabase/server";

export interface ActiveCohort {
  id: string;
  slug: string;
  name: string;
  starts_on: string;
  ends_on: string;
  status: "draft" | "live" | "archived";
}

export interface CohortDay {
  cohort_id: string;
  day_number: number;
  title: string;
  is_unlocked: boolean;
  live_session_at: string | null;
  capstone_kind: "none" | "spec_review" | "mid_review" | "demo_day";
}

/** The current user's primary cohort: confirmed registration, most recent. */
export const getMyCurrentCohort = cache(async (): Promise<ActiveCohort | null> => {
  const sb = await getSupabaseServer();
  const { data: reg } = await sb
    .from("registrations")
    .select("cohort_id, status, cohorts(id, slug, name, starts_on, ends_on, status)")
    .eq("status", "confirmed")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (!reg) {
    // Fallback: any live cohort the user has access to read.
    const { data } = await sb
      .from("cohorts")
      .select("id, slug, name, starts_on, ends_on, status")
      .eq("status", "live")
      .order("starts_on", { ascending: false })
      .limit(1)
      .maybeSingle();
    return (data ?? null) as ActiveCohort | null;
  }
  return ((reg as unknown as { cohorts: ActiveCohort }).cohorts ?? null) as ActiveCohort | null;
});

export const listCohortDays = cache(async (cohortId: string): Promise<CohortDay[]> => {
  const sb = await getSupabaseServer();
  const { data } = await sb
    .from("cohort_days")
    .select("cohort_id, day_number, title, is_unlocked, live_session_at, capstone_kind")
    .eq("cohort_id", cohortId)
    .order("day_number");
  return (data ?? []) as CohortDay[];
});

export const getCohortDay = cache(
  async (cohortId: string, dayNumber: number): Promise<CohortDay | null> => {
    const sb = await getSupabaseServer();
    const { data } = await sb
      .from("cohort_days")
      .select("cohort_id, day_number, title, is_unlocked, live_session_at, capstone_kind")
      .eq("cohort_id", cohortId)
      .eq("day_number", dayNumber)
      .maybeSingle();
    return (data ?? null) as CohortDay | null;
  },
);

/** Today's day_number relative to cohort start, clamped to [1, 30]. */
export function todayDayNumber(cohort: ActiveCohort, today = new Date()): number {
  const start = new Date(cohort.starts_on);
  const diff = Math.floor(
    (today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24),
  );
  return Math.max(1, Math.min(30, diff + 1));
}
