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

/**
 * Pods where this user is assigned as faculty (`pod_faculty.faculty_user_id`).
 * RLS also allows reading other pods in the cohort when you have `roster.read`;
 * we still filter here so the faculty pod view is not cohort-wide.
 */
export const getFacultyPods = cache(
  async (cohortId: string, facultyUserId: string): Promise<FacultyPod[]> => {
    const sb = await getSupabaseServer();
    const { data: pods } = await sb
      .from("pod_faculty")
      .select("pods!inner(id, name, cohort_id, shared_notes)")
      .eq("faculty_user_id", facultyUserId)
      .eq("pods.cohort_id", cohortId);

    type PodRel = { pods: { id: string; name: string; cohort_id: string; shared_notes: string | null } };
    const list = (pods ?? []) as unknown as PodRel[];

    if (list.length === 0) return [];

    const podIds = list.map((r) => r.pods.id);

    const { data: membersRaw } = await sb
    .from("pod_members")
    .select("pod_id, student_user_id, profiles!inner(full_name, email, avatar_url)")
      .in("pod_id", podIds);

    type MemberRow = {
      pod_id: string;
      student_user_id: string;
      profiles: { full_name: string | null; email: string; avatar_url: string | null };
    };
    const memberRows = (membersRaw ?? []) as unknown as MemberRow[];

    const studentIds = Array.from(new Set(memberRows.map((m) => m.student_user_id)));

    if (studentIds.length === 0) {
      return list.map((r) => ({
        pod_id: r.pods.id,
        pod_name: r.pods.name,
        cohort_id: r.pods.cohort_id,
        shared_notes: r.pods.shared_notes,
        members: [],
      }));
    }

    const [attRes, labsRes, subsRes] = await Promise.all([
      sb
        .from("attendance")
        .select("user_id")
        .eq("cohort_id", cohortId)
        .eq("status", "present")
        .in("user_id", studentIds),
      sb
        .from("lab_progress")
        .select("user_id")
        .eq("cohort_id", cohortId)
        .eq("status", "done")
        .in("user_id", studentIds),
      sb
        .from("submissions")
        .select("user_id, assignments!inner(cohort_id)")
        .eq("status", "submitted")
        .eq("assignments.cohort_id", cohortId)
        .in("user_id", studentIds),
    ]);

    const tally = (rows: Array<{ user_id: string }> | null | undefined): Map<string, number> => {
      const m = new Map<string, number>();
      for (const row of rows ?? []) {
        m.set(row.user_id, (m.get(row.user_id) ?? 0) + 1);
      }
      return m;
    };

    const attCounts = tally((attRes.data ?? []) as unknown as Array<{ user_id: string }>);
    const labsCounts = tally((labsRes.data ?? []) as unknown as Array<{ user_id: string }>);
    const subsCounts = tally((subsRes.data ?? []) as unknown as Array<{ user_id: string }>);

    const membersByPod = new Map<string, FacultyPodMember[]>();
    for (const m of memberRows) {
      const arr = membersByPod.get(m.pod_id) ?? [];
      arr.push({
        user_id: m.student_user_id,
        full_name: m.profiles.full_name,
        email: m.profiles.email,
        avatar_url: m.profiles.avatar_url,
        attendance_count: attCounts.get(m.student_user_id) ?? 0,
        labs_done: labsCounts.get(m.student_user_id) ?? 0,
        pending_submissions: subsCounts.get(m.student_user_id) ?? 0,
      });
      membersByPod.set(m.pod_id, arr);
    }

    return list.map((r) => ({
      pod_id: r.pods.id,
      pod_name: r.pods.name,
      cohort_id: r.pods.cohort_id,
      shared_notes: r.pods.shared_notes,
      members: membersByPod.get(r.pods.id) ?? [],
    }));
  },
);
