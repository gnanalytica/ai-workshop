import { cache } from "react";
import { getSupabaseServer } from "@/lib/supabase/server";

export interface MyHelpDeskRow {
  id: string;
  kind: "content" | "tech" | "team" | "other";
  status: "open" | "helping" | "resolved" | "cancelled";
  message: string | null;
  resolution: string | null;
  created_at: string;
  updated_at: string;
  escalated_at: string | null;
  queue_position: number | null;
  open_in_cohort: number;
}

/**
 * The caller’s tickets in a cohort, with FIFO position among all open
 * tickets in that cohort (via rpc_my_help_desk_tickets).
 */
export const listMyHelpDeskTickets = cache(
  async (cohortId: string): Promise<MyHelpDeskRow[]> => {
    const sb = await getSupabaseServer();
    const { data, error } = await sb.rpc("rpc_my_help_desk_tickets", {
      p_cohort_id: cohortId,
    } as never);
    if (error) return [];
    return (data ?? []) as MyHelpDeskRow[];
  },
);
