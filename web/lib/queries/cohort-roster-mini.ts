import { cache } from "react";
import { getSupabaseServer } from "@/lib/supabase/server";

export interface RosterMember {
  user_id: string;
  full_name: string | null;
  kind: "student" | "faculty";
}

/** Compact roster (id + name) for mention autocomplete. */
export const listCohortRoster = cache(async (cohortId: string): Promise<RosterMember[]> => {
  const sb = await getSupabaseServer();
  const [{ data: regs }, { data: fac }] = await Promise.all([
    sb
      .from("registrations")
      .select("user_id, profiles!inner(full_name)")
      .eq("cohort_id", cohortId)
      .eq("status", "confirmed"),
    sb
      .from("cohort_faculty")
      .select("user_id, profiles!inner(full_name)")
      .eq("cohort_id", cohortId),
  ]);
  type Row = { user_id: string; profiles: { full_name: string | null } };
  const seen = new Set<string>();
  const out: RosterMember[] = [];
  for (const r of (regs ?? []) as unknown as Row[]) {
    if (seen.has(r.user_id)) continue;
    seen.add(r.user_id);
    out.push({ user_id: r.user_id, full_name: r.profiles.full_name, kind: "student" });
  }
  for (const r of (fac ?? []) as unknown as Row[]) {
    if (seen.has(r.user_id)) continue;
    seen.add(r.user_id);
    out.push({ user_id: r.user_id, full_name: r.profiles.full_name, kind: "faculty" });
  }
  return out
    .filter((r) => !!r.full_name)
    .sort((a, b) => (a.full_name ?? "").localeCompare(b.full_name ?? ""));
});
