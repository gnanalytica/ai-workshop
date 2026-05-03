"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { getSupabaseServer } from "@/lib/supabase/server";
import { actionFail, actionOk } from "./_helpers";

const feedbackSchema = z.object({
  cohort_id: z.string().uuid(),
  day_number: z.number().int().min(1).max(60),
  rating: z.number().int().min(1).max(5),
  fuzzy_topic: z.string().max(500).nullable().optional(),
  notes: z.string().max(2000).nullable().optional(),
  anonymous: z.boolean().default(false),
});

export async function submitDayFeedback(input: z.infer<typeof feedbackSchema>) {
  const parsed = feedbackSchema.safeParse(input);
  if (!parsed.success) return actionFail("Invalid input");
  const sb = await getSupabaseServer();
  const { data: u } = await sb.auth.getUser();
  if (!u.user) return actionFail("Not authenticated");

  const { error } = await sb
    .from("day_feedback")
    .upsert(
      {
        user_id: u.user.id,
        cohort_id: parsed.data.cohort_id,
        day_number: parsed.data.day_number,
        rating: parsed.data.rating,
        fuzzy_topic: parsed.data.fuzzy_topic ?? null,
        notes: parsed.data.notes ?? null,
        anonymous: parsed.data.anonymous,
      },
      { onConflict: "cohort_id,day_number,user_id" },
    );
  if (error) return actionFail(error.message);
  revalidatePath(`/day/${parsed.data.day_number}`);
  return actionOk(null);
}
