import { cache } from "react";
import { getSupabaseServer } from "@/lib/supabase/server";

export interface Classmate {
  user_id: string;
  full_name: string | null;
  email: string;
  avatar_url: string | null;
  college: string | null;
  pod_name: string | null;
}

export const listClassmates = cache(async (cohortId: string): Promise<Classmate[]> => {
  const sb = await getSupabaseServer();
  const { data } = await sb
    .from("registrations")
    .select(
      "user_id, profiles!inner(id, full_name, email, avatar_url, college), pod_members(pod_id, pods(name))",
    )
    .eq("cohort_id", cohortId)
    .eq("status", "confirmed");
  return ((data ?? []) as unknown as Array<{
    user_id: string;
    profiles: { full_name: string | null; email: string; avatar_url: string | null; college: string | null };
    pod_members: Array<{ pods: { name: string } | null }> | null;
  }>).map((r) => ({
    user_id: r.user_id,
    full_name: r.profiles.full_name,
    email: r.profiles.email,
    avatar_url: r.profiles.avatar_url,
    college: r.profiles.college,
    pod_name: r.pod_members?.[0]?.pods?.name ?? null,
  }));
});
