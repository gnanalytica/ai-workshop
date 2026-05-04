import { cache } from "react";
import { getSupabaseServer } from "@/lib/supabase/server";

export interface AssignmentRow {
  id: string;
  cohort_id: string;
  day_number: number;
  kind: "lab" | "capstone" | "reflection";
  title: string;
  due_at: string | null;
  rubric_id: string | null;
  auto_grade: boolean;
  submission_count: number;
}

export interface QuizRow {
  id: string;
  cohort_id: string;
  day_number: number;
  title: string;
  version: number;
  question_count: number;
  attempt_count: number;
}

export const listAssignments = cache(async (cohortId: string): Promise<AssignmentRow[]> => {
  const sb = await getSupabaseServer();
  const { data } = await sb
    .from("assignments")
    .select("id, cohort_id, day_number, kind, title, due_at, rubric_id, auto_grade, submissions(count)")
    .eq("cohort_id", cohortId)
    .order("day_number");
  return ((data ?? []) as unknown as Array<{
    id: string;
    cohort_id: string;
    day_number: number;
    kind: AssignmentRow["kind"];
    title: string;
    due_at: string | null;
    rubric_id: string | null;
    auto_grade: boolean;
    submissions: Array<{ count: number }>;
  }>).map((r) => ({
    id: r.id,
    cohort_id: r.cohort_id,
    day_number: r.day_number,
    kind: r.kind,
    title: r.title,
    due_at: r.due_at,
    rubric_id: r.rubric_id,
    auto_grade: !!r.auto_grade,
    submission_count: r.submissions?.[0]?.count ?? 0,
  }));
});

export const listQuizzes = cache(async (cohortId: string): Promise<QuizRow[]> => {
  const sb = await getSupabaseServer();
  const { data } = await sb
    .from("quizzes")
    .select("id, cohort_id, day_number, title, version, quiz_questions(count), quiz_attempts(count)")
    .eq("cohort_id", cohortId)
    .order("day_number");
  return ((data ?? []) as unknown as Array<{
    id: string;
    cohort_id: string;
    day_number: number;
    title: string;
    version: number;
    quiz_questions: Array<{ count: number }>;
    quiz_attempts: Array<{ count: number }>;
  }>).map((r) => ({
    id: r.id,
    cohort_id: r.cohort_id,
    day_number: r.day_number,
    title: r.title,
    version: r.version,
    question_count: r.quiz_questions?.[0]?.count ?? 0,
    attempt_count: r.quiz_attempts?.[0]?.count ?? 0,
  }));
});
