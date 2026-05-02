import { getSupabaseServer } from "@/lib/supabase/server";

export interface ActiveBanner {
  id: string;
  kind: "timer" | "announcement";
  label: string;
  ends_at: string | null;
  created_at: string;
}

export async function getActiveBanner(cohortId: string): Promise<ActiveBanner | null> {
  const sb = await getSupabaseServer();
  const { data } = await (sb.rpc as unknown as (
    fn: string,
    args: Record<string, unknown>,
  ) => Promise<{
    data:
      | {
          id: string;
          kind: "timer" | "announcement";
          label: string;
          ends_at: string | null;
          created_at: string;
        }
      | Array<{
          id: string;
          kind: "timer" | "announcement";
          label: string;
          ends_at: string | null;
          created_at: string;
        }>
      | null;
  }>)("rpc_active_banner", { p_cohort: cohortId });
  if (!data) return null;
  const row = Array.isArray(data) ? data[0] ?? null : data;
  if (!row) return null;
  return {
    id: row.id,
    kind: row.kind,
    label: row.label,
    ends_at: row.ends_at,
    created_at: row.created_at,
  };
}
