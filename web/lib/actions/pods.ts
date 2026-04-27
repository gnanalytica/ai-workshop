"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSupabaseServer } from "@/lib/supabase/server";
import { actionFail, actionOk } from "./_helpers";

const eventKind = z.enum([
  "member_added",
  "member_removed",
  "faculty_added",
  "faculty_removed",
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
  revalidatePath("/faculty/pod");
  revalidatePath("/faculty/cohort");
  revalidatePath("/faculty/help-desk");
  revalidatePath(`/faculty/student/${parsed.data.target_user_id}`);
  return actionOk();
}

const createSchema = z.object({
  cohort_id: z.string().uuid(),
  name: z.string().trim().min(1).max(80),
  shared_notes: z.string().max(2000).optional().nullable(),
});

export async function createPod(input: z.infer<typeof createSchema>) {
  const parsed = createSchema.safeParse(input);
  if (!parsed.success) return actionFail("Invalid input");
  const sb = await getSupabaseServer();
  const { data, error } = await sb.rpc("rpc_create_pod", {
    p_cohort: parsed.data.cohort_id,
    p_name: parsed.data.name,
    p_shared_notes: parsed.data.shared_notes ?? null,
  } as never);
  if (error) return actionFail(error.message);
  revalidatePath("/pods");
  revalidatePath("/faculty/pod");
  revalidatePath("/faculty/help-desk");
  return actionOk(data);
}

const updateSchema = z.object({
  pod_id: z.string().uuid(),
  name: z.string().trim().min(1).max(80).optional(),
  shared_notes: z.string().max(2000).optional().nullable(),
});

export async function updatePod(input: z.infer<typeof updateSchema>) {
  const parsed = updateSchema.safeParse(input);
  if (!parsed.success) return actionFail("Invalid input");
  const sb = await getSupabaseServer();
  const { error } = await sb.rpc("rpc_update_pod", {
    p_pod_id: parsed.data.pod_id,
    p_name: parsed.data.name ?? null,
    p_shared_notes: parsed.data.shared_notes ?? null,
  } as never);
  if (error) return actionFail(error.message);
  revalidatePath("/pods");
  revalidatePath(`/pods/${parsed.data.pod_id}`);
  revalidatePath("/faculty/pod");
  revalidatePath("/faculty/help-desk");
  return actionOk();
}

export async function deletePod(podId: string, cohortId?: string) {
  if (!/^[0-9a-f-]{36}$/i.test(podId)) return actionFail("Invalid pod id");
  const sb = await getSupabaseServer();
  const { error } = await sb.rpc("rpc_delete_pod", { p_pod_id: podId } as never);
  if (error) return actionFail(error.message);
  revalidatePath("/pods");
  revalidatePath("/faculty/pod");
  revalidatePath("/faculty/help-desk");
  const q = cohortId && /^[0-9a-f-]{36}$/i.test(cohortId) ? `?cohort=${cohortId}` : "";
  redirect(`/pods${q}`);
}
