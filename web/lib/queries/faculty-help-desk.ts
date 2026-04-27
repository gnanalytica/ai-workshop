import { cache } from "react";
import { getSupabaseServer } from "@/lib/supabase/server";

export interface FacultyHelpDeskEntry {
  id: string;
  user_id: string;
  user_name: string | null;
  pod_name: string | null;
  kind: "content" | "tech" | "team" | "other";
  status: "open" | "helping" | "resolved" | "cancelled";
  message: string | null;
  claimed_by: string | null;
  claimed_by_name: string | null;
  escalated_at: string | null;
  escalation_note: string | null;
  created_at: string;
}

/**
 * Help-desk tickets from students in pods this faculty member belongs to.
 * Falls back to all cohort entries when the faculty has no pods (rare).
 */
export const listFacultyHelpDesk = cache(
  async (cohortId: string, facultyUserId: string): Promise<FacultyHelpDeskEntry[]> => {
    const sb = await getSupabaseServer();
    const { data: myPods } = await sb
      .from("pod_faculty")
      .select("pod_id, pods!inner(cohort_id)")
      .eq("faculty_user_id", facultyUserId)
      .eq("pods.cohort_id", cohortId);
    const podIds = ((myPods ?? []) as unknown as Array<{ pod_id: string }>).map((r) => r.pod_id);
    if (podIds.length === 0) return [];

    const { data: members } = await sb
      .from("pod_members")
      .select("student_user_id, pods!inner(name)")
      .in("pod_id", podIds);
    type Mem = { student_user_id: string; pods: { name: string } };
    const memberList = ((members ?? []) as unknown as Mem[]);
    const studentIds = memberList.map((m) => m.student_user_id);
    const podNameByStudent = new Map(memberList.map((m) => [m.student_user_id, m.pods.name]));
    if (studentIds.length === 0) return [];

    const { data } = await sb
      .from("help_desk_queue")
      .select(
        "id, user_id, kind, status, message, created_at, escalated_at, escalation_note, claimed_by, profiles:user_id(full_name), claimer:profiles!help_desk_queue_claimed_by_fkey(full_name)",
      )
      .eq("cohort_id", cohortId)
      .in("user_id", studentIds)
      .in("status", ["open", "helping", "resolved"])
      .order("created_at", { ascending: false })
      .limit(50);

    return ((data ?? []) as unknown as Array<{
      id: string; user_id: string; kind: FacultyHelpDeskEntry["kind"]; status: FacultyHelpDeskEntry["status"];
      message: string | null; created_at: string;
      escalated_at: string | null; escalation_note: string | null;
      claimed_by: string | null;
      profiles: { full_name: string | null } | null;
      claimer: { full_name: string | null } | null;
    }>).map((r) => ({
      id: r.id,
      user_id: r.user_id,
      user_name: r.profiles?.full_name ?? null,
      pod_name: podNameByStudent.get(r.user_id) ?? null,
      kind: r.kind,
      status: r.status,
      message: r.message,
      claimed_by: r.claimed_by,
      claimed_by_name: r.claimer?.full_name ?? null,
      escalated_at: r.escalated_at,
      escalation_note: r.escalation_note,
      created_at: r.created_at,
    }));
  },
);
