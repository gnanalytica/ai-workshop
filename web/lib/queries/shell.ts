import { getSupabaseServer } from "@/lib/supabase/server";
import type { Capability } from "@/lib/rbac/capabilities";
import type { ActiveBanner } from "@/lib/queries/banners";
import type { ActivePoll } from "@/lib/queries/polls";

export interface ShellState {
  caps: Capability[];
  banner: ActiveBanner | null;
  poll: ActivePoll | null;
}

interface ShellRow {
  caps: string[] | null;
  banner: ActiveBanner | null;
  poll: ActivePoll | null;
}

/**
 * Combined RPC for AppShell SSR — replaces three parallel helpers
 * (auth_caps, rpc_active_banner, rpc_active_poll) with one round-trip.
 * See migration 0085.
 *
 * Returns empty/null fields if the underlying RPC fails so the shell still
 * renders. Capability checks downstream then behave like an unauthenticated
 * caller, which is the intended fail-closed shape.
 */
export async function getShellState(
  cohortId: string | null,
): Promise<ShellState> {
  const sb = await getSupabaseServer();
  const { data, error } = await (sb.rpc as unknown as (
    fn: string,
    args: Record<string, unknown>,
  ) => Promise<{ data: ShellRow | null; error: unknown }>)("rpc_shell_state", {
    p_cohort: cohortId,
  });

  if (error || !data) {
    return { caps: [], banner: null, poll: null };
  }

  return {
    caps: ((data.caps ?? []) as string[]).filter(Boolean) as Capability[],
    banner: data.banner ?? null,
    poll: data.poll ?? null,
  };
}
