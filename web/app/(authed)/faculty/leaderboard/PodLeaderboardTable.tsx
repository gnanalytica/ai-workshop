"use client";

import { useMemo } from "react";
import { DataTable, type ColumnDef } from "@/components/data-table/DataTable";
import type { PodScoreRow } from "@/lib/queries/faculty-cohort";

type RankedPodScoreRow = PodScoreRow & { rank: number };

interface Props {
  rows: readonly PodScoreRow[];
}

export function PodLeaderboardTable({ rows }: Props) {
  const ranked = useMemo<RankedPodScoreRow[]>(() => {
    const sorted = [...rows].sort((a, b) => b.total_score - a.total_score);
    return sorted.map((r, i) => ({ ...r, rank: i + 1 }));
  }, [rows]);

  const columns: ColumnDef<RankedPodScoreRow>[] = useMemo(
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
        cell: (r) => <span className="text-ink font-medium">{r.pod_name}</span>,
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
    [],
  );

  return (
    <DataTable
      columns={columns}
      rows={ranked}
      rowKey={(r) => r.pod_id}
      searchPlaceholder="Search pods…"
      emptyMessage="No pods yet."
      mobileCard={(r) => (
        <div className="space-y-1.5 text-sm">
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-ink truncate font-semibold">{r.pod_name}</span>
            <span className="text-muted text-xs">#{r.rank}</span>
          </div>
          <div className="text-muted flex items-center justify-between gap-3 text-xs">
            <span>{r.member_count} members</span>
            <span>Avg {r.avg_score}</span>
            <span className="text-accent font-semibold">Total {r.total_score}</span>
          </div>
        </div>
      )}
    />
  );
}
