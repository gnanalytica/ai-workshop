"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { withSupabase, actionFail } from "./_helpers";

const githubRe = /^https?:\/\/(www\.)?github\.com\/[A-Za-z0-9._-]+\/[A-Za-z0-9._-]+\/?$/;

const upsertSchema = z.object({
  cohort_id: z.string().uuid(),
  title: z.string().max(140).optional().nullable(),
  problem_statement: z.string().max(2_000).optional().nullable(),
  target_user: z.string().max(280).optional().nullable(),
  repo_url: z
    .string()
    .max(300)
    .optional()
    .nullable()
    .refine(
      (v) => !v || githubRe.test(v),
      "Repo URL must look like https://github.com/owner/repo",
    ),
  demo_url: z
    .string()
    .max(300)
    .optional()
    .nullable()
    .refine((v) => !v || /^https?:\/\//.test(v), "Demo URL must start with http(s)://"),
  status: z.enum(["exploring", "locked", "building", "shipped"]).optional(),
});

export async function upsertMyCapstone(input: z.infer<typeof upsertSchema>) {
  const parsed = upsertSchema.safeParse(input);
  if (!parsed.success) return actionFail(parsed.error.issues[0]?.message ?? "Invalid input");
  const result = await withSupabase(async (sb) => {
    const { data: user } = await sb.auth.getUser();
    if (!user.user) return { data: null, error: { message: "Not signed in" } };
    const payload = {
      cohort_id: parsed.data.cohort_id,
      user_id: user.user.id,
      title: parsed.data.title ?? null,
      problem_statement: parsed.data.problem_statement ?? null,
      target_user: parsed.data.target_user ?? null,
      repo_url: parsed.data.repo_url ? parsed.data.repo_url : null,
      demo_url: parsed.data.demo_url ? parsed.data.demo_url : null,
      ...(parsed.data.status ? { status: parsed.data.status } : {}),
    };
    return sb
      .from("capstone_projects")
      .upsert(payload, { onConflict: "cohort_id,user_id" })
      .select()
      .single();
  });
  revalidatePath("/capstone");
  return result;
}
