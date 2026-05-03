"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { getSupabaseServer } from "@/lib/supabase/server";
import { actionFail, actionOk } from "./_helpers";

const submitSchema = z.object({
  cohort_id: z.string().uuid(),
  day_number: z.number().int().min(1).max(60),
  rating: z.number().int().min(1).max(5),
  fuzzy_topic: z.string().max(280).optional(),
  notes: z.string().max(2000).optional(),
  anonymous: z.boolean().default(false),
});

export async function submitDayFeedback(input: z.input<typeof submitSchema>) {
  const parsed = submitSchema.safeParse(input);
  if (!parsed.success) return actionFail("Invalid input");
  const sb = await getSupabaseServer();
  const { data: u } = await sb.auth.getUser();
  if (!u.user) return actionFail("Not signed in");

  const row = {
    cohort_id: parsed.data.cohort_id,
    day_number: parsed.data.day_number,
    user_id: u.user.id,
    rating: parsed.data.rating,
    fuzzy_topic: parsed.data.fuzzy_topic?.trim() || null,
    notes: parsed.data.notes?.trim() || null,
    anonymous: parsed.data.anonymous,
    updated_at: new Date().toISOString(),
  };

  const { error } = await sb
    .from("day_feedback")
    .upsert(row as never, { onConflict: "cohort_id,day_number,user_id" });
  if (error) return actionFail(error.message);

  revalidatePath("/dashboard");
  revalidatePath("/learn");
  return actionOk();
}
