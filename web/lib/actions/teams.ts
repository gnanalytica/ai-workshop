"use server";

import { z } from "zod";
import { withSupabase, actionFail } from "./_helpers";

const createSchema = z.object({
  cohort_id: z.string().uuid(),
  name: z.string().min(1).max(80),
  description: z.string().max(500).optional(),
});

export async function createTeam(input: z.infer<typeof createSchema>) {
  const parsed = createSchema.safeParse(input);
  if (!parsed.success) return actionFail("Invalid input");
  return withSupabase(async (sb) => {
    const { data: user } = await sb.auth.getUser();
    if (!user.user) return { data: null, error: { message: "Not signed in" } };
    return sb
      .from("teams")
      .insert({
        cohort_id: parsed.data.cohort_id,
        name: parsed.data.name,
        description: parsed.data.description ?? null,
        created_by: user.user.id,
      })
      .select()
      .single();
  }, ["/teams", "/admin/teams"]);
}

const memberSchema = z.object({ team_id: z.string().uuid(), user_id: z.string().uuid().optional() });
export async function joinTeam(input: z.infer<typeof memberSchema>) {
  const parsed = memberSchema.safeParse(input);
  if (!parsed.success) return actionFail("Invalid input");
  return withSupabase(async (sb) => {
    const { data: user } = await sb.auth.getUser();
    const userId = parsed.data.user_id ?? user.user?.id;
    if (!userId) return { data: null, error: { message: "Not signed in" } };
    return sb
      .from("team_members")
      .insert({ team_id: parsed.data.team_id, user_id: userId })
      .select()
      .single();
  }, ["/teams", "/admin/teams"]);
}

export async function leaveTeam(input: z.infer<typeof memberSchema>) {
  const parsed = memberSchema.safeParse(input);
  if (!parsed.success) return actionFail("Invalid input");
  return withSupabase(async (sb) => {
    const { data: user } = await sb.auth.getUser();
    const userId = parsed.data.user_id ?? user.user?.id;
    if (!userId) return { data: null, error: { message: "Not signed in" } };
    return sb
      .from("team_members")
      .delete()
      .eq("team_id", parsed.data.team_id)
      .eq("user_id", userId)
      .select();
  }, ["/teams", "/admin/teams"]);
}
