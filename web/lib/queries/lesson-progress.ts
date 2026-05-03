import { cache } from "react";
import { getSupabaseServer } from "@/lib/supabase/server";

export interface DayProgress {
  /** True if the user has already submitted day_feedback for this cohort/day. */
  dayFeedbackSubmitted: boolean;
}

const EMPTY: DayProgress = { dayFeedbackSubmitted: false };

export const getDayProgress = cache(
  async (cohortId: string, dayNumber: number): Promise<DayProgress> => {
    const sb = await getSupabaseServer();
    const { data: u } = await sb.auth.getUser();
    const uid = u.user?.id;
    if (!uid) return EMPTY;

    const { data } = await sb
      .from("day_feedback")
      .select("user_id")
      .eq("user_id", uid)
      .eq("cohort_id", cohortId)
      .eq("day_number", dayNumber)
      .maybeSingle();

    return { dayFeedbackSubmitted: !!data };
  },
);
