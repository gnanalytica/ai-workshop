import { cache } from "react";
import { getSupabaseServer } from "@/lib/supabase/server";

export interface TeamRow {
  id: string;
  cohort_id: string;
  name: string;
  member_count: number;
  members: { user_id: string; full_name: string | null }[];
}

export const listTeams = cache(async (cohortId: string): Promise<TeamRow[]> => {
  const sb = await getSupabaseServer();
  // Teams aren't in the new schema yet — we'll read from the legacy `teams`
  // table when it gets added. For now this query falls back to empty if the
  // table doesn't exist.
  const { data, error } = await sb
    .from("teams")
    .select("id, cohort_id, name, team_members(user_id, profiles(full_name))")
    .eq("cohort_id", cohortId)
    .order("name");
  if (error) return [];
  return ((data ?? []) as unknown as Array<{
    id: string; cohort_id: string; name: string;
    team_members: Array<{ user_id: string; profiles: { full_name: string | null } | null }>;
  }>).map((t) => ({
    id: t.id,
    cohort_id: t.cohort_id,
    name: t.name,
    member_count: t.team_members.length,
    members: t.team_members.map((m) => ({ user_id: m.user_id, full_name: m.profiles?.full_name ?? null })),
  }));
});
