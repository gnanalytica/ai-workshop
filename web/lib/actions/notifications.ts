"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { getSupabaseServer } from "@/lib/supabase/server";
import { actionFail, actionOk } from "./_helpers";

export async function markAllMentionsRead() {
  const sb = await getSupabaseServer();
  const { data: user } = await sb.auth.getUser();
  if (!user.user) return actionFail("Not signed in");
  const { error } = await sb
    .from("notifications_log")
    .update({ read_at: new Date().toISOString() })
    .eq("user_id", user.user.id)
    .eq("kind", "mention")
    .is("read_at", null);
  if (error) return actionFail(error.message);
  revalidatePath("/", "layout");
  return actionOk();
}

const oneSchema = z.object({ id: z.string().uuid() });
export async function markMentionRead(input: z.infer<typeof oneSchema>) {
  const parsed = oneSchema.safeParse(input);
  if (!parsed.success) return actionFail("Invalid input");
  const sb = await getSupabaseServer();
  const { data: user } = await sb.auth.getUser();
  if (!user.user) return actionFail("Not signed in");
  const { error } = await sb
    .from("notifications_log")
    .update({ read_at: new Date().toISOString() })
    .eq("id", parsed.data.id)
    .eq("user_id", user.user.id);
  if (error) return actionFail(error.message);
  revalidatePath("/", "layout");
  return actionOk();
}
