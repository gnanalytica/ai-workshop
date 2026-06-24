import { cache } from "react";
import { getSupabaseServer } from "@/lib/supabase/server";
import { getEffectiveUserId } from "@/lib/auth/persona";

export interface AssignmentCompletion {
  totalAssignments: number;
  submittedCount: number;
  meetsFiftyPercent: boolean;
}

/**
 * Count total cohort assignments vs. the current user's submitted/graded
 * submissions. Used by the certificate page for the 50% eligibility check.
 */
export const getAssignmentCompletion = cache(
  async (cohortId: string): Promise<AssignmentCompletion> => {
    const sb = await getSupabaseServer();
    const userId = await getEffectiveUserId();

    const [totalRes, submittedRes] = await Promise.all([
      sb
        .from("assignments")
        .select("id", { count: "exact", head: true })
        .eq("cohort_id", cohortId),
      sb
        .from("assignment_submissions")
        .select("id, assignments!inner(cohort_id)", {
          count: "exact",
          head: true,
        })
        .eq("assignments.cohort_id", cohortId)
        .eq("user_id", userId!)
        .in("status", ["submitted", "graded"]),
    ]);

    const totalAssignments = totalRes.count ?? 0;
    const submittedCount = submittedRes.count ?? 0;
    const required = Math.ceil(totalAssignments * 0.5);

    return {
      totalAssignments,
      submittedCount,
      meetsFiftyPercent: submittedCount >= required,
    };
  },
);
