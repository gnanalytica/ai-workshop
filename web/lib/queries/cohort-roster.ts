import { cache } from "react";
import { getSupabaseServer } from "@/lib/supabase/server";

export interface PodWithRoster {
  pod_id: string;
  name: string;
  faculty_names: string[];
  is_my_pod: boolean;
  members: { user_id: string; full_name: string | null }[];
}

export interface UnassignedStudent {
  user_id: string;
  full_name: string | null;
}

export const getCohortPodRoster = cache(
  async (
    cohortId: string,
    myUserId: string,
  ): Promise<{ pods: PodWithRoster[]; unassigned: UnassignedStudent[] }> => {
    const sb = await getSupabaseServer();
    const [{ data: pods }, { data: regs }] = await Promise.all([
      sb
        .from("pods")
        .select(
          "id, name, pod_faculty(faculty_user_id, profiles:faculty_user_id(full_name)), pod_members(student_user_id, profiles:student_user_id(full_name))",
        )
        .eq("cohort_id", cohortId)
        .order("name"),
      sb
        .from("registrations")
        .select("user_id, profiles!inner(full_name)")
        .eq("cohort_id", cohortId)
        .eq("status", "confirmed"),
    ]);

    type PodRow = {
      id: string; name: string;
      pod_faculty: Array<{ faculty_user_id: string; profiles: { full_name: string | null } | null }>;
      pod_members: Array<{ student_user_id: string; profiles: { full_name: string | null } | null }>;
    };
    const podList = ((pods ?? []) as unknown as PodRow[]).map((p) => ({
      pod_id: p.id,
      name: p.name,
      faculty_names: p.pod_faculty.map((f) => f.profiles?.full_name).filter((n): n is string => !!n),
      is_my_pod: p.pod_faculty.some((f) => f.faculty_user_id === myUserId),
      members: p.pod_members.map((m) => ({
        user_id: m.student_user_id,
        full_name: m.profiles?.full_name ?? null,
      })),
    }));

    const assigned = new Set(podList.flatMap((p) => p.members.map((m) => m.user_id)));
    const unassigned = ((regs ?? []) as unknown as Array<{
      user_id: string;
      profiles: { full_name: string | null };
    }>)
      .filter((r) => !assigned.has(r.user_id))
      .map((r) => ({ user_id: r.user_id, full_name: r.profiles.full_name }));

    return { pods: podList, unassigned };
  },
);
