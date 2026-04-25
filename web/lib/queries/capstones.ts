import { cache } from "react";
import { getSupabaseServer } from "@/lib/supabase/server";

export interface CapstoneRow {
  id: string;
  cohort_id: string;
  owner_user_id: string;
  owner_name: string | null;
  title: string;
  phase: "idea" | "spec" | "mid" | "demo" | "shipped";
  is_public: boolean;
  demo_url: string | null;
  repo_url: string | null;
  updated_at: string;
}

export const listCapstones = cache(async (cohortId: string): Promise<CapstoneRow[]> => {
  const sb = await getSupabaseServer();
  const { data } = await sb
    .from("capstones")
    .select("id, cohort_id, owner_user_id, title, phase, is_public, demo_url, repo_url, updated_at, profiles:owner_user_id(full_name)")
    .eq("cohort_id", cohortId)
    .order("updated_at", { ascending: false });
  return ((data ?? []) as unknown as Array<{
    id: string; cohort_id: string; owner_user_id: string; title: string;
    phase: CapstoneRow["phase"]; is_public: boolean; demo_url: string | null; repo_url: string | null;
    updated_at: string; profiles: { full_name: string | null } | null;
  }>).map((c) => ({
    id: c.id,
    cohort_id: c.cohort_id,
    owner_user_id: c.owner_user_id,
    owner_name: c.profiles?.full_name ?? null,
    title: c.title,
    phase: c.phase,
    is_public: c.is_public,
    demo_url: c.demo_url,
    repo_url: c.repo_url,
    updated_at: c.updated_at,
  }));
});

export const listPublicCapstones = cache(async (): Promise<CapstoneRow[]> => {
  const sb = await getSupabaseServer();
  const { data } = await sb
    .from("capstones")
    .select("id, cohort_id, owner_user_id, title, phase, is_public, demo_url, repo_url, updated_at, profiles:owner_user_id(full_name)")
    .eq("is_public", true)
    .order("updated_at", { ascending: false })
    .limit(60);
  return ((data ?? []) as unknown as Array<{
    id: string; cohort_id: string; owner_user_id: string; title: string;
    phase: CapstoneRow["phase"]; is_public: boolean; demo_url: string | null; repo_url: string | null;
    updated_at: string; profiles: { full_name: string | null } | null;
  }>).map((c) => ({
    id: c.id,
    cohort_id: c.cohort_id,
    owner_user_id: c.owner_user_id,
    owner_name: c.profiles?.full_name ?? null,
    title: c.title,
    phase: c.phase,
    is_public: c.is_public,
    demo_url: c.demo_url,
    repo_url: c.repo_url,
    updated_at: c.updated_at,
  }));
});
