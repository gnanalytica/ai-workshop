"use client";

import { useMemo } from "react";
import { DataTable, type ColumnDef } from "@/components/data-table/DataTable";
import type { RankedPodMemberRow } from "@/lib/queries/pod-leaderboard";

interface Props {
  rows: readonly RankedPodMemberRow[];
  myUserId: string | null;
}

export function MyPodMembersTable({ rows, myUserId }: Props) {
  const columns: ColumnDef<RankedPodMemberRow>[] = useMemo(
    () => [
      {
        id: "rank",
        header: "#",
        accessor: (r) => r.rank,
        cell: (r) => <span className="text-muted">{r.rank}</span>,
        width: "3rem",
      },
      {
        id: "student",
        header: "Student",
        accessor: (r) => r.full_name ?? "",
        cell: (r) => {
          const mine = myUserId && r.user_id === myUserId;
          return (
            <span
              className={
                mine ? "text-ink font-semibold" : "text-ink font-medium"
              }
            >
              {mine ? "You" : r.full_name ?? "—"}
            </span>
          );
        },
      },
      {
        id: "total",
        header: "Total",
        accessor: (r) => r.total_score,
        cell: (r) => (
          <span className="text-accent font-semibold">{r.total_score}</span>
        ),
        className: "text-right",
      },
    ],
    [myUserId],
  );

  const rowClassName = (row: RankedPodMemberRow): string | undefined => {
    if (myUserId && row.user_id === myUserId) {
      return "bg-accent/5 border-l-2 border-l-accent";
    }
    return undefined;
  };

  return (
    <DataTable
      columns={columns}
      rows={rows}
      rowKey={(r) => r.user_id}
      searchPlaceholder="Search pod members…"
      emptyMessage="No scores in your pod yet."
      rowClassName={rowClassName}
      mobileCard={(r) => {
        const mine = myUserId && r.user_id === myUserId;
        return (
          <div
            className={
              "space-y-1.5 text-sm" +
              (mine ? " border-l-2 border-l-accent pl-2" : "")
            }
          >
            <div className="flex items-baseline justify-between gap-2">
              <span
                className={
                  "text-ink truncate " +
                  (mine ? "font-semibold" : "font-medium")
                }
              >
                <span className="text-muted mr-1.5">#{r.rank}</span>
                {mine ? "You" : r.full_name ?? "—"}
              </span>
              <span className="text-accent font-semibold">
                {r.total_score}
              </span>
            </div>
          </div>
        );
      }}
    />
  );
}
