"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { getSupabaseServer } from "@/lib/supabase/server";
import { actionFail, actionOk } from "./_helpers";

const giveSchema = z.object({
  to_user_id: z.string().uuid(),
  cohort_id: z.string().uuid(),
  note: z.string().min(3).max(500),
  day_number: z.number().int().min(1).max(60).optional(),
});

export async function giveKudos(input: z.infer<typeof giveSchema>) {
  const parsed = giveSchema.safeParse(input);
  if (!parsed.success) return actionFail("Invalid input");
  const sb = await getSupabaseServer();
  const { error } = await sb.rpc("rpc_give_kudos", {
    p_to_user: parsed.data.to_user_id,
    p_cohort: parsed.data.cohort_id,
    p_note: parsed.data.note,
    p_day: parsed.data.day_number ?? null,
  } as never);
  if (error) return actionFail(error.message);
  revalidatePath("/people");
  return actionOk();
}
