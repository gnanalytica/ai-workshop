import { getSupabaseServer } from "@/lib/supabase/server";

export interface PodNote {
  id: string;
  body_md: string;
  needs_followup: boolean;
  created_at: string;
  updated_at: string;
  author_id: string;
  author_name: string | null;
}

export async function listPodNotesForStudent(
  cohortId: string,
  studentId: string,
): Promise<PodNote[]> {
  const sb = await getSupabaseServer();
  const { data } = await sb
    .from("faculty_pod_notes")
    .select(
      "id, body_md, needs_followup, created_at, updated_at, author_id, profiles:author_id(full_name)",
    )
    .eq("cohort_id", cohortId)
    .eq("student_id", studentId)
    .order("created_at", { ascending: false });
  return ((data ?? []) as unknown as Array<{
    id: string;
    body_md: string;
    needs_followup: boolean;
    created_at: string;
    updated_at: string;
    author_id: string;
    profiles: { full_name: string | null } | null;
  }>).map((r) => ({
    id: r.id,
    body_md: r.body_md,
    needs_followup: r.needs_followup,
    created_at: r.created_at,
    updated_at: r.updated_at,
    author_id: r.author_id,
    author_name: r.profiles?.full_name ?? null,
  }));
}
