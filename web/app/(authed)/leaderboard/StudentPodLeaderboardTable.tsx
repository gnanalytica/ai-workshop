"use client";

import { useMemo } from "react";
import { DataTable, type ColumnDef } from "@/components/data-table/DataTable";
import type { RankedPodSummaryRow } from "@/lib/queries/pod-leaderboard";

interface Props {
  rows: readonly RankedPodSummaryRow[];
  myPodId: string | null;
}

export function StudentPodLeaderboardTable({ rows, myPodId }: Props) {
  const columns: ColumnDef<RankedPodSummaryRow>[] = useMemo(
    () => [
      {
        id: "rank",
        header: "#",
        accessor: (r) => r.rank,
        cell: (r) => <span className="text-muted">{r.rank}</span>,
        width: "3rem",
      },
      {
        id: "pod",
        header: "Pod",
        accessor: (r) => r.pod_name,
        cell: (r) => {
          const mine = myPodId && r.pod_id === myPodId;
          return (
            <span
              className={
                mine
                  ? "text-ink font-semibold"
                  : "text-ink font-medium"
              }
            >
              {r.pod_name}
              {mine && (
                <span className="text-accent ml-2 text-xs font-normal uppercase tracking-wide">
                  · you
                </span>
              )}
            </span>
          );
        },
      },
      {
        id: "members",
        header: "Members",
        accessor: (r) => r.member_count,
        cell: (r) => r.member_count,
        className: "text-right",
      },
      {
        id: "avg",
        header: "Avg",
        accessor: (r) => r.avg_score,
        cell: (r) => r.avg_score,
        className: "text-right",
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
    [myPodId],
  );

  const rowClassName = (row: RankedPodSummaryRow): string | undefined => {
    if (myPodId && row.pod_id === myPodId) {
      return "bg-accent/5 border-l-2 border-l-accent";
    }
    return undefined;
  };

  return (
    <DataTable
      columns={columns}
      rows={rows}
      rowKey={(r) => r.pod_id}
      searchPlaceholder="Search pods…"
      emptyMessage="No pods yet."
      rowClassName={rowClassName}
      mobileCard={(r) => {
        const mine = myPodId && r.pod_id === myPodId;
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
                {r.pod_name}
                {mine && (
                  <span className="text-accent ml-1.5 text-xs font-normal uppercase">
                    · you
                  </span>
                )}
              </span>
              <span className="text-muted text-xs">#{r.rank}</span>
            </div>
            <div className="text-muted flex items-center justify-between gap-3 text-xs">
              <span>{r.member_count} members</span>
              <span>Avg {r.avg_score}</span>
              <span className="text-accent font-semibold">
                Total {r.total_score}
              </span>
            </div>
          </div>
        );
      }}
    />
  );
}
