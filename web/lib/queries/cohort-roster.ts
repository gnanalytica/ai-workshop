import { cache } from "react";
import { getSupabaseServer } from "@/lib/supabase/server";

export interface PodFacultyMember {
  user_id: string;
  full_name: string | null;
  college_role: "support" | "executive";
}

export interface CohortFacultyMember {
  user_id: string;
  full_name: string | null;
  college_role: "support" | "executive";
}

export interface PodWithRoster {
  pod_id: string;
  name: string;
  faculty_names: string[];
  faculty: PodFacultyMember[];
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
  ): Promise<{
    pods: PodWithRoster[];
    unassigned: UnassignedStudent[];
    cohortFaculty: CohortFacultyMember[];
  }> => {
    const sb = await getSupabaseServer();
    const [{ data: pods }, { data: regs }, { data: cohortFacRows }] = await Promise.all([
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
      sb
        .from("cohort_faculty")
        .select("user_id, college_role, profiles!inner(full_name)")
        .eq("cohort_id", cohortId),
    ]);

    type CohortFacRow = {
      user_id: string;
      college_role: "support" | "executive";
      profiles: { full_name: string | null };
    };
    const cohortFacultyList: CohortFacultyMember[] = (
      (cohortFacRows ?? []) as unknown as CohortFacRow[]
    ).map((r) => ({
      user_id: r.user_id,
      full_name: r.profiles.full_name,
      college_role: r.college_role,
    }));
    const cohortFacIndex = new Map(
      cohortFacultyList.map((f) => [f.user_id, f]),
    );

    type PodRow = {
      id: string;
      name: string;
      pod_faculty: Array<{
        faculty_user_id: string;
        profiles: { full_name: string | null } | null;
      }>;
      pod_members: Array<{
        student_user_id: string;
        profiles: { full_name: string | null } | null;
      }>;
    };
    const podList: PodWithRoster[] = ((pods ?? []) as unknown as PodRow[]).map((p) => {
      const faculty: PodFacultyMember[] = p.pod_faculty.map((f) => {
        const cf = cohortFacIndex.get(f.faculty_user_id);
        return {
          user_id: f.faculty_user_id,
          full_name: f.profiles?.full_name ?? cf?.full_name ?? null,
          college_role: cf?.college_role ?? "support",
        };
      });
      return {
        pod_id: p.id,
        name: p.name,
        faculty_names: faculty
          .map((f) => f.full_name)
          .filter((n): n is string => !!n),
        faculty,
        is_my_pod: p.pod_faculty.some((f) => f.faculty_user_id === myUserId),
        members: p.pod_members.map((m) => ({
          user_id: m.student_user_id,
          full_name: m.profiles?.full_name ?? null,
        })),
      };
    });

    const assigned = new Set(podList.flatMap((p) => p.members.map((m) => m.user_id)));
    const unassigned = (
      (regs ?? []) as unknown as Array<{
        user_id: string;
        profiles: { full_name: string | null };
      }>
    )
      .filter((r) => !assigned.has(r.user_id))
      .map((r) => ({ user_id: r.user_id, full_name: r.profiles.full_name }));

    return { pods: podList, unassigned, cohortFaculty: cohortFacultyList };
  },
);
