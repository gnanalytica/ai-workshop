"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { DataTable, type ColumnDef } from "@/components/data-table/DataTable";
import type { ScoreRow } from "@/lib/queries/faculty-cohort";

type RankedScoreRow = ScoreRow & { rank: number };

interface Props {
  rows: readonly ScoreRow[];
  myPodName: string | null;
  /** Current viewer's user id, used to highlight their own row. */
  viewerUserId?: string | null;
  /** When true, student names link to the faculty drill page. Faculty/admin only. */
  canDrillIntoStudents?: boolean;
}

export function StudentLeaderboardTable({
  rows,
  myPodName,
  viewerUserId = null,
  canDrillIntoStudents = false,
}: Props) {
  const [highlight, setHighlight] = useState(false);

  const ranked = useMemo<RankedScoreRow[]>(() => {
    const sorted = [...rows].sort((a, b) => b.total_score - a.total_score);
    return sorted.map((r, i) => ({ ...r, rank: i + 1 }));
  }, [rows]);

  const columns: ColumnDef<RankedScoreRow>[] = useMemo(
    () => [
      {
        id: "rank",
        header: "#",
        accessor: (r) => r.rank,
        cell: (r) => (
          <span
            className={
              viewerUserId && r.user_id === viewerUserId
                ? "text-accent font-semibold"
                : "text-muted"
            }
          >
            {r.rank}
          </span>
        ),
        width: "3rem",
      },
      {
        id: "student",
        header: "Student",
        accessor: (r) => r.full_name ?? "",
        cell: (r) => {
          const isMe = viewerUserId && r.user_id === viewerUserId;
          const label = (
            <>
              {r.full_name ?? "—"}
              {isMe && (
                <span className="bg-accent/15 text-accent ml-2 rounded-full px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider">
                  You
                </span>
              )}
            </>
          );
          return canDrillIntoStudents ? (
            <Link
              href={`/faculty/student/${r.user_id}`}
              className="text-ink hover:text-accent font-medium"
            >
              {label}
            </Link>
          ) : (
            <span className="text-ink font-medium">{label}</span>
          );
        },
      },
      {
        id: "pod",
        header: "Pod",
        accessor: (r) => r.pod_name ?? "",
        cell: (r) => <span className="text-muted">{r.pod_name ?? "—"}</span>,
      },
      {
        id: "quiz",
        header: "Quiz",
        accessor: (r) => r.quiz_score,
        cell: (r) => r.quiz_score,
        className: "text-right",
      },
      {
        id: "subs",
        header: "Subs",
        accessor: (r) => r.submission_score,
        cell: (r) => r.submission_score,
        className: "text-right",
      },
      {
        id: "activity",
        header: "Activity",
        accessor: (r) => r.activity_score,
        cell: (r) => r.activity_score,
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
    [viewerUserId, canDrillIntoStudents],
  );

  const rowClassName = (row: RankedScoreRow): string | undefined => {
    if (viewerUserId && row.user_id === viewerUserId) {
      return "bg-accent/10 ring-1 ring-accent/30";
    }
    if (highlight && myPodName && row.pod_name === myPodName) {
      return "bg-accent/5";
    }
    return undefined;
  };

  return (
    <div className="space-y-3">
      {myPodName && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => setHighlight((h) => !h)}
            className={
              "rounded-full border px-3 py-1 text-xs font-medium transition-colors " +
              (highlight
                ? "border-accent bg-accent/10 text-accent"
                : "border-line text-muted hover:text-ink")
            }
          >
            Highlight my pod
          </button>
        </div>
      )}
      <DataTable
        columns={columns}
        rows={ranked}
        rowKey={(r) => r.user_id}
        searchPlaceholder="Search students or pods…"
        emptyMessage="No scores yet."
        rowClassName={rowClassName}
        mobileCard={(r) => {
          const isMe = viewerUserId && r.user_id === viewerUserId;
          const Name = canDrillIntoStudents ? (
            <Link
              href={`/faculty/student/${r.user_id}`}
              className="text-ink hover:text-accent truncate font-medium"
            >
              <span className="text-muted mr-1.5">#{r.rank}</span>
              {r.full_name ?? "—"}
            </Link>
          ) : (
            <span className="text-ink truncate font-medium">
              <span className="text-muted mr-1.5">#{r.rank}</span>
              {r.full_name ?? "—"}
            </span>
          );
          return (
            <div className="space-y-1.5 text-sm">
              <div className="flex items-baseline justify-between gap-2">
                {Name}
                {isMe && (
                  <span className="bg-accent/15 text-accent shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider">
                    You
                  </span>
                )}
              </div>
              <div className="text-muted flex items-center justify-between gap-2 text-xs">
                <span className="truncate">{r.pod_name ?? "—"}</span>
                <span className="text-accent font-semibold">Total {r.total_score}</span>
              </div>
              <div className="text-muted flex flex-wrap gap-x-3 gap-y-0.5 text-xs">
                <span>Quiz {r.quiz_score}</span>
                <span>Subs {r.submission_score}</span>
                <span>Activity {r.activity_score}</span>
              </div>
            </div>
          );
        }}
      />
    </div>
  );
}
