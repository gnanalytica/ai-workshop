import { cache } from "react";
import { getSupabaseServer } from "@/lib/supabase/server";
import { getPreviewUserId } from "@/lib/auth/persona";

export interface DashboardKpis {
  daysComplete: number;
  attendanceCount: number;
  pendingAssignments: number;
}

/**
 * Single-RPC dashboard counts (rpc_dashboard_kpis, migration 0076). The
 * RPC enforces "only admins may target a different user" internally, so
 * we no longer need a service-role escape hatch for previewing.
 */
export const getDashboardKpis = cache(async (cohortId: string): Promise<DashboardKpis> => {
  const previewUid = await getPreviewUserId();
  const sb = await getSupabaseServer();
  const { data, error } = await (sb.rpc as unknown as (
    fn: string,
    args: Record<string, unknown>,
  ) => Promise<{
    data:
      | Array<{ days_complete: number; attendance_count: number; pending_assignments: number }>
      | null;
    error: { message: string } | null;
  }>)("rpc_dashboard_kpis", { p_cohort: cohortId, p_user: previewUid ?? null });
  const row = error || !data ? undefined : data[0];
  if (!row) return { daysComplete: 0, attendanceCount: 0, pendingAssignments: 0 };
  return {
    daysComplete: row.days_complete ?? 0,
    attendanceCount: row.attendance_count ?? 0,
    pendingAssignments: row.pending_assignments ?? 0,
  };
});
