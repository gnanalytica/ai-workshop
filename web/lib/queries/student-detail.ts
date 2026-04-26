import { cache } from "react";
import { getSupabaseServer } from "@/lib/supabase/server";

export interface StudentDetail {
  user_id: string;
  full_name: string | null;
  email: string;
  college: string | null;
  pod_name: string | null;
  attendance: { day_number: number; status: string }[];
  labs: { day_number: number; lab_id: string; status: string }[];
  submissions: {
    id: string;
    day_number: number;
    title: string;
    status: string;
    score: number | null;
    body: string | null;
    feedback_md: string | null;
    updated_at: string;
  }[];
}

export const getStudentDetail = cache(
  async (cohortId: string, userId: string): Promise<StudentDetail | null> => {
    const sb = await getSupabaseServer();
    const [profile, att, labs, subs, pod] = await Promise.all([
      sb.from("profiles").select("full_name, email, college").eq("id", userId).maybeSingle(),
      sb.from("attendance").select("day_number, status").eq("cohort_id", cohortId).eq("user_id", userId).order("day_number"),
      sb.from("lab_progress").select("day_number, lab_id, status").eq("cohort_id", cohortId).eq("user_id", userId).order("day_number"),
      sb.from("submissions").select("id, status, score, body, feedback_md, updated_at, assignments!inner(title, day_number, cohort_id)").eq("user_id", userId).eq("assignments.cohort_id", cohortId).order("updated_at", { ascending: false }),
      sb.from("pod_members").select("pods(name)").eq("student_user_id", userId).eq("cohort_id", cohortId).maybeSingle(),
    ]);
    if (!profile.data) return null;
    return {
      user_id: userId,
      full_name: (profile.data as { full_name: string | null }).full_name,
      email: (profile.data as { email: string }).email,
      college: (profile.data as { college: string | null }).college,
      pod_name: (pod.data as unknown as { pods: { name: string } | null } | null)?.pods?.name ?? null,
      attendance: ((att.data ?? []) as Array<{ day_number: number; status: string }>),
      labs: ((labs.data ?? []) as Array<{ day_number: number; lab_id: string; status: string }>),
      submissions: ((subs.data ?? []) as unknown as Array<{
        id: string; status: string; score: number | null;
        body: string | null; feedback_md: string | null; updated_at: string;
        assignments: { title: string; day_number: number } | Array<{ title: string; day_number: number }>;
      }>).map((s) => {
        const a = Array.isArray(s.assignments) ? s.assignments[0] : s.assignments;
        return {
          id: s.id,
          day_number: a?.day_number ?? 0,
          title: a?.title ?? "",
          status: s.status,
          score: s.score,
          body: s.body,
          feedback_md: s.feedback_md,
          updated_at: s.updated_at,
        };
      }),
    };
  },
);
