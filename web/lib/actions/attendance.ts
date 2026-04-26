"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { getSupabaseServer } from "@/lib/supabase/server";
import { actionFail, actionOk } from "./_helpers";

const selfSchema = z.object({
  cohort_id: z.string().uuid(),
  day_number: z.number().int().min(1).max(60),
});

export async function selfCheckIn(input: z.infer<typeof selfSchema>) {
  const parsed = selfSchema.safeParse(input);
  if (!parsed.success) return actionFail("Invalid input");
  const sb = await getSupabaseServer();
  const { data: user } = await sb.auth.getUser();
  if (!user.user) return actionFail("Not signed in");
  const { error } = await sb.from("attendance").upsert(
    {
      user_id: user.user.id,
      cohort_id: parsed.data.cohort_id,
      day_number: parsed.data.day_number,
      status: "present",
    },
    { onConflict: "user_id,cohort_id,day_number" },
  );
  if (error) return actionFail(error.message);
  revalidatePath(`/day/${parsed.data.day_number}`);
  return actionOk();
}
