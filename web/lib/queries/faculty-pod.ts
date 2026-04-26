import { cache } from "react";
import { getSupabaseServer } from "@/lib/supabase/server";

export interface FacultyPodMember {
  user_id: string;
  full_name: string | null;
  email: string;
  avatar_url: string | null;
  attendance_count: number;
  labs_done: number;
  pending_submissions: number;
}

export interface FacultyPod {
  pod_id: string;
  pod_name: string;
  cohort_id: string;
  shared_notes: string | null;
  members: FacultyPodMember[];
}

export const getFacultyPods = cache(async (cohortId: string): Promise<FacultyPod[]> => {
  const sb = await getSupabaseServer();
  const { data: pods } = await sb
    .from("pod_faculty")
    .select("pods!inner(id, name, cohort_id, mentor_note)")
    .eq("pods.cohort_id", cohortId);

  type PodRel = { pods: { id: string; name: string; cohort_id: string; mentor_note: string | null } };
  const list = (pods ?? []) as unknown as PodRel[];

  const out: FacultyPod[] = [];
  for (const r of list) {
    const podId = r.pods.id;
    const { data: members } = await sb
      .from("pod_members")
      .select("student_user_id, profiles!inner(full_name, email, avatar_url)")
      .eq("pod_id", podId);
    const memberIds = ((members ?? []) as unknown as Array<{
      student_user_id: string;
      profiles: { full_name: string | null; email: string; avatar_url: string | null };
    }>).map((m) => ({ ...m }));

    const memberData: FacultyPodMember[] = await Promise.all(
      memberIds.map(async (m) => {
        const [att, labs, subs] = await Promise.all([
          sb.from("attendance").select("user_id", { count: "exact", head: true }).eq("user_id", m.student_user_id).eq("cohort_id", cohortId).eq("status", "present"),
          sb.from("lab_progress").select("user_id", { count: "exact", head: true }).eq("user_id", m.student_user_id).eq("cohort_id", cohortId).eq("status", "done"),
          sb.from("submissions").select("id, assignments!inner(cohort_id)", { count: "exact", head: true }).eq("user_id", m.student_user_id).eq("status", "submitted").eq("assignments.cohort_id", cohortId),
        ]);
        return {
          user_id: m.student_user_id,
          full_name: m.profiles.full_name,
          email: m.profiles.email,
          avatar_url: m.profiles.avatar_url,
          attendance_count: att.count ?? 0,
          labs_done: labs.count ?? 0,
          pending_submissions: subs.count ?? 0,
        };
      }),
    );

    out.push({
      pod_id: podId,
      pod_name: r.pods.name,
      cohort_id: r.pods.cohort_id,
      shared_notes: r.pods.mentor_note,
      members: memberData,
    });
  }
  return out;
});
