import { cache } from "react";
import { getSupabaseServer } from "@/lib/supabase/server";

export type AssignmentKind = "lab" | "capstone" | "reflection";

export interface AssignmentDetail {
  id: string;
  cohort_id: string;
  day_number: number;
  kind: AssignmentKind;
  title: string;
  body_md: string | null;
  due_at: string | null;
  weight: number;
  auto_grade: boolean;
  rubric_id: string | null;
  submission_count: number;
}

export const getAssignmentDetail = cache(
  async (assignmentId: string): Promise<AssignmentDetail | null> => {
    const sb = await getSupabaseServer();
    const { data, error } = await sb
      .from("assignments")
      .select(
        "id, cohort_id, day_number, kind, title, body_md, due_at, weight, auto_grade, rubric_id, submissions(count)",
      )
      .eq("id", assignmentId)
      .maybeSingle();
    if (error || !data) return null;
    const d = data as unknown as {
      id: string;
      cohort_id: string;
      day_number: number;
      kind: AssignmentKind;
      title: string;
      body_md: string | null;
      due_at: string | null;
      weight: number | string;
      auto_grade: boolean;
      rubric_id: string | null;
      submissions: Array<{ count: number }>;
    };
    return {
      id: d.id,
      cohort_id: d.cohort_id,
      day_number: d.day_number,
      kind: d.kind,
      title: d.title,
      body_md: d.body_md,
      due_at: d.due_at,
      weight: Number(d.weight ?? 1),
      auto_grade: !!d.auto_grade,
      rubric_id: d.rubric_id,
      submission_count: d.submissions?.[0]?.count ?? 0,
    };
  },
);
