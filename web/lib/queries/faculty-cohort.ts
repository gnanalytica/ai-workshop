import { cache } from "react";
import { getSupabaseServer } from "@/lib/supabase/server";

export interface CohortPod {
  pod_id: string;
  name: string;
  member_count: number;
  faculty_count: number;
  faculty_names: string[];
  is_my_pod: boolean;
}

export interface CohortKpis {
  students: number;
  pods: number;
  unassignedStudents: number;
  pendingReview: number;
  stuckOpen: number;
  atRisk: number;
}

export interface AtRiskStudent {
  user_id: string;
  full_name: string | null;
  pod_name: string | null;
  days_since_active: number | null;
  reason: "no_activity" | "low_completion";
}

export const getCohortKpis = cache(async (cohortId: string): Promise<CohortKpis> => {
  const sb = await getSupabaseServer();
  const [students, pods, assignedStudents, submitted, stuck] = await Promise.all([
    sb.from("registrations").select("user_id", { count: "exact", head: true })
      .eq("cohort_id", cohortId).eq("status", "confirmed"),
    sb.from("pods").select("id", { count: "exact", head: true }).eq("cohort_id", cohortId),
    sb.from("pod_members").select("student_user_id", { count: "exact", head: true })
      .eq("cohort_id", cohortId),
    sb.from("submissions").select("id, assignments!inner(cohort_id)", { count: "exact", head: true })
      .eq("status", "submitted").eq("assignments.cohort_id", cohortId),
    sb.from("stuck_queue").select("id", { count: "exact", head: true })
      .eq("cohort_id", cohortId).in("status", ["open", "helping"]),
  ]);
  const total = students.count ?? 0;
  const assigned = assignedStudents.count ?? 0;
  return {
    students: total,
    pods: pods.count ?? 0,
    unassignedStudents: Math.max(0, total - assigned),
    pendingReview: submitted.count ?? 0,
    stuckOpen: stuck.count ?? 0,
    atRisk: 0,
  };
});

export const listCohortPods = cache(async (cohortId: string, myUserId: string): Promise<CohortPod[]> => {
  const sb = await getSupabaseServer();
  const { data } = await sb
    .from("pods")
    .select("id, name, pod_members(count), pod_faculty(faculty_user_id, profiles:faculty_user_id(full_name))")
    .eq("cohort_id", cohortId)
    .order("name");
  return ((data ?? []) as unknown as Array<{
    id: string; name: string;
    pod_members: Array<{ count: number }>;
    pod_faculty: Array<{ faculty_user_id: string; profiles: { full_name: string | null } | null }>;
  }>).map((p) => ({
    pod_id: p.id,
    name: p.name,
    member_count: p.pod_members?.[0]?.count ?? 0,
    faculty_count: p.pod_faculty?.length ?? 0,
    faculty_names: p.pod_faculty.map((f) => f.profiles?.full_name).filter((n): n is string => !!n),
    is_my_pod: p.pod_faculty.some((f) => f.faculty_user_id === myUserId),
  }));
});

export const listAtRiskStudents = cache(async (cohortId: string): Promise<AtRiskStudent[]> => {
  const sb = await getSupabaseServer();
  const sinceDays = 3;
  const since = new Date(Date.now() - sinceDays * 24 * 60 * 60 * 1000).toISOString();
  const { data: regs } = await sb
    .from("registrations")
    .select("user_id, profiles!inner(full_name), pod_members!left(pods(name))")
    .eq("cohort_id", cohortId)
    .eq("status", "confirmed");
  type Reg = { user_id: string; profiles: { full_name: string | null }; pod_members: Array<{ pods: { name: string | null } | null }> };
  const list = (regs ?? []) as unknown as Reg[];
  if (list.length === 0) return [];

  const userIds = list.map((r) => r.user_id);
  const { data: recentLab } = await sb
    .from("lab_progress")
    .select("user_id, updated_at")
    .eq("cohort_id", cohortId)
    .in("user_id", userIds)
    .gte("updated_at", since);
  const recentSet = new Set(((recentLab ?? []) as Array<{ user_id: string }>).map((r) => r.user_id));

  return list
    .filter((r) => !recentSet.has(r.user_id))
    .slice(0, 25)
    .map((r) => ({
      user_id: r.user_id,
      full_name: r.profiles.full_name,
      pod_name: r.pod_members?.[0]?.pods?.name ?? null,
      days_since_active: sinceDays,
      reason: "no_activity" as const,
    }));
});

