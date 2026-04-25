import { cache } from "react";
import { getSupabaseServer } from "@/lib/supabase/server";

export interface FacultyTodayKpis {
  pendingGrading: number;
  stuckOpen: number;
  attendancePending: number;
  podSize: number;
}

export interface PodMember {
  user_id: string;
  full_name: string | null;
  email: string;
  avatar_url: string | null;
  status: "ok" | "at_risk" | "stuck" | null;
}

export interface PendingSubmission {
  id: string;
  user_id: string;
  user_name: string | null;
  assignment_title: string;
  day_number: number;
  updated_at: string;
}

/** Faculty's primary cohort: first cohort_faculty row. */
export const getFacultyCohort = cache(async () => {
  const sb = await getSupabaseServer();
  const { data } = await sb
    .from("cohort_faculty")
    .select("cohort_id, college_role, cohorts(id, slug, name, status, starts_on, ends_on)")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (!data) return null;
  return {
    cohort: (data as unknown as {
      cohorts: { id: string; slug: string; name: string; status: "draft"|"live"|"archived"; starts_on: string; ends_on: string };
    }).cohorts,
    college_role: (data as unknown as { college_role: "support" | "executive" }).college_role,
  };
});

export const getFacultyTodayKpis = cache(async (cohortId: string): Promise<FacultyTodayKpis> => {
  const sb = await getSupabaseServer();
  const [grading, stuck, podMembers] = await Promise.all([
    sb
      .from("submissions")
      .select("id, assignments!inner(cohort_id)", { count: "exact", head: true })
      .eq("status", "submitted")
      .eq("assignments.cohort_id", cohortId),
    sb.from("stuck_queue").select("id", { count: "exact", head: true }).eq("cohort_id", cohortId).in("status", ["open", "helping"]),
    sb.from("pod_members").select("student_user_id, pod_faculty!inner(faculty_user_id, pods!inner(cohort_id))", { count: "exact", head: true }).eq("pod_faculty.pods.cohort_id", cohortId),
  ]);
  return {
    pendingGrading: grading.count ?? 0,
    stuckOpen: stuck.count ?? 0,
    attendancePending: 0,
    podSize: podMembers.count ?? 0,
  };
});

export const listPendingSubmissions = cache(async (cohortId: string): Promise<PendingSubmission[]> => {
  const sb = await getSupabaseServer();
  const { data } = await sb
    .from("submissions")
    .select("id, user_id, updated_at, assignments!inner(title, day_number, cohort_id), profiles:user_id(full_name)")
    .eq("status", "submitted")
    .eq("assignments.cohort_id", cohortId)
    .order("updated_at", { ascending: false })
    .limit(25);
  return ((data ?? []) as unknown as Array<{
    id: string; user_id: string; updated_at: string;
    assignments: { title: string; day_number: number };
    profiles: { full_name: string | null } | null;
  }>).map((r) => ({
    id: r.id,
    user_id: r.user_id,
    user_name: r.profiles?.full_name ?? null,
    assignment_title: r.assignments.title,
    day_number: r.assignments.day_number,
    updated_at: r.updated_at,
  }));
});

export interface StuckEntry {
  id: string;
  user_id: string;
  user_name: string | null;
  kind: "content" | "tech" | "team" | "other";
  status: "open" | "helping" | "resolved" | "cancelled";
  message: string | null;
  claimed_by_name: string | null;
  created_at: string;
}

export const listStuckOpen = cache(async (cohortId: string): Promise<StuckEntry[]> => {
  const sb = await getSupabaseServer();
  const { data } = await sb
    .from("stuck_queue")
    .select(
      "id, user_id, kind, status, message, created_at, profiles:user_id(full_name), claimer:profiles!stuck_queue_claimed_by_fkey(full_name)",
    )
    .eq("cohort_id", cohortId)
    .in("status", ["open", "helping"])
    .order("created_at", { ascending: true });
  return ((data ?? []) as unknown as Array<{
    id: string; user_id: string; kind: StuckEntry["kind"]; status: StuckEntry["status"];
    message: string | null; created_at: string;
    profiles: { full_name: string | null } | null;
    claimer: { full_name: string | null } | null;
  }>).map((r) => ({
    id: r.id,
    user_id: r.user_id,
    user_name: r.profiles?.full_name ?? null,
    kind: r.kind,
    status: r.status,
    message: r.message,
    claimed_by_name: r.claimer?.full_name ?? null,
    created_at: r.created_at,
  }));
});
