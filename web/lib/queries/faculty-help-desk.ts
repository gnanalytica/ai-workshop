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
  /** True when this row is the faculty user's own request (e.g. to platform tech) */
  is_self_request: boolean;
}

const rowSelect =
  "id, user_id, kind, status, message, created_at, escalated_at, escalation_note, claimed_by, profiles:user_id(full_name), claimer:profiles!help_desk_queue_claimed_by_fkey(full_name)";

type Row = {
  id: string;
  user_id: string;
  kind: FacultyHelpDeskEntry["kind"];
  status: FacultyHelpDeskEntry["status"];
  message: string | null;
  created_at: string;
  escalated_at: string | null;
  escalation_note: string | null;
  claimed_by: string | null;
  profiles: { full_name: string | null } | null;
  claimer: { full_name: string | null } | null;
};

function mapRows(
  rows: Row[],
  podNameByStudent: Map<string, string>,
  facultyUserId: string,
): FacultyHelpDeskEntry[] {
  return rows.map((r) => ({
    id: r.id,
    user_id: r.user_id,
    user_name: r.profiles?.full_name ?? null,
    pod_name: r.user_id === facultyUserId ? null : (podNameByStudent.get(r.user_id) ?? null),
    kind: r.kind,
    status: r.status,
    message: r.message,
    claimed_by: r.claimed_by,
    claimed_by_name: r.claimer?.full_name ?? null,
    escalated_at: r.escalated_at,
    escalation_note: r.escalation_note,
    created_at: r.created_at,
    is_self_request: r.user_id === facultyUserId,
  }));
}

/**
 * Help-desk tickets: students in the faculty member's pods, plus the faculty
 * member's own requests in this cohort (e.g. direct-to-tech tickets they filed).
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

    type Mem = { student_user_id: string; pods: { name: string } };
    let memberList: Mem[] = [];
    if (podIds.length > 0) {
      const { data: members } = await sb
        .from("pod_members")
        .select("student_user_id, pods!inner(name)")
        .in("pod_id", podIds);
      memberList = (members ?? []) as unknown as Mem[];
    }
    const studentIds = memberList.map((m) => m.student_user_id);
    const podNameByStudent = new Map(memberList.map((m) => [m.student_user_id, m.pods.name]));

    // Own tickets in cohort (e.g. faculty → tech) — not tied to student pod list
    const { data: myTickets } = await sb
      .from("help_desk_queue")
      .select(rowSelect)
      .eq("cohort_id", cohortId)
      .eq("user_id", facultyUserId)
      .in("status", ["open", "helping", "resolved"])
      .order("created_at", { ascending: false })
      .limit(50);

    const myRows = mapRows((myTickets ?? []) as unknown as Row[], podNameByStudent, facultyUserId);
    if (studentIds.length === 0) {
      return myRows.sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      );
    }

    const { data: studentTickets } = await sb
      .from("help_desk_queue")
      .select(rowSelect)
      .eq("cohort_id", cohortId)
      .in("user_id", studentIds)
      .in("status", ["open", "helping", "resolved"])
      .order("created_at", { ascending: false })
      .limit(50);

    const studentRows = mapRows(
      (studentTickets ?? []) as unknown as Row[],
      podNameByStudent,
      facultyUserId,
    );

    const byId = new Map<string, FacultyHelpDeskEntry>();
    for (const r of myRows) byId.set(r.id, r);
    for (const r of studentRows) byId.set(r.id, r);
    return [...byId.values()].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );
  },
);
