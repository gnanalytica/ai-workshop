"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { getSupabaseServer } from "@/lib/supabase/server";
import { actionFail, actionOk } from "./_helpers";

const eventKind = z.enum([
  "member_added",
  "member_removed",
  "faculty_added",
  "faculty_removed",
  "primary_changed",
  "handoff",
]);

const evSchema = z.object({
  pod_id: z.string().uuid(),
  kind: eventKind,
  target_user_id: z.string().uuid(),
  to_user_id: z.string().uuid().optional(),
});

export async function podEvent(input: z.infer<typeof evSchema>) {
  const parsed = evSchema.safeParse(input);
  if (!parsed.success) return actionFail("Invalid input");
  const sb = await getSupabaseServer();
  const { error } = await sb.rpc("rpc_pod_faculty_event", {
    p_pod_id: parsed.data.pod_id,
    p_kind: parsed.data.kind,
    p_target_id: parsed.data.target_user_id,
    p_to_user_id: parsed.data.to_user_id ?? null,
    p_payload: {},
  } as never);
  if (error) return actionFail(error.message);
  revalidatePath("/admin/pods");
  revalidatePath(`/admin/pods/${parsed.data.pod_id}`);
  return actionOk();
}
