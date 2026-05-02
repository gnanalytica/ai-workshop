"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { getSupabaseServer } from "@/lib/supabase/server";
import { requireCapability } from "@/lib/auth/requireCapability";
import { actionFail, actionOk } from "./_helpers";

const submitSchema = z.object({
  quiz_id: z.string().uuid(),
  answers: z.record(z.string(), z.unknown()),
  day_number: z.number().int().min(1).max(60),
});

/** Submits + scores via SECURITY DEFINER RPC; answers are hidden from clients. */
export async function submitQuiz(input: z.infer<typeof submitSchema>) {
  const parsed = submitSchema.safeParse(input);
  if (!parsed.success) return actionFail("Invalid input");
  const sb = await getSupabaseServer();
  const { data, error } = await sb.rpc("rpc_submit_quiz_attempt", {
    p_quiz: parsed.data.quiz_id,
    p_answers: parsed.data.answers,
  } as never);
  if (error) return actionFail(error.message);
  revalidatePath(`/day/${parsed.data.day_number}`);
  return actionOk<{ score: number }>({ score: Number(data ?? 0) });
}

const startSchema = z.object({
  quiz_id: z.string().uuid(),
  duration_minutes: z.number().int().min(1).max(180),
});

async function loadQuizCohort(quizId: string): Promise<string | null> {
  const sb = await getSupabaseServer();
  const { data } = await sb
    .from("quizzes")
    .select("cohort_id")
    .eq("id", quizId)
    .maybeSingle();
  return (data as { cohort_id?: string } | null)?.cohort_id ?? null;
}

export async function startQuizSession(input: z.infer<typeof startSchema>) {
  const parsed = startSchema.safeParse(input);
  if (!parsed.success) return actionFail("Invalid input");
  const cohortId = await loadQuizCohort(parsed.data.quiz_id);
  if (!cohortId) return actionFail("Quiz not found");
  await requireCapability("content.write", cohortId);
  const sb = await getSupabaseServer();
  const closesAt = new Date(Date.now() + parsed.data.duration_minutes * 60_000).toISOString();
  const { error } = await sb
    .from("quizzes")
    .update({ closes_at: closesAt } as never)
    .eq("id", parsed.data.quiz_id);
  if (error) return actionFail(error.message);
  revalidatePath(`/admin/cohorts/${cohortId}/content`);
  revalidatePath(`/admin/cohorts/${cohortId}/content/quiz/${parsed.data.quiz_id}`);
  return actionOk<{ closes_at: string }>({ closes_at: closesAt });
}

const stopSchema = z.object({ quiz_id: z.string().uuid() });

export async function stopQuizSession(input: z.infer<typeof stopSchema>) {
  const parsed = stopSchema.safeParse(input);
  if (!parsed.success) return actionFail("Invalid input");
  const cohortId = await loadQuizCohort(parsed.data.quiz_id);
  if (!cohortId) return actionFail("Quiz not found");
  await requireCapability("content.write", cohortId);
  const sb = await getSupabaseServer();
  const { error } = await sb
    .from("quizzes")
    .update({ closes_at: null } as never)
    .eq("id", parsed.data.quiz_id);
  if (error) return actionFail(error.message);
  revalidatePath(`/admin/cohorts/${cohortId}/content`);
  revalidatePath(`/admin/cohorts/${cohortId}/content/quiz/${parsed.data.quiz_id}`);
  return actionOk();
}
