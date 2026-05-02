import { cache } from "react";
import { getSupabaseServer } from "@/lib/supabase/server";

export interface FacultyTodayKpis {
  pendingReview: number;
  helpDeskOpen: number;
  podSize: number;
}

export interface PodMember {
  user_id: string;
  full_name: string | null;
  email: string;
  avatar_url: string | null;
  status: "ok" | "at_risk" | "behind" | null;
}

/** Faculty's *current* cohort — honors the currentCohort cookie set by the
 *  topbar switcher, falling back to the most recent assignment. */
export const getFacultyCohort = cache(async () => {
  const { getCurrentFacultyCohort } = await import("@/lib/faculty/currentCohort");
  const c = await getCurrentFacultyCohort();
  if (!c) return null;
  return {
    cohort: { id: c.id, slug: c.slug, name: c.name, status: c.status, starts_on: c.starts_on, ends_on: c.ends_on },
  };
});

async function listFacultyPodStudentIds(
  cohortId: string,
  facultyUserId: string,
): Promise<string[]> {
  const sb = await getSupabaseServer();
  const { data: myPods } = await sb
    .from("pod_faculty")
    .select("pod_id, pods!inner(cohort_id)")
    .eq("faculty_user_id", facultyUserId)
    .eq("pods.cohort_id", cohortId);
  const podIds = ((myPods ?? []) as Array<{ pod_id: string }>).map((r) => r.pod_id);
  if (podIds.length === 0) return [];

  const { data: members } = await sb
    .from("pod_members")
    .select("student_user_id")
    .in("pod_id", podIds);
  return ((members ?? []) as Array<{ student_user_id: string }>).map((m) => m.student_user_id);
}

export const getFacultyTodayKpis = cache(async (cohortId: string, facultyUserId: string): Promise<FacultyTodayKpis> => {
  const studentIds = await listFacultyPodStudentIds(cohortId, facultyUserId);
  if (studentIds.length === 0) {
    return { pendingReview: 0, helpDeskOpen: 0, podSize: 0 };
  }
  const sb = await getSupabaseServer();
  const [toReview, helpDesk] = await Promise.all([
    sb
      .from("submissions")
      .select("id, assignments!inner(cohort_id)", { count: "exact", head: true })
      .eq("assignments.cohort_id", cohortId)
      .in("user_id", studentIds)
      .or("status.eq.submitted,and(ai_graded.eq.true,human_reviewed_at.is.null)"),
    sb
      .from("help_desk_queue")
      .select("id", { count: "exact", head: true })
      .eq("cohort_id", cohortId)
      .in("user_id", studentIds)
      .in("status", ["open", "helping"]),
  ]);
  return {
    pendingReview: toReview.count ?? 0,
    helpDeskOpen: helpDesk.count ?? 0,
    podSize: studentIds.length,
  };
});

export interface HelpDeskEntry {
  id: string;
  user_id: string;
  user_name: string | null;
  kind: "content" | "tech" | "team" | "other";
  status: "open" | "helping" | "resolved" | "cancelled";
  message: string | null;
  claimed_by_name: string | null;
  created_at: string;
  escalated_at: string | null;
  escalator_name: string | null;
  escalation_note: string | null;
}

export const listHelpDeskOpen = cache(async (cohortId: string, facultyUserId?: string): Promise<HelpDeskEntry[]> => {
  const sb = await getSupabaseServer();
  const studentIds = facultyUserId ? await listFacultyPodStudentIds(cohortId, facultyUserId) : null;
  if (facultyUserId && (!studentIds || studentIds.length === 0)) return [];
  let query = sb
    .from("help_desk_queue")
    .select(
      "id, user_id, kind, status, message, created_at, escalated_at, escalation_note, profiles:user_id(full_name), claimer:profiles!help_desk_queue_claimed_by_fkey(full_name), escalator:profiles!help_desk_queue_escalated_by_fkey(full_name)",
    )
    .eq("cohort_id", cohortId)
    .in("status", ["open", "helping"])
    .order("escalated_at", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: true });
  if (studentIds) query = query.in("user_id", studentIds);
  const { data } = await query;
  return ((data ?? []) as unknown as Array<{
    id: string; user_id: string; kind: HelpDeskEntry["kind"]; status: HelpDeskEntry["status"];
    message: string | null; created_at: string;
    escalated_at: string | null; escalation_note: string | null;
    profiles: { full_name: string | null } | null;
    claimer: { full_name: string | null } | null;
    escalator: { full_name: string | null } | null;
  }>).map((r) => ({
    id: r.id,
    user_id: r.user_id,
    user_name: r.profiles?.full_name ?? null,
    kind: r.kind,
    status: r.status,
    message: r.message,
    claimed_by_name: r.claimer?.full_name ?? null,
    created_at: r.created_at,
    escalated_at: r.escalated_at,
    escalator_name: r.escalator?.full_name ?? null,
    escalation_note: r.escalation_note,
  }));
});
