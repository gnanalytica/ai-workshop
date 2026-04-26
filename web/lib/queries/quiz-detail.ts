import { cache } from "react";
import { getSupabaseServer } from "@/lib/supabase/server";

export type QuizKind = "single" | "multi" | "short";

export interface QuizQuestionRow {
  ordinal: number;
  prompt: string;
  kind: QuizKind;
  options: { id: string; label: string }[];
  answer: unknown;
}

export interface QuizDetail {
  id: string;
  cohort_id: string;
  day_number: number;
  title: string;
  version: number;
  questions: QuizQuestionRow[];
}

export const getQuizDetail = cache(async (quizId: string): Promise<QuizDetail | null> => {
  const sb = await getSupabaseServer();
  const { data, error } = await sb
    .from("quizzes")
    .select("id, cohort_id, day_number, title, version, quiz_questions(ordinal, prompt, kind, options, answer)")
    .eq("id", quizId)
    .maybeSingle();
  if (error || !data) return null;
  const d = data as unknown as {
    id: string; cohort_id: string; day_number: number; title: string; version: number;
    quiz_questions: Array<{ ordinal: number; prompt: string; kind: QuizKind; options: unknown; answer: unknown }>;
  };
  return {
    id: d.id,
    cohort_id: d.cohort_id,
    day_number: d.day_number,
    title: d.title,
    version: d.version,
    questions: (d.quiz_questions ?? [])
      .map((q) => ({
        ordinal: q.ordinal,
        prompt: q.prompt,
        kind: q.kind,
        options: Array.isArray(q.options) ? (q.options as { id: string; label: string }[]) : [],
        answer: q.answer,
      }))
      .sort((a, b) => a.ordinal - b.ordinal),
  };
});
