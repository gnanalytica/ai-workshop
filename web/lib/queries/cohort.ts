import { cache } from "react";
import { getSupabaseServer } from "@/lib/supabase/server";
import { getSupabaseService } from "@/lib/supabase/service";
import { getFacultyCohort } from "@/lib/queries/faculty";
import { getPreviewUserId } from "@/lib/auth/persona";
import { workingDayNumber } from "@/lib/calendar";
import { listCohortDaysCached, getCohortDayCached } from "@/lib/cache/cohort";

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
  meet_link: string | null;
  notes: string | null;
  capstone_kind: "none" | "spec_review" | "mid_review" | "demo_day";
}

const getRegistrationCohort = cache(async (): Promise<ActiveCohort | null> => {
  const previewUid = await getPreviewUserId();
  const sb = previewUid ? getSupabaseService() : await getSupabaseServer();
  let q = sb
    .from("registrations")
    .select("cohort_id, status, cohorts(id, slug, name, starts_on, ends_on, status)")
    .eq("status", "confirmed")
    .order("created_at", { ascending: false })
    .limit(1);
  if (previewUid) q = q.eq("user_id", previewUid);
  const { data: reg } = await q.maybeSingle();
  if (!reg) return null;
  return ((reg as unknown as { cohorts: ActiveCohort }).cohorts ?? null) as ActiveCohort | null;
});

async function getLiveCohortFallback(): Promise<ActiveCohort | null> {
  const sb = await getSupabaseServer();
  const { data } = await sb
    .from("cohorts")
    .select("id, slug, name, starts_on, ends_on, status")
    .eq("status", "live")
    .order("starts_on", { ascending: false })
    .limit(1)
    .maybeSingle();
  return (data ?? null) as ActiveCohort | null;
}

/** The current user's primary cohort: confirmed registration, most recent. */
export const getMyCurrentCohort = cache(async (): Promise<ActiveCohort | null> => {
  const fromReg = await getRegistrationCohort();
  if (fromReg) return fromReg;
  return getLiveCohortFallback();
});

/**
 * Cohort for lesson/day pages. Confirmed students get full interactivity; faculty
 * (no registration, assigned in cohort) get read-only curriculum; other users
 * keep the same fallback as getMyCurrentCohort with full interactivity.
 */
export const getLessonCohort = cache(
  async (): Promise<{ cohort: ActiveCohort; readOnly: boolean } | null> => {
    const fromReg = await getRegistrationCohort();
    if (fromReg) return { cohort: fromReg, readOnly: false };
    const f = await getFacultyCohort();
    if (f) return { cohort: f.cohort, readOnly: true };
    const fallback = await getLiveCohortFallback();
    if (fallback) return { cohort: fallback, readOnly: false };
    return null;
  },
);

// Delegated to cross-request cache (5-min TTL, invalidated by schedule writes).
// React `cache` still wraps the call so repeat hits within one render are free.
export const listCohortDays = cache(
  (cohortId: string): Promise<CohortDay[]> =>
    listCohortDaysCached(cohortId) as Promise<CohortDay[]>,
);

export const getCohortDay = cache(
  (cohortId: string, dayNumber: number): Promise<CohortDay | null> =>
    getCohortDayCached(cohortId, dayNumber) as Promise<CohortDay | null>,
);

/**
 * Today's working day_number relative to cohort start (Mon–Fri only),
 * clamped to [1, 30]. On weekends, returns the most recent weekday's number.
 */
export function todayDayNumber(cohort: ActiveCohort, today = new Date()): number {
  return Math.min(30, workingDayNumber(cohort.starts_on, today));
}
