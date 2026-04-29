"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireCapability } from "@/lib/auth/requireCapability";
import { getSupabaseServer } from "@/lib/supabase/server";
import { actionFail, actionOk, type ActionResult } from "./_helpers";
import { getFacultyCohort } from "@/lib/queries/faculty";

const reportSchema = z.object({
  cohort_id: z.string().uuid(),
  kind: z.enum(["content", "tech", "team", "other"]),
  message: z.string().min(1).max(1000),
});

export async function reportTicket(input: z.infer<typeof reportSchema>): Promise<ActionResult> {
  const parsed = reportSchema.safeParse(input);
  if (!parsed.success) return actionFail("Invalid input");
  // Caller must be enrolled in this cohort. Without this, a signed-in user
  // could file tickets into a cohort they have no relationship with.
  await requireCapability("self.read", parsed.data.cohort_id);
  const sb = await getSupabaseServer();
  const { data: user } = await sb.auth.getUser();
  if (!user.user) return actionFail("Not signed in");
  const { error } = await sb
    .from("help_desk_queue")
    .insert({
      cohort_id: parsed.data.cohort_id,
      user_id: user.user.id,
      kind: parsed.data.kind,
      message: parsed.data.message,
      status: "open",
    });
  if (error) return actionFail(error.message);
  revalidatePath("/admin/cohorts", "layout");
  revalidatePath("/admin/help-desk");
  revalidatePath("/faculty/help-desk");
  revalidatePath("/faculty/pod");
  revalidatePath("/help-desk");
  revalidatePath("/learn");
  return actionOk();
}

const facultyTechSchema = z.object({
  cohort_id: z.string().uuid(),
  message: z.string().min(1).max(2000),
});

/**
 * Faculty opens a help-desk ticket to platform / tech staff, same lane as a tech
 * escalation (kind `tech`, pre-marked escalated). Only admins can triage these
 * since the author isn't in any pod_members row.
 */
export async function reportFacultyTechTicket(
  input: z.infer<typeof facultyTechSchema>,
): Promise<ActionResult> {
  const parsed = facultyTechSchema.safeParse(input);
  if (!parsed.success) return actionFail("Invalid input");
  const cohortId = parsed.data.cohort_id;
  await requireCapability("support.triage", cohortId);
  const f = await getFacultyCohort();
  if (!f || f.cohort.id !== cohortId) {
    return actionFail("Cohort does not match your active faculty assignment");
  }
  const sb = await getSupabaseServer();
  const { data: user } = await sb.auth.getUser();
  if (!user.user) return actionFail("Not signed in");
  const now = new Date().toISOString();
  const { error } = await sb
    .from("help_desk_queue")
    .insert({
      cohort_id: cohortId,
      user_id: user.user.id,
      kind: "tech",
      message: parsed.data.message.trim(),
      status: "open",
      escalated_at: now,
      escalated_by: user.user.id,
      escalation_note: "Faculty request — routed to platform / tech (direct).",
    });
  if (error) return actionFail(error.message);
  revalidatePath("/admin/cohorts", "layout");
  revalidatePath("/admin/help-desk");
  revalidatePath("/faculty/help-desk");
  revalidatePath("/faculty/pod");
  revalidatePath("/help-desk");
  revalidatePath("/learn");
  return actionOk();
}

const claimSchema = z.object({ id: z.string().uuid() });

export async function claimTicket(input: z.infer<typeof claimSchema>): Promise<ActionResult> {
  const parsed = claimSchema.safeParse(input);
  if (!parsed.success) return actionFail("Invalid input");
  const sb = await getSupabaseServer();
  const { error } = await sb.rpc("rpc_claim_help_desk_ticket", { p_id: parsed.data.id } as never);
  if (error) return actionFail(error.message);
  revalidatePath("/admin/cohorts", "layout");
  revalidatePath("/faculty/help-desk");
  revalidatePath("/faculty/pod");
  revalidatePath("/help-desk");
  revalidatePath("/learn");
  return actionOk();
}

const resolveSchema = z.object({
  id: z.string().uuid(),
  cohort_id: z.string().uuid(),
  resolution: z.string().max(1000).optional(),
});

export async function resolveTicket(input: z.infer<typeof resolveSchema>): Promise<ActionResult> {
  const parsed = resolveSchema.safeParse(input);
  if (!parsed.success) return actionFail("Invalid input");
  await requireCapability("support.triage", parsed.data.cohort_id);
  const sb = await getSupabaseServer();
  const { error } = await sb
    .from("help_desk_queue")
    .update({ status: "resolved", resolution: parsed.data.resolution ?? null })
    .eq("id", parsed.data.id);
  if (error) return actionFail(error.message);
  revalidatePath("/admin/cohorts", "layout");
  revalidatePath("/admin/help-desk");
  revalidatePath("/faculty/help-desk");
  revalidatePath("/faculty/pod");
  revalidatePath("/help-desk");
  revalidatePath("/learn");
  return actionOk();
}

const escalateSchema = z.object({
  id: z.string().uuid(),
  cohort_id: z.string().uuid(),
  note: z.string().min(1).max(1000),
});

export async function escalateTicket(input: z.infer<typeof escalateSchema>): Promise<ActionResult> {
  const parsed = escalateSchema.safeParse(input);
  if (!parsed.success) return actionFail("Invalid input");
  await requireCapability("support.escalate", parsed.data.cohort_id);
  const sb = await getSupabaseServer();
  const { data: user } = await sb.auth.getUser();
  if (!user.user) return actionFail("Not signed in");
  const { error } = await sb
    .from("help_desk_queue")
    .update({
      escalated_at: new Date().toISOString(),
      escalated_by: user.user.id,
      escalation_note: parsed.data.note,
      kind: "tech",
    })
    .eq("id", parsed.data.id);
  if (error) return actionFail(error.message);
  revalidatePath("/admin/cohorts", "layout");
  revalidatePath("/faculty/help-desk");
  revalidatePath("/faculty/pod");
  revalidatePath("/help-desk");
  revalidatePath("/learn");
  return actionOk();
}
