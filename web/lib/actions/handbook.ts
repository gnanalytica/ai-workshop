"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { getSupabaseServer } from "@/lib/supabase/server";
import { actionFail, actionOk } from "./_helpers";

const schema = z.object({
  module_id: z.string().uuid(),
  status: z.enum(["not_started", "in_progress", "completed"]),
});

export async function setHandbookProgress(input: z.infer<typeof schema>) {
  const parsed = schema.safeParse(input);
  if (!parsed.success) return actionFail("Invalid input");
  const sb = await getSupabaseServer();
  const { data: user } = await sb.auth.getUser();
  if (!user.user) return actionFail("Not signed in");

  const now = new Date().toISOString();
  const patch: Record<string, string | null> = { status: parsed.data.status };
  if (parsed.data.status === "in_progress") patch.started_at = now;
  if (parsed.data.status === "completed") {
    patch.completed_at = now;
    patch.started_at = patch.started_at ?? now;
  }
  if (parsed.data.status === "not_started") {
    patch.started_at = null;
    patch.completed_at = null;
  }

  const { error } = await sb
    .from("faculty_pretraining_progress")
    .upsert(
      {
        faculty_user_id: user.user.id,
        module_id: parsed.data.module_id,
        ...patch,
      },
      { onConflict: "faculty_user_id,module_id" },
    );
  if (error) return actionFail(error.message);
  revalidatePath("/faculty/handbook");
  return actionOk();
}
