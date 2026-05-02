"use server";

import { z } from "zod";
import { requireCapability } from "@/lib/auth/requireCapability";
import { withSupabase, actionFail } from "./_helpers";

const setSchema = z
  .object({
    cohort_id: z.string().uuid(),
    kind: z.enum(["timer", "announcement"]),
    label: z.string().min(1).max(120),
    duration_minutes: z.number().int().min(1).max(240).optional(),
  })
  .refine(
    (v) =>
      (v.kind === "timer" && v.duration_minutes != null) ||
      (v.kind === "announcement" && v.duration_minutes === undefined),
    { message: "duration_minutes required for timer, forbidden for announcement" },
  );

export async function setBanner(input: z.infer<typeof setSchema>) {
  const parsed = setSchema.safeParse(input);
  if (!parsed.success) return actionFail("Invalid input");
  await requireCapability("content.write", parsed.data.cohort_id);
  return withSupabase(async (sb) => {
    const { data: user } = await sb.auth.getUser();
    const ends_at =
      parsed.data.kind === "timer" && parsed.data.duration_minutes != null
        ? new Date(Date.now() + parsed.data.duration_minutes * 60_000).toISOString()
        : null;
    return sb
      .from("cohort_banners")
      .insert({
        cohort_id: parsed.data.cohort_id,
        kind: parsed.data.kind,
        label: parsed.data.label,
        ends_at,
        created_by: user.user?.id ?? null,
      } as never)
      .select("id")
      .single();
  }, `/admin/cohorts/${parsed.data.cohort_id}/live`);
}

const dismissSchema = z.object({
  cohort_id: z.string().uuid(),
  banner_id: z.string().uuid(),
});

export async function dismissBanner(input: z.infer<typeof dismissSchema>) {
  const parsed = dismissSchema.safeParse(input);
  if (!parsed.success) return actionFail("Invalid input");
  await requireCapability("content.write", parsed.data.cohort_id);
  return withSupabase(
    (sb) =>
      sb
        .from("cohort_banners")
        .update({ dismissed_at: new Date().toISOString() } as never)
        .eq("id", parsed.data.banner_id)
        .eq("cohort_id", parsed.data.cohort_id)
        .select("id")
        .single(),
    `/admin/cohorts/${parsed.data.cohort_id}/live`,
  );
}
