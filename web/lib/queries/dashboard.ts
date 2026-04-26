import { cache } from "react";
import { getSupabaseServer } from "@/lib/supabase/server";

export interface DashboardKpis {
  daysComplete: number;
  attendanceCount: number;
  pendingAssignments: number;
}

export const getDashboardKpis = cache(async (cohortId: string): Promise<DashboardKpis> => {
  const sb = await getSupabaseServer();
  const [labs, attendance, subs] = await Promise.all([
    sb
      .from("lab_progress")
      .select("day_number", { count: "exact", head: false })
      .eq("cohort_id", cohortId)
      .eq("status", "done"),
    sb
      .from("attendance")
      .select("day_number", { count: "exact", head: false })
      .eq("cohort_id", cohortId)
      .eq("status", "present"),
    sb
      .from("submissions")
      .select("id, assignments!inner(cohort_id)", { count: "exact", head: false })
      .eq("status", "draft"),
  ]);
  const daysComplete = new Set((labs.data ?? []).map((r: { day_number: number }) => r.day_number)).size;
  return {
    daysComplete,
    attendanceCount: attendance.count ?? 0,
    pendingAssignments: subs.count ?? 0,
  };
});
