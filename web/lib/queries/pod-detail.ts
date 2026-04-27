import { cache } from "react";
import { getSupabaseServer } from "@/lib/supabase/server";

export interface PodDetail {
  pod_id: string;
  cohort_id: string;
  name: string;
  shared_notes: string | null;
  faculty: { user_id: string; full_name: string | null }[];
  members: { user_id: string; full_name: string | null; email: string }[];
  events: { id: string; kind: string; payload: Record<string, unknown>; at: string; actor_name: string | null }[];
}

export interface PodCandidates {
  faculty: { user_id: string; full_name: string | null }[];
  unassignedStudents: { user_id: string; full_name: string | null; email: string }[];
}

export const getPodCandidates = cache(
  async (cohortId: string, podId: string): Promise<PodCandidates> => {
    const sb = await getSupabaseServer();
    const [facRes, regRes, assignedRes] = await Promise.all([
      sb
        .from("cohort_faculty")
        .select("user_id, profiles!inner(full_name)")
        .eq("cohort_id", cohortId),
      sb
        .from("registrations")
        .select("user_id, profiles!inner(full_name, email)")
        .eq("cohort_id", cohortId)
        .eq("status", "confirmed"),
      sb
        .from("pod_members")
        .select("student_user_id, pods!inner(cohort_id)")
        .eq("pods.cohort_id", cohortId),
    ]);

    const assigned = new Set(
      ((assignedRes.data ?? []) as unknown as Array<{ student_user_id: string }>).map(
        (r) => r.student_user_id,
      ),
    );

    const faculty = ((facRes.data ?? []) as unknown as Array<{
      user_id: string;
      profiles: { full_name: string | null };
    }>).map((f) => ({
      user_id: f.user_id,
      full_name: f.profiles.full_name,
    }));

    const unassignedStudents = ((regRes.data ?? []) as unknown as Array<{
      user_id: string;
      profiles: { full_name: string | null; email: string };
    }>)
      .filter((r) => !assigned.has(r.user_id))
      .map((r) => ({
        user_id: r.user_id,
        full_name: r.profiles.full_name,
        email: r.profiles.email,
      }));

    void podId;
    return { faculty, unassignedStudents };
  },
);

export const getPodDetail = cache(async (podId: string): Promise<PodDetail | null> => {
  const sb = await getSupabaseServer();
  const { data, error } = await sb
    .from("pods")
    .select(
      "id, cohort_id, name, shared_notes, pod_faculty(faculty_user_id, profiles:faculty_user_id(full_name)), pod_members(student_user_id, profiles:student_user_id(full_name, email))",
    )
    .eq("id", podId)
    .maybeSingle();
  if (error || !data) return null;

  const d = data as unknown as {
    id: string; cohort_id: string; name: string; shared_notes: string | null;
    pod_faculty: Array<{ faculty_user_id: string; profiles: { full_name: string | null } | null }>;
    pod_members: Array<{ student_user_id: string; profiles: { full_name: string | null; email: string } | null }>;
  };

  const { data: events } = await sb
    .from("pod_events")
    .select("id, kind, payload, at, actor_user_id, profiles:actor_user_id(full_name)")
    .eq("pod_id", podId)
    .order("at", { ascending: false })
    .limit(20);

  return {
    pod_id: d.id,
    cohort_id: d.cohort_id,
    name: d.name,
    shared_notes: d.shared_notes,
    faculty: d.pod_faculty.map((f) => ({
      user_id: f.faculty_user_id,
      full_name: f.profiles?.full_name ?? null,
    })),
    members: d.pod_members.map((m) => ({
      user_id: m.student_user_id,
      full_name: m.profiles?.full_name ?? null,
      email: m.profiles?.email ?? "—",
    })),
    events: ((events ?? []) as unknown as Array<{
      id: string; kind: string; payload: Record<string, unknown>; at: string;
      profiles: { full_name: string | null } | null;
    }>).map((e) => ({
      id: e.id,
      kind: e.kind,
      payload: e.payload ?? {},
      at: e.at,
      actor_name: e.profiles?.full_name ?? null,
    })),
  };
});
