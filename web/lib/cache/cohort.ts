import { unstable_cache } from "next/cache";
import { getSupabaseService } from "@/lib/supabase/service";

/**
 * Cross-request cache for cohort_days and cohorts metadata.
 *
 * These rows change rarely (admin schedule edits, meet-link updates, day
 * unlocks) but are read on virtually every authed page load. Caching them at
 * the Next.js data layer cuts ~40% of Supabase queries during the workshop.
 *
 * Reads use the service role client — RLS-bypassing is fine because:
 *   - cohort metadata (name, dates) is non-sensitive and shown to anyone
 *     who lands on the dashboard;
 *   - cohort_days fields (title, meet_link, is_unlocked) are visible to
 *     enrolled students and the calling code already gates on the cohort
 *     id, which only authorized callers possess.
 *
 * Writes elsewhere (lib/actions/schedule.ts) call revalidateTag("cohort-days")
 * or revalidateTag("cohorts") to invalidate immediately.
 */

const TTL = 300; // 5 minutes — bounded staleness for meet-link edits

export interface CohortDayRow {
  cohort_id: string;
  day_number: number;
  title: string;
  is_unlocked: boolean;
  live_session_at: string | null;
  meet_link: string | null;
  notes: string | null;
  capstone_kind: "none" | "spec_review" | "mid_review" | "demo_day";
}

export interface CohortRow {
  id: string;
  slug: string;
  name: string;
  starts_on: string;
  ends_on: string;
  status: "draft" | "live" | "archived";
}

export const listCohortDaysCached = unstable_cache(
  async (cohortId: string): Promise<CohortDayRow[]> => {
    const svc = getSupabaseService();
    const { data } = await svc
      .from("cohort_days")
      .select(
        "cohort_id, day_number, title, is_unlocked, live_session_at, meet_link, notes, capstone_kind",
      )
      .eq("cohort_id", cohortId)
      .order("day_number");
    return (data ?? []) as CohortDayRow[];
  },
  ["cohort-days-list"],
  { revalidate: TTL, tags: ["cohort-days"] },
);

export const getCohortDayCached = unstable_cache(
  async (cohortId: string, dayNumber: number): Promise<CohortDayRow | null> => {
    const svc = getSupabaseService();
    const { data } = await svc
      .from("cohort_days")
      .select(
        "cohort_id, day_number, title, is_unlocked, live_session_at, meet_link, notes, capstone_kind",
      )
      .eq("cohort_id", cohortId)
      .eq("day_number", dayNumber)
      .maybeSingle();
    return (data ?? null) as CohortDayRow | null;
  },
  ["cohort-day"],
  { revalidate: TTL, tags: ["cohort-days"] },
);

export const getCohortByIdCached = unstable_cache(
  async (cohortId: string): Promise<CohortRow | null> => {
    const svc = getSupabaseService();
    const { data } = await svc
      .from("cohorts")
      .select("id, slug, name, starts_on, ends_on, status")
      .eq("id", cohortId)
      .maybeSingle();
    return (data ?? null) as CohortRow | null;
  },
  ["cohort-by-id"],
  { revalidate: TTL, tags: ["cohorts"] },
);
