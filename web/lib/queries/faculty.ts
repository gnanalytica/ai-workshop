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
  body: string | null;
  attachments: { name: string; url: string }[];
}

/** Faculty's *current* cohort — honors the currentCohort cookie set by the
 *  topbar switcher, falling back to the most recent assignment. */
export const getFacultyCohort = cache(async () => {
  const { getCurrentFacultyCohort } = await import("@/lib/faculty/currentCohort");
  const c = await getCurrentFacultyCohort();
  if (!c) return null;
  return {
    cohort: { id: c.id, slug: c.slug, name: c.name, status: c.status, starts_on: c.starts_on, ends_on: c.ends_on },
    college_role: c.college_role,
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
    .select(
      "id, user_id, updated_at, body, attachments, assignments!inner(title, day_number, cohort_id), profiles:user_id(full_name)",
    )
    .eq("status", "submitted")
    .eq("assignments.cohort_id", cohortId)
    .order("updated_at", { ascending: false })
    .limit(25);
  return ((data ?? []) as unknown as Array<{
    id: string; user_id: string; updated_at: string;
    body: string | null;
    attachments: { name: string; url: string }[] | null;
    assignments: { title: string; day_number: number } | Array<{ title: string; day_number: number }>;
    profiles: { full_name: string | null } | null;
  }>).map((r) => {
    const a = Array.isArray(r.assignments) ? r.assignments[0] : r.assignments;
    return {
      id: r.id,
      user_id: r.user_id,
      user_name: r.profiles?.full_name ?? null,
      assignment_title: a?.title ?? "",
      day_number: a?.day_number ?? 0,
      updated_at: r.updated_at,
      body: r.body,
      attachments: r.attachments ?? [],
    };
  });
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
