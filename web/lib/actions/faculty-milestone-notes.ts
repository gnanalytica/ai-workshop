"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { getSupabaseServer } from "@/lib/supabase/server";
import { actionFail, actionOk } from "./_helpers";

const schema = z.object({
  submission_id: z.string().uuid(),
  note: z.string().max(2000),
});

export async function setMilestoneFacultyNote(
  input: z.infer<typeof schema>,
) {
  const parsed = schema.safeParse(input);
  if (!parsed.success) return actionFail("Invalid input");
  const sb = await getSupabaseServer();
  const { data: user } = await sb.auth.getUser();
  if (!user.user) return actionFail("Not signed in");

  const { error } = await sb.rpc("set_submission_faculty_note", {
    p_submission_id: parsed.data.submission_id,
    p_note: parsed.data.note,
  });
  if (error) return actionFail(error.message);

  revalidatePath("/faculty/pod");
  return actionOk();
}
