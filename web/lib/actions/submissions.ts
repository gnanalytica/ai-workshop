"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { withSupabase, actionFail } from "./_helpers";

const submitSchema = z.object({
  assignment_id: z.string().uuid(),
  body: z.string().min(1).max(50_000),
  attachments: z.array(z.object({ name: z.string(), url: z.string().url() })).max(10).default([]),
});

export async function submitAssignment(input: z.infer<typeof submitSchema>) {
  const parsed = submitSchema.safeParse(input);
  if (!parsed.success) return actionFail("Invalid input");
  return withSupabase(async (sb) => {
    const { data: user } = await sb.auth.getUser();
    if (!user.user) return { data: null, error: { message: "Not signed in" } };
    return sb
      .from("submissions")
      .upsert({
        assignment_id: parsed.data.assignment_id,
        user_id: user.user.id,
        body: parsed.data.body,
        attachments: parsed.data.attachments,
        status: "submitted",
      })
      .select()
      .single();
  });
}

export async function saveDraft(input: z.infer<typeof submitSchema>) {
  const parsed = submitSchema.safeParse(input);
  if (!parsed.success) return actionFail("Invalid input");
  return withSupabase(async (sb) => {
    const { data: user } = await sb.auth.getUser();
    if (!user.user) return { data: null, error: { message: "Not signed in" } };
    return sb
      .from("submissions")
      .upsert({
        assignment_id: parsed.data.assignment_id,
        user_id: user.user.id,
        body: parsed.data.body,
        attachments: parsed.data.attachments,
        status: "draft",
      })
      .select()
      .single();
  });
}

export async function revalidateDayPage(day: number) {
  revalidatePath(`/day/${day}`);
}
