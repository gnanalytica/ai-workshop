import { cache } from "react";
import { getSupabaseServer } from "@/lib/supabase/server";

export interface MyPodFaculty {
  user_id: string;
  full_name: string | null;
  avatar_url: string | null;
}

export interface MyPod {
  pod_id: string;
  pod_name: string;
  mentor_note: string | null;
  faculty: MyPodFaculty[];
}

export const getMyPod = cache(async (cohortId: string): Promise<MyPod | null> => {
  const sb = await getSupabaseServer();
  const { data, error } = await sb.rpc("rpc_my_pod", { p_cohort: cohortId } as never);
  if (error || !data) return null;
  const rows = data as unknown as MyPod[];
  return rows[0] ?? null;
});
