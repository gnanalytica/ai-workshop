import { cache } from "react";
import { getSupabaseServer } from "@/lib/supabase/server";

export interface BuddyPair {
  id: string;
  week_number: number;
  partner_user_id: string;
  partner_name: string | null;
  partner_email: string;
  partner_avatar_url: string | null;
}

export const getMyBuddies = cache(async (cohortId: string): Promise<BuddyPair[]> => {
  const sb = await getSupabaseServer();
  const { data: u } = await sb.auth.getUser();
  if (!u.user) return [];
  const me = u.user.id;
  const { data } = await sb
    .from("buddy_pairs")
    .select("id, week_number, student_a, student_b, a:profiles!buddy_pairs_student_a_fkey(full_name, email, avatar_url), b:profiles!buddy_pairs_student_b_fkey(full_name, email, avatar_url)")
    .eq("cohort_id", cohortId)
    .or(`student_a.eq.${me},student_b.eq.${me}`)
    .order("week_number");
  const rows = (data ?? []) as unknown as Array<{
    id: string; week_number: number; student_a: string; student_b: string;
    a: { full_name: string | null; email: string; avatar_url: string | null } | null;
    b: { full_name: string | null; email: string; avatar_url: string | null } | null;
  }>;
  return rows.map((r) => {
    const meIsA = r.student_a === me;
    const partnerProfile = meIsA ? r.b : r.a;
    return {
      id: r.id,
      week_number: r.week_number,
      partner_user_id: meIsA ? r.student_b : r.student_a,
      partner_name: partnerProfile?.full_name ?? null,
      partner_email: partnerProfile?.email ?? "",
      partner_avatar_url: partnerProfile?.avatar_url ?? null,
    };
  });
});

export interface BuddyAdminRow {
  id: string;
  week_number: number;
  a_name: string | null;
  a_email: string;
  b_name: string | null;
  b_email: string;
}

export const listBuddies = cache(async (cohortId: string): Promise<BuddyAdminRow[]> => {
  const sb = await getSupabaseServer();
  const { data } = await sb
    .from("buddy_pairs")
    .select("id, week_number, a:profiles!buddy_pairs_student_a_fkey(full_name, email), b:profiles!buddy_pairs_student_b_fkey(full_name, email)")
    .eq("cohort_id", cohortId)
    .order("week_number")
    .order("created_at");
  return ((data ?? []) as unknown as Array<{
    id: string; week_number: number;
    a: { full_name: string | null; email: string } | null;
    b: { full_name: string | null; email: string } | null;
  }>).map((r) => ({
    id: r.id,
    week_number: r.week_number,
    a_name: r.a?.full_name ?? null,
    a_email: r.a?.email ?? "—",
    b_name: r.b?.full_name ?? null,
    b_email: r.b?.email ?? "—",
  }));
});
