import { cache } from "react";
import { getSupabaseServer } from "@/lib/supabase/server";

export type LessonPhase = "pre" | "live" | "post" | "extra";

export interface DayProgress {
  /** completedSections[phase] = sorted array of section indices the user has marked complete */
  completedSections: Record<LessonPhase, number[]>;
  /** True if the user has already submitted day_feedback for this cohort/day. */
  dayFeedbackSubmitted: boolean;
}

const EMPTY: DayProgress = {
  completedSections: { pre: [], live: [], post: [], extra: [] },
  dayFeedbackSubmitted: false,
};

export const getDayProgress = cache(
  async (cohortId: string, dayNumber: number): Promise<DayProgress> => {
    const sb = await getSupabaseServer();
    const { data: u } = await sb.auth.getUser();
    const uid = u.user?.id;
    if (!uid) return EMPTY;

    const [progressRes, feedbackRes] = await Promise.all([
      sb
        .from("lesson_section_progress")
        .select("phase, section_index")
        .eq("user_id", uid)
        .eq("cohort_id", cohortId)
        .eq("day_number", dayNumber),
      sb
        .from("day_feedback")
        .select("user_id")
        .eq("user_id", uid)
        .eq("cohort_id", cohortId)
        .eq("day_number", dayNumber)
        .maybeSingle(),
    ]);

    const completedSections: Record<LessonPhase, number[]> = {
      pre: [], live: [], post: [], extra: [],
    };
    for (const row of (progressRes.data ?? []) as Array<{ phase: LessonPhase; section_index: number }>) {
      if (completedSections[row.phase]) {
        completedSections[row.phase].push(row.section_index);
      }
    }
    for (const phase of Object.keys(completedSections) as LessonPhase[]) {
      completedSections[phase].sort((a, b) => a - b);
    }

    return {
      completedSections,
      dayFeedbackSubmitted: !!feedbackRes.data,
    };
  },
);
