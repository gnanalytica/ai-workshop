"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowser } from "@/lib/supabase/client";

/**
 * Subscribe to row changes on a Supabase table and trigger a soft router
 * refresh so the next render re-fetches server data. One channel per table
 * filter; component lifetime owns it.
 */
export function useTableRefresh(
  table: string,
  filter?: { column: string; value: string },
) {
  const router = useRouter();
  const filterColumn = filter?.column;
  const filterValue = filter?.value;
  useEffect(() => {
    const sb = getSupabaseBrowser();
    const ch = sb
      .channel(`rt:${table}:${filterValue ?? "*"}`)
      .on(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        "postgres_changes" as any,
        {
          event: "*",
          schema: "public",
          table,
          ...(filterColumn && filterValue
            ? { filter: `${filterColumn}=eq.${filterValue}` }
            : {}),
        },
        () => router.refresh(),
      )
      .subscribe();
    return () => {
      sb.removeChannel(ch);
    };
  }, [table, filterColumn, filterValue, router]);
}
