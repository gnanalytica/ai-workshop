import { cache } from "react";
import { getSupabaseServer } from "@/lib/supabase/server";

export interface AdminCohortKpis {
  confirmed: number;
  pending: number;
  faculty: number;
  pods: number;
}

export interface RosterRow {
  user_id: string;
  full_name: string | null;
  email: string;
  college: string | null;
  status: "pending" | "confirmed" | "waitlist" | "cancelled";
  source: string | null;
  pod_name: string | null;
  created_at: string;
}

export interface PodRow {
  pod_id: string;
  cohort_id: string;
  name: string;
  member_count: number;
  faculty_count: number;
  faculty_names: string[];
}

export interface FacultyRow {
  user_id: string;
  full_name: string | null;
  email: string;
  college_role: "support" | "executive";
  pods: number;
}

export const getAdminCohortKpis = cache(async (cohortId: string): Promise<AdminCohortKpis> => {
  const sb = await getSupabaseServer();
  const [conf, pend, fac, pods] = await Promise.all([
    sb.from("registrations").select("user_id", { count: "exact", head: true }).eq("cohort_id", cohortId).eq("status", "confirmed"),
    sb.from("registrations").select("user_id", { count: "exact", head: true }).eq("cohort_id", cohortId).eq("status", "pending"),
    sb.from("cohort_faculty").select("user_id", { count: "exact", head: true }).eq("cohort_id", cohortId),
    sb.from("pods").select("id", { count: "exact", head: true }).eq("cohort_id", cohortId),
  ]);
  return {
    confirmed: conf.count ?? 0,
    pending: pend.count ?? 0,
    faculty: fac.count ?? 0,
    pods: pods.count ?? 0,
  };
});

export const listRoster = cache(async (cohortId: string): Promise<RosterRow[]> => {
  const sb = await getSupabaseServer();
  const { data } = await sb
    .from("registrations")
    .select(
      "user_id, status, source, created_at, profiles!inner(full_name, email, college), pod_members(pods(name))",
    )
    .eq("cohort_id", cohortId)
    .order("created_at", { ascending: false });
  return ((data ?? []) as unknown as Array<{
    user_id: string; status: RosterRow["status"]; source: string | null; created_at: string;
    profiles: { full_name: string | null; email: string; college: string | null };
    pod_members: Array<{ pods: { name: string } | null }> | null;
  }>).map((r) => ({
    user_id: r.user_id,
    full_name: r.profiles.full_name,
    email: r.profiles.email,
    college: r.profiles.college,
    status: r.status,
    source: r.source,
    pod_name: r.pod_members?.[0]?.pods?.name ?? null,
    created_at: r.created_at,
  }));
});

export const listPods = cache(async (cohortId: string): Promise<PodRow[]> => {
  const sb = await getSupabaseServer();
  const { data } = await sb
    .from("pods")
    .select(
      "id, cohort_id, name, pod_members(count), pod_faculty(faculty_user_id, profiles:faculty_user_id(full_name))",
    )
    .eq("cohort_id", cohortId)
    .order("name");
  return ((data ?? []) as unknown as Array<{
    id: string; cohort_id: string; name: string;
    pod_members: Array<{ count: number }>;
    pod_faculty: Array<{ faculty_user_id: string; profiles: { full_name: string | null } | null }>;
  }>).map((p) => ({
    pod_id: p.id,
    cohort_id: p.cohort_id,
    name: p.name,
    member_count: p.pod_members?.[0]?.count ?? 0,
    faculty_count: p.pod_faculty?.length ?? 0,
    faculty_names: p.pod_faculty
      .map((f) => f.profiles?.full_name)
      .filter((n): n is string => !!n),
  }));
});

export const listFaculty = cache(async (cohortId: string): Promise<FacultyRow[]> => {
  const sb = await getSupabaseServer();
  const { data } = await sb
    .from("cohort_faculty")
    .select("user_id, college_role, profiles!inner(full_name, email)")
    .eq("cohort_id", cohortId);
  return ((data ?? []) as unknown as Array<{
    user_id: string; college_role: "support" | "executive";
    profiles: { full_name: string | null; email: string };
  }>).map((r) => ({
    user_id: r.user_id,
    full_name: r.profiles.full_name,
    email: r.profiles.email,
    college_role: r.college_role,
    pods: 0, // can be filled via second query if needed
  }));
});
