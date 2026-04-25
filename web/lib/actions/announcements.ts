"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireCapability } from "@/lib/auth/requireCapability";
import { withSupabase, actionFail, type ActionResult } from "./_helpers";

const postSchema = z.object({
  cohort_id: z.string().uuid(),
  title: z.string().min(1).max(200),
  body_md: z.string().min(1).max(20_000),
  audience: z.enum(["all", "students", "faculty", "staff"]).default("all"),
  pinned: z.boolean().default(false),
});

export async function postAnnouncement(input: z.infer<typeof postSchema>): Promise<ActionResult> {
  const parsed = postSchema.safeParse(input);
  if (!parsed.success) return actionFail("Invalid input");
  await requireCapability("announcements.write:cohort", parsed.data.cohort_id);
  return withSupabase(async (sb) => {
    const { data: user } = await sb.auth.getUser();
    return sb
      .from("announcements")
      .insert({
        cohort_id: parsed.data.cohort_id,
        title: parsed.data.title,
        body_md: parsed.data.body_md,
        audience: parsed.data.audience,
        pinned_at: parsed.data.pinned ? new Date().toISOString() : null,
        created_by: user.user?.id ?? null,
      })
      .select()
      .single();
  }, ["/dashboard", "/admin"]);
}

const togglePinSchema = z.object({
  id: z.string().uuid(),
  cohort_id: z.string().uuid(),
  pinned: z.boolean(),
});

export async function togglePinAnnouncement(input: z.infer<typeof togglePinSchema>) {
  const parsed = togglePinSchema.safeParse(input);
  if (!parsed.success) return actionFail("Invalid input");
  await requireCapability("announcements.write:cohort", parsed.data.cohort_id);
  return withSupabase(
    (sb) =>
      sb
        .from("announcements")
        .update({ pinned_at: parsed.data.pinned ? new Date().toISOString() : null })
        .eq("id", parsed.data.id)
        .select()
        .single(),
    ["/dashboard", "/admin"],
  );
}

const deleteSchema = z.object({
  id: z.string().uuid(),
  cohort_id: z.string().uuid(),
});

export async function softDeleteAnnouncement(input: z.infer<typeof deleteSchema>) {
  const parsed = deleteSchema.safeParse(input);
  if (!parsed.success) return actionFail("Invalid input");
  await requireCapability("announcements.write:cohort", parsed.data.cohort_id);
  return withSupabase(
    (sb) =>
      sb
        .from("announcements")
        .update({ deleted_at: new Date().toISOString() })
        .eq("id", parsed.data.id)
        .select()
        .single(),
    ["/dashboard", "/admin"],
  );
}

export async function revalidateAnnouncements() {
  revalidatePath("/dashboard");
  revalidatePath("/admin");
}