export interface ScoreRow {
  user_id: string;
  full_name: string | null;
  pod_name: string | null;
  quiz_score: number;
  submission_score: number;
  posts_score: number;
  comments_score: number;
  upvotes_score: number;
  total_score: number;
}

export const listStudentLeaderboard = cache(async (cohortId: string): Promise<ScoreRow[]> => {
  const sb = await getSupabaseServer();
  const { data } = await sb
    .from("v_student_score")
    .select("user_id, quiz_score, submission_score, posts_score, comments_score, upvotes_score, total_score")
    .eq("cohort_id", cohortId)
    .order("total_score", { ascending: false })
    .limit(100);
  type Row = {
    user_id: string;
    quiz_score: number; submission_score: number;
    posts_score: number; comments_score: number;
    upvotes_score: number; total_score: number;
  };
  const rows = (data ?? []) as Row[];
  if (rows.length === 0) return [];
  const userIds = rows.map((r) => r.user_id);
  const { data: profs } = await sb
    .from("profiles")
    .select("id, full_name")
    .in("id", userIds);
  const { data: members } = await sb
    .from("pod_members")
    .select("student_user_id, pods!inner(name, cohort_id)")
    .eq("pods.cohort_id", cohortId)
    .in("student_user_id", userIds);
  const nameById = new Map(((profs ?? []) as Array<{ id: string; full_name: string | null }>).map((p) => [p.id, p.full_name]));
  const podByStudent = new Map(((members ?? []) as unknown as Array<{ student_user_id: string; pods: { name: string } }>).map((m) => [m.student_user_id, m.pods.name]));
  return rows.map((r) => ({
    user_id: r.user_id,
    full_name: nameById.get(r.user_id) ?? null,
    pod_name: podByStudent.get(r.user_id) ?? null,
    quiz_score: Number(r.quiz_score),
    submission_score: Number(r.submission_score),
    posts_score: Number(r.posts_score),
    comments_score: Number(r.comments_score),
    upvotes_score: Number(r.upvotes_score),
    total_score: Number(r.total_score),
  }));
});

export interface PodScoreRow {
  pod_id: string;
  pod_name: string;
  member_count: number;
  total_score: number;
  avg_score: number;
}

export const listPodLeaderboard = cache(async (cohortId: string): Promise<PodScoreRow[]> => {
  const students = await listStudentLeaderboard(cohortId);
  const sb = await getSupabaseServer();
  const { data } = await sb
    .from("pods")
    .select("id, name, pod_members(student_user_id)")
    .eq("cohort_id", cohortId);
  const pods = (data ?? []) as unknown as Array<{ id: string; name: string; pod_members: Array<{ student_user_id: string }> }>;
  const scoreById = new Map(students.map((s) => [s.user_id, s.total_score]));
  return pods
    .map((p) => {
      const members = p.pod_members ?? [];
      const total = members.reduce((acc, m) => acc + (scoreById.get(m.student_user_id) ?? 0), 0);
      return {
        pod_id: p.id,
        pod_name: p.name,
        member_count: members.length,
        total_score: total,
        avg_score: members.length > 0 ? Math.round(total / members.length) : 0,
      };
    })
    .sort((a, b) => b.total_score - a.total_score);
});

export interface TeamScoreRow {
  team_id: string;
  team_name: string;
  member_count: number;
  total_score: number;
  avg_score: number;
}

export const listTeamLeaderboard = cache(async (cohortId: string): Promise<TeamScoreRow[]> => {
  const students = await listStudentLeaderboard(cohortId);
  const sb = await getSupabaseServer();
  const { data } = await sb
    .from("teams")
    .select("id, name, team_members(user_id)")
    .eq("cohort_id", cohortId);
  const teams = (data ?? []) as unknown as Array<{ id: string; name: string; team_members: Array<{ user_id: string }> }>;
  const scoreById = new Map(students.map((s) => [s.user_id, s.total_score]));
  return teams
    .map((t) => {
      const members = t.team_members ?? [];
      const total = members.reduce((acc, m) => acc + (scoreById.get(m.user_id) ?? 0), 0);
      return {
        team_id: t.id,
        team_name: t.name,
        member_count: members.length,
        total_score: total,
        avg_score: members.length > 0 ? Math.round(total / members.length) : 0,
      };
    })
    .sort((a, b) => b.total_score - a.total_score);
});
