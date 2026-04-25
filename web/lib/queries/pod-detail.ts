import { cache } from "react";
import { getSupabaseServer } from "@/lib/supabase/server";

export interface PodDetail {
  pod_id: string;
  cohort_id: string;
  name: string;
  mentor_note: string | null;
  faculty: { user_id: string; full_name: string | null; is_primary: boolean }[];
  members: { user_id: string; full_name: string | null; email: string }[];
  events: { id: string; kind: string; payload: Record<string, unknown>; at: string; actor_name: string | null }[];
}

export const getPodDetail = cache(async (podId: string): Promise<PodDetail | null> => {
  const sb = await getSupabaseServer();
  const { data, error } = await sb
    .from("pods")
    .select(
      "id, cohort_id, name, mentor_note, pod_faculty(faculty_user_id, is_primary, profiles:faculty_user_id(full_name)), pod_members(student_user_id, profiles:student_user_id(full_name, email))",
    )
    .eq("id", podId)
    .maybeSingle();
  if (error || !data) return null;

  const d = data as unknown as {
    id: string; cohort_id: string; name: string; mentor_note: string | null;
    pod_faculty: Array<{ faculty_user_id: string; is_primary: boolean; profiles: { full_name: string | null } | null }>;
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
    mentor_note: d.mentor_note,
    faculty: d.pod_faculty.map((f) => ({
      user_id: f.faculty_user_id,
      full_name: f.profiles?.full_name ?? null,
      is_primary: f.is_primary,
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
