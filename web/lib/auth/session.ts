import { cache } from "react";
import { getSupabaseServer } from "@/lib/supabase/server";
import type { Capability } from "@/lib/rbac/capabilities";

export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  staff_roles: string[];
}

/** Current user's auth session, or null. Cached per request. */
export const getSession = cache(async () => {
  const sb = await getSupabaseServer();
  const { data, error } = await sb.auth.getUser();
  if (error || !data.user) return null;
  return data.user;
});

/** Profile row for the current user (joined with auth.uid()). */
export const getProfile = cache(async (): Promise<UserProfile | null> => {
  const sb = await getSupabaseServer();
  const user = await getSession();
  if (!user) return null;
  const { data, error } = await sb
    .from("profiles")
    .select("id, email, full_name, avatar_url, staff_roles")
    .eq("id", user.id)
    .single();
  if (error) return null;
  return data as UserProfile;
});

/** Capabilities for the current user, scoped to a cohort if given. */
export const getAuthCaps = cache(async (cohortId?: string | null): Promise<Capability[]> => {
  const sb = await getSupabaseServer();
  const { data, error } = await sb.rpc("auth_caps", {
    p_cohort: cohortId ?? null,
  } as never);
  if (error || !data) return [];
  return (data as unknown as string[]).filter(Boolean) as Capability[];
});
