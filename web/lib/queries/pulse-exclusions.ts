import { cache } from "react";
import { getSupabaseServer } from "@/lib/supabase/server";

/**
 * Returns the user_ids of every student in an admin-named pod for the cohort
 * (any pod whose name matches `/\badmin\b/i` — e.g. "Gnanalytica Admin").
 *
 * Used by every Pulse analytics query to exclude staff/ops accounts from
 * cohort-wide metrics, so a single admin user in a confirmed registration
 * doesn't show up in the engagement / score / feedback rollups.
 */
export const getAdminPodUserIds = cache(
  async (cohortId: string): Promise<string[]> => {
    const sb = await getSupabaseServer();
    const { data } = await sb
      .from("pods")
      .select("name, pod_members(student_user_id)")
      .eq("cohort_id", cohortId);
    const out: string[] = [];
    for (const p of (data ?? []) as Array<{
      name: string;
      pod_members: Array<{ student_user_id: string }>;
    }>) {
      if (/\badmin\b/i.test(p.name)) {
        for (const m of p.pod_members) out.push(m.student_user_id);
      }
    }
    return out;
  },
);
