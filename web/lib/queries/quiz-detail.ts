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

export interface QuizQuestionResult {
  ordinal: number;
  prompt: string;
  kind: QuizKind;
  total: number;
  options: Array<{ choice: string; label: string; votes: number }>;
}

export const getQuizResults = cache(
  async (quizId: string): Promise<QuizQuestionResult[]> => {
    const sb = await getSupabaseServer();
    const { data } = await (sb.rpc as unknown as (
      fn: string,
      args: Record<string, unknown>,
    ) => Promise<{
      data: Array<{
        ordinal: number;
        prompt: string;
        kind: QuizKind;
        choice: string;
        label: string;
        votes: number;
      }> | null;
    }>)("rpc_quiz_results", { p_quiz: quizId });
    const rows = data ?? [];
    const map = new Map<number, QuizQuestionResult>();
    for (const r of rows) {
      const votes = Number(r.votes ?? 0);
      let q = map.get(r.ordinal);
      if (!q) {
        q = {
          ordinal: r.ordinal,
          prompt: r.prompt,
          kind: r.kind,
          total: 0,
          options: [],
        };
        map.set(r.ordinal, q);
      }
      q.options.push({ choice: r.choice, label: r.label, votes });
      if (r.kind === "short" && r.choice === "__short__") {
        q.total = votes;
      } else if (r.kind !== "short") {
        q.total += votes;
      }
    }
    return Array.from(map.values()).sort((a, b) => a.ordinal - b.ordinal);
  },
);

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
