"use client";

import { useMemo } from "react";
import { DataTable, type ColumnDef } from "@/components/data-table/DataTable";
import type { TeamScoreRow } from "@/lib/queries/faculty-cohort";

type RankedTeamScoreRow = TeamScoreRow & { rank: number };

interface Props {
  rows: readonly TeamScoreRow[];
}

export function TeamLeaderboardTable({ rows }: Props) {
  const ranked = useMemo<RankedTeamScoreRow[]>(() => {
    const sorted = [...rows].sort((a, b) => b.total_score - a.total_score);
    return sorted.map((r, i) => ({ ...r, rank: i + 1 }));
  }, [rows]);

  const columns: ColumnDef<RankedTeamScoreRow>[] = useMemo(
    () => [
      {
        id: "rank",
        header: "#",
        accessor: (r) => r.rank,
        cell: (r) => <span className="text-muted">{r.rank}</span>,
        width: "3rem",
      },
      {
        id: "team",
        header: "Team",
        accessor: (r) => r.team_name,
        cell: (r) => <span className="text-ink font-medium">{r.team_name}</span>,
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
      rowKey={(r) => r.team_id}
      searchPlaceholder="Search teams…"
      emptyMessage="No teams yet."
    />
  );
}
