import { cache } from "react";
import { getSupabaseServer } from "@/lib/supabase/server";

export type ActivityKind = "registration" | "lab" | "submission" | "attendance" | "stuck" | "kudos";

export interface ActivityItem {
  id: string;
  kind: ActivityKind;
  user_name: string | null;
  detail: string;
  at: string;
}

export const listCohortActivity = cache(async (cohortId: string, limit = 40): Promise<ActivityItem[]> => {
  const sb = await getSupabaseServer();
  const [regs, labs, subs, atts, stucks, kudos] = await Promise.all([
    sb.from("registrations").select("user_id, status, updated_at, profiles!inner(full_name)").eq("cohort_id", cohortId).order("updated_at", { ascending: false }).limit(limit),
    sb.from("lab_progress").select("user_id, day_number, lab_id, status, updated_at, profiles!inner(full_name)").eq("cohort_id", cohortId).order("updated_at", { ascending: false }).limit(limit),
    sb.from("submissions").select("id, status, updated_at, profiles:user_id(full_name), assignments!inner(title, day_number, cohort_id)").eq("assignments.cohort_id", cohortId).order("updated_at", { ascending: false }).limit(limit),
    sb.from("attendance").select("user_id, day_number, status, marked_at, profiles!inner(full_name)").eq("cohort_id", cohortId).order("marked_at", { ascending: false }).limit(limit),
    sb.from("stuck_queue").select("id, kind, status, updated_at, profiles:user_id(full_name)").eq("cohort_id", cohortId).order("updated_at", { ascending: false }).limit(limit),
    sb.from("kudos").select("id, note, created_at, from:profiles!from_user_id(full_name), to:profiles!to_user_id(full_name)").eq("cohort_id", cohortId).order("created_at", { ascending: false }).limit(limit),
  ]);

  const items: ActivityItem[] = [];
  for (const r of (regs.data ?? []) as unknown as Array<{ user_id: string; status: string; updated_at: string; profiles: { full_name: string | null } }>) {
    items.push({
      id: `reg-${r.user_id}-${r.updated_at}`,
      kind: "registration",
      user_name: r.profiles.full_name,
      detail: `Registration ${r.status}`,
      at: r.updated_at,
    });
  }
  for (const r of (labs.data ?? []) as unknown as Array<{ user_id: string; day_number: number; lab_id: string; status: string; updated_at: string; profiles: { full_name: string | null } }>) {
    items.push({
      id: `lab-${r.user_id}-${r.day_number}-${r.lab_id}-${r.updated_at}`,
      kind: "lab",
      user_name: r.profiles.full_name,
      detail: `Lab ${r.status} · Day ${r.day_number} · ${r.lab_id}`,
      at: r.updated_at,
    });
  }
  for (const r of (subs.data ?? []) as unknown as Array<{ id: string; status: string; updated_at: string; profiles: { full_name: string | null } | null; assignments: { title: string; day_number: number } | Array<{ title: string; day_number: number }> }>) {
    const a = Array.isArray(r.assignments) ? r.assignments[0] : r.assignments;
    items.push({
      id: `sub-${r.id}`,
      kind: "submission",
      user_name: r.profiles?.full_name ?? null,
      detail: `Submission ${r.status} · Day ${a?.day_number} · ${a?.title}`,
      at: r.updated_at,
    });
  }
  for (const r of (atts.data ?? []) as unknown as Array<{ user_id: string; day_number: number; status: string; marked_at: string; profiles: { full_name: string | null } }>) {
    items.push({
      id: `att-${r.user_id}-${r.day_number}-${r.marked_at}`,
      kind: "attendance",
      user_name: r.profiles.full_name,
      detail: `Attendance ${r.status} · Day ${r.day_number}`,
      at: r.marked_at,
    });
  }
  for (const r of (stucks.data ?? []) as unknown as Array<{ id: string; kind: string; status: string; updated_at: string; profiles: { full_name: string | null } | null }>) {
    items.push({
      id: `stuck-${r.id}-${r.updated_at}`,
      kind: "stuck",
      user_name: r.profiles?.full_name ?? null,
      detail: `Stuck ${r.kind} · ${r.status}`,
      at: r.updated_at,
    });
  }
  for (const r of (kudos.data ?? []) as unknown as Array<{ id: string; note: string; created_at: string; from: { full_name: string | null } | null; to: { full_name: string | null } | null }>) {
    items.push({
      id: `kudo-${r.id}`,
      kind: "kudos",
      user_name: r.from?.full_name ?? null,
      detail: `Kudos to ${r.to?.full_name ?? "—"}: ${r.note}`,
      at: r.created_at,
    });
  }
  items.sort((a, b) => (a.at < b.at ? 1 : -1));
  return items.slice(0, limit);
});
