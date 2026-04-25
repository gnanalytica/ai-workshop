import { cache } from "react";
import { getSupabaseServer } from "@/lib/supabase/server";

export interface AttendanceRow {
  user_id: string;
  full_name: string | null;
  email: string;
  pod_name: string | null;
  by_day: Record<number, "present" | "absent" | "late" | "excused">;
}

/** Build an attendance grid: every confirmed student × every day in cohort. */
export const getAttendanceGrid = cache(
  async (cohortId: string): Promise<AttendanceRow[]> => {
    const sb = await getSupabaseServer();
    const [regs, atts] = await Promise.all([
      sb
        .from("registrations")
        .select("user_id, profiles!inner(full_name, email), pod_members(pods(name))")
        .eq("cohort_id", cohortId)
        .eq("status", "confirmed"),
      sb
        .from("attendance")
        .select("user_id, day_number, status")
        .eq("cohort_id", cohortId),
    ]);

    type RegRow = {
      user_id: string;
      profiles: { full_name: string | null; email: string };
      pod_members: Array<{ pods: { name: string } | null }> | null;
    };

    const map = new Map<string, AttendanceRow>();
    for (const r of (regs.data ?? []) as unknown as RegRow[]) {
      map.set(r.user_id, {
        user_id: r.user_id,
        full_name: r.profiles.full_name,
        email: r.profiles.email,
        pod_name: r.pod_members?.[0]?.pods?.name ?? null,
        by_day: {},
      });
    }
    for (const a of (atts.data ?? []) as unknown as Array<{
      user_id: string;
      day_number: number;
      status: AttendanceRow["by_day"][number];
    }>) {
      const row = map.get(a.user_id);
      if (row) row.by_day[a.day_number] = a.status;
    }
    return [...map.values()].sort((a, b) =>
      (a.full_name ?? a.email).localeCompare(b.full_name ?? b.email),
    );
  },
);
