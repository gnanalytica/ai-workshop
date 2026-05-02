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
  closes_at: string | null;
  questions: QuizQuestionRow[];
}

export interface ActiveQuiz {
  id: string;
  title: string;
  day_number: number | null;
  closes_at: string;
  question_count: number;
  attempted: boolean;
}

export async function getActiveQuiz(cohortId: string): Promise<ActiveQuiz | null> {
  const sb = await getSupabaseServer();
  const { data } = await (sb.rpc as unknown as (
    fn: string,
    args: Record<string, unknown>,
  ) => Promise<{ data: ActiveQuiz | ActiveQuiz[] | null }>)("rpc_active_quiz", {
    p_cohort: cohortId,
  });
  if (!data) return null;
  const row = Array.isArray(data) ? data[0] ?? null : data;
  if (!row) return null;
  return {
    id: row.id,
    title: row.title,
    day_number: row.day_number ?? null,
    closes_at: row.closes_at,
    question_count: Number(row.question_count ?? 0),
    attempted: !!row.attempted,
  };
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
    .select("id, cohort_id, day_number, title, version, closes_at, quiz_questions(ordinal, prompt, kind, options, answer)")
    .eq("id", quizId)
    .maybeSingle();
  if (error || !data) return null;
  const d = data as unknown as {
    id: string; cohort_id: string; day_number: number; title: string; version: number;
    closes_at: string | null;
    quiz_questions: Array<{ ordinal: number; prompt: string; kind: QuizKind; options: unknown; answer: unknown }>;
  };
  return {
    id: d.id,
    cohort_id: d.cohort_id,
    day_number: d.day_number,
    title: d.title,
    version: d.version,
    closes_at: d.closes_at ?? null,
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
