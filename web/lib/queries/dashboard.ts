import { cache } from "react";
import { getSupabaseServer } from "@/lib/supabase/server";

export interface DashboardKpis {
  daysComplete: number;
  attendanceCount: number;
  pendingAssignments: number;
  unreadAnnouncements: number;
}

export interface AnnouncementSummary {
  id: string;
  title: string;
  body_md: string;
  created_at: string;
  pinned_at: string | null;
}

export const getDashboardKpis = cache(async (cohortId: string): Promise<DashboardKpis> => {
  const sb = await getSupabaseServer();
  const [labs, attendance, subs, announcements] = await Promise.all([
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
    sb
      .from("announcements")
      .select("id", { count: "exact", head: true })
      .eq("cohort_id", cohortId)
      .is("deleted_at", null),
  ]);
  const daysComplete = new Set((labs.data ?? []).map((r: { day_number: number }) => r.day_number)).size;
  return {
    daysComplete,
    attendanceCount: attendance.count ?? 0,
    pendingAssignments: subs.count ?? 0,
    unreadAnnouncements: announcements.count ?? 0,
  };
});

export const listRecentAnnouncements = cache(
  async (cohortId: string, limit = 5): Promise<AnnouncementSummary[]> => {
    const sb = await getSupabaseServer();
    const { data } = await sb
      .from("announcements")
      .select("id, title, body_md, created_at, pinned_at")
      .eq("cohort_id", cohortId)
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .limit(limit);
    return (data ?? []) as AnnouncementSummary[];
  },
);
