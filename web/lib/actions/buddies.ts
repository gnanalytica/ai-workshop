"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { getSupabaseServer } from "@/lib/supabase/server";
import { actionFail, actionOk } from "./_helpers";

const generateSchema = z.object({
  cohort_id: z.string().uuid(),
  week_number: z.number().int().min(1).max(8),
});

export async function generateBuddyPairs(input: z.infer<typeof generateSchema>) {
  const parsed = generateSchema.safeParse(input);
  if (!parsed.success) return actionFail("Invalid input");
  const sb = await getSupabaseServer();
  const { data, error } = await sb.rpc("rpc_generate_buddy_pairs", {
    p_cohort: parsed.data.cohort_id,
    p_week: parsed.data.week_number,
  } as never);
  if (error) return actionFail(error.message);
  revalidatePath("/admin/roster");
  revalidatePath("/pod");
  revalidatePath("/people");
  return actionOk<{ pairs: number }>({ pairs: Number(data ?? 0) });
}
