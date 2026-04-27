"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { getSupabaseServer } from "@/lib/supabase/server";
import { requireCapability } from "@/lib/auth/requireCapability";
import { actionFail, actionOk } from "./_helpers";

const createSchema = z.object({
  cohort_id: z.string().uuid(),
  student_id: z.string().uuid(),
  body_md: z.string().min(3).max(2000),
  needs_followup: z.boolean().default(false),
});

export async function createPodNote(input: z.infer<typeof createSchema>) {
  const parsed = createSchema.safeParse(input);
  if (!parsed.success) return actionFail("Invalid input");
  await requireCapability("roster.read", parsed.data.cohort_id);
  const sb = await getSupabaseServer();
  const { data: user } = await sb.auth.getUser();
  if (!user.user) return actionFail("Not signed in");
  const { error } = await sb.from("faculty_pod_notes").insert({
    cohort_id: parsed.data.cohort_id,
    student_id: parsed.data.student_id,
    author_id: user.user.id,
    body_md: parsed.data.body_md,
    needs_followup: parsed.data.needs_followup,
  });
  if (error) return actionFail(error.message);
  revalidatePath(`/faculty/student/${parsed.data.student_id}`);
  return actionOk();
}

const toggleSchema = z.object({
  note_id: z.string().uuid(),
  student_id: z.string().uuid(),
  needs_followup: z.boolean(),
});

export async function setPodNoteFollowup(input: z.infer<typeof toggleSchema>) {
  const parsed = toggleSchema.safeParse(input);
  if (!parsed.success) return actionFail("Invalid input");
  const sb = await getSupabaseServer();
  const { error } = await sb
    .from("faculty_pod_notes")
    .update({ needs_followup: parsed.data.needs_followup })
    .eq("id", parsed.data.note_id);
  if (error) return actionFail(error.message);
  revalidatePath(`/faculty/student/${parsed.data.student_id}`);
  return actionOk();
}

const deleteSchema = z.object({
  note_id: z.string().uuid(),
  student_id: z.string().uuid(),
});

export async function deletePodNote(input: z.infer<typeof deleteSchema>) {
  const parsed = deleteSchema.safeParse(input);
  if (!parsed.success) return actionFail("Invalid input");
  const sb = await getSupabaseServer();
  const { error } = await sb.from("faculty_pod_notes").delete().eq("id", parsed.data.note_id);
  if (error) return actionFail(error.message);
  revalidatePath(`/faculty/student/${parsed.data.student_id}`);
  return actionOk();
}
