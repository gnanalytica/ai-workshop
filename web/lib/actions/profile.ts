"use server";

import { z } from "zod";
import { withSupabase, actionFail } from "./_helpers";

const profileSchema = z.object({
  full_name: z.string().trim().min(1).max(120),
  college: z.string().trim().max(120).nullable().optional(),
  avatar_url: z.string().trim().url().nullable().optional().or(z.literal("")),
});

export async function updateMyProfile(input: z.infer<typeof profileSchema>) {
  const parsed = profileSchema.safeParse(input);
  if (!parsed.success) return actionFail("Invalid input");
  return withSupabase(async (sb) => {
    const { data: u } = await sb.auth.getUser();
    if (!u.user) return { data: null, error: { message: "Not signed in" } };
    return sb
      .from("profiles")
      .update({
        full_name: parsed.data.full_name,
        college: parsed.data.college || null,
        avatar_url: parsed.data.avatar_url || null,
      })
      .eq("id", u.user.id)
      .select()
      .single();
  }, "/settings/profile");
}
