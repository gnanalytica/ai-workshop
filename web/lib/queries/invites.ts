import { cache } from "react";
import { getSupabaseServer } from "@/lib/supabase/server";

export interface InviteRow {
  id: string;
  code: string;
  kind: "student" | "faculty" | "staff";
  cohort_id: string | null;
  cohort_name: string | null;
  staff_role: "admin" | null;
  max_uses: number;
  redeemed_count: number;
  expires_at: string | null;
  note: string | null;
  created_at: string;
}

export const listInvites = cache(async (): Promise<InviteRow[]> => {
  const sb = await getSupabaseServer();
  const { data } = await sb
    .from("invites")
    .select(
      "id, code, kind, cohort_id, staff_role, max_uses, redeemed_count, expires_at, note, created_at, cohorts(name)",
    )
    .order("created_at", { ascending: false });

  return ((data ?? []) as unknown as Array<{
    id: string;
    code: string;
    kind: InviteRow["kind"];
    cohort_id: string | null;
    staff_role: InviteRow["staff_role"];
    max_uses: number;
    redeemed_count: number;
    expires_at: string | null;
    note: string | null;
    created_at: string;
    cohorts: { name: string } | null;
  }>).map((r) => ({
    id: r.id,
    code: r.code,
    kind: r.kind,
    cohort_id: r.cohort_id,
    cohort_name: r.cohorts?.name ?? null,
    staff_role: r.staff_role,
    max_uses: r.max_uses,
    redeemed_count: r.redeemed_count,
    expires_at: r.expires_at,
    note: r.note,
    created_at: r.created_at,
  }));
});

export const listCohortsForInvites = cache(async () => {
  const sb = await getSupabaseServer();
  const { data } = await sb
    .from("cohorts")
    .select("id, name, slug, status")
    .order("starts_on", { ascending: false });
  return (data ?? []) as Array<{ id: string; name: string; slug: string; status: string }>;
});
