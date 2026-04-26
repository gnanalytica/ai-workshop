"use server";

import { z } from "zod";
import { requireCapability } from "@/lib/auth/requireCapability";
import { withSupabase, actionFail } from "./_helpers";

const newAssignmentSchema = z.object({
  cohort_id: z.string().uuid(),
  day_number: z.number().int().min(1).max(60),
  kind: z.enum(["lab", "capstone", "reflection", "quiz"]),
  title: z.string().min(2).max(200),
  body_md: z.string().max(20_000).optional(),
  due_at: z.string().nullable().optional(),
});

export async function createAssignment(input: z.infer<typeof newAssignmentSchema>) {
  const parsed = newAssignmentSchema.safeParse(input);
  if (!parsed.success) return actionFail("Invalid input");
  await requireCapability("content.write", parsed.data.cohort_id);
  return withSupabase(
    (sb) =>
      sb
        .from("assignments")
        .insert({
          cohort_id: parsed.data.cohort_id,
          day_number: parsed.data.day_number,
          kind: parsed.data.kind,
          title: parsed.data.title,
          body_md: parsed.data.body_md ?? null,
          due_at: parsed.data.due_at ?? null,
        })
        .select()
        .single(),
    "/admin/content",
  );
}

const deleteSchema = z.object({ id: z.string().uuid(), cohort_id: z.string().uuid() });

export async function deleteAssignment(input: z.infer<typeof deleteSchema>) {
  const parsed = deleteSchema.safeParse(input);
  if (!parsed.success) return actionFail("Invalid input");
  await requireCapability("content.write", parsed.data.cohort_id);
  return withSupabase(
    (sb) => sb.from("assignments").delete().eq("id", parsed.data.id).select().single(),
    "/admin/content",
  );
}

const newQuizSchema = z.object({
  cohort_id: z.string().uuid(),
  day_number: z.number().int().min(1).max(60),
  title: z.string().min(2).max(200),
});

export async function createQuiz(input: z.infer<typeof newQuizSchema>) {
  const parsed = newQuizSchema.safeParse(input);
  if (!parsed.success) return actionFail("Invalid input");
  await requireCapability("content.write", parsed.data.cohort_id);
  return withSupabase(
    (sb) =>
      sb
        .from("quizzes")
        .insert({
          cohort_id: parsed.data.cohort_id,
          day_number: parsed.data.day_number,
          title: parsed.data.title,
        })
        .select()
        .single(),
    "/admin/content",
  );
}

const questionSchema = z.object({
  cohort_id: z.string().uuid(),
  quiz_id: z.string().uuid(),
  ordinal: z.number().int().positive(),
  prompt: z.string().min(1).max(2000),
  kind: z.enum(["single", "multi", "short"]),
  options: z.array(z.object({ id: z.string(), label: z.string() })).max(10).default([]),
  answer: z.unknown(),
});

export async function upsertQuizQuestion(input: z.infer<typeof questionSchema>) {
  const parsed = questionSchema.safeParse(input);
  if (!parsed.success) return actionFail("Invalid input");
  await requireCapability("content.write", parsed.data.cohort_id);
  return withSupabase(
    (sb) =>
      sb
        .from("quiz_questions")
        .upsert({
          quiz_id: parsed.data.quiz_id,
          ordinal: parsed.data.ordinal,
          prompt: parsed.data.prompt,
          kind: parsed.data.kind,
          options: parsed.data.options,
          answer: parsed.data.answer ?? null,
        })
        .select()
        .single(),
    "/admin/content",
  );
}

const deleteQSchema = z.object({
  cohort_id: z.string().uuid(),
  quiz_id: z.string().uuid(),
  ordinal: z.number().int().positive(),
});

export async function deleteQuizQuestion(input: z.infer<typeof deleteQSchema>) {
  const parsed = deleteQSchema.safeParse(input);
  if (!parsed.success) return actionFail("Invalid input");
  await requireCapability("content.write", parsed.data.cohort_id);
  return withSupabase(
    (sb) =>
      sb
        .from("quiz_questions")
        .delete()
        .eq("quiz_id", parsed.data.quiz_id)
        .eq("ordinal", parsed.data.ordinal)
        .select()
        .single(),
    "/admin/content",
  );
}
