import { cache } from "react";
import { getSupabaseServer } from "@/lib/supabase/server";
import { getSupabaseService } from "@/lib/supabase/service";
import { getPreviewUserId } from "@/lib/auth/persona";

export interface DashboardKpis {
  daysComplete: number;
  attendanceCount: number;
  pendingAssignments: number;
}

export const getDashboardKpis = cache(async (cohortId: string): Promise<DashboardKpis> => {
  const previewUid = await getPreviewUserId();
  // When admin is previewing a student, RLS on the server client wouldn't
  // scope to that student — switch to the service role and filter explicitly.
  const sb = previewUid ? getSupabaseService() : await getSupabaseServer();

  const [labs, attendance, subs] = await Promise.all([
    (() => {
      let q = sb
        .from("lab_progress")
        .select("day_number", { count: "exact", head: false })
        .eq("cohort_id", cohortId)
        .eq("status", "done");
      if (previewUid) q = q.eq("user_id", previewUid);
      return q;
    })(),
    (() => {
      let q = sb
        .from("attendance")
        .select("day_number", { count: "exact", head: false })
        .eq("cohort_id", cohortId)
        .eq("status", "present");
      if (previewUid) q = q.eq("user_id", previewUid);
      return q;
    })(),
    (() => {
      let q = sb
        .from("submissions")
        .select("id, assignments!inner(cohort_id)", { count: "exact", head: false })
        .eq("status", "draft");
      if (previewUid) {
        q = q.eq("user_id", previewUid).eq("assignments.cohort_id", cohortId);
      }
      return q;
    })(),
  ]);
  const daysComplete = new Set((labs.data ?? []).map((r: { day_number: number }) => r.day_number)).size;
  return {
    daysComplete,
    attendanceCount: attendance.count ?? 0,
    pendingAssignments: subs.count ?? 0,
  };
});
