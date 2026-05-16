"use client";

import { DataTable, type ColumnDef } from "@/components/data-table/DataTable";
import { Card, CardSub } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export interface PulsePodRow {
  pod_id: string;
  name: string;
  member_count: number;
  faculty_names: string[];
  /** Avg overall activity score across pod members (0–100). */
  avg_activity: number;
  /** Avg recent-3-day score across pod members (0–100). */
  avg_recent: number;
  /** Members active in the last 3 days (recent_score > 0). */
  active_3d: number;
  /** Members with no activity for >=3 days (or never active). */
  inactive_3d: number;
  submissions: number;
  quiz_attempts: number;
  feedback: number;
  poll_votes: number;
  lab_progress: number;
}

function pct(n: number) {
  return `${Math.round(n)}%`;
}

function toneClass(value: number): string {
  if (value >= 70) return "text-ok";
  if (value >= 50) return "text-warn";
  if (value > 0) return "text-danger";
  return "text-muted";
}

export function PulsePodsTab({ rows }: { rows: PulsePodRow[] }) {
  if (rows.length === 0) {
    return (
      <Card>
        <CardSub>No pods have been created yet for this cohort.</CardSub>
      </Card>
    );
  }

  const columns: ColumnDef<PulsePodRow>[] = [
    {
      id: "name",
      header: "Pod",
      accessor: (r) => r.name,
      cell: (r) => (
        <div className="space-y-0.5">
          <div className="font-medium">{r.name}</div>
          {r.faculty_names.length > 0 && (
            <div className="text-muted text-xs">
              {r.faculty_names.join(", ")}
            </div>
          )}
        </div>
      ),
    },
    {
      id: "members",
      header: "Members",
      accessor: (r) => r.member_count,
      cell: (r) => <span className="tabular-nums">{r.member_count}</span>,
      width: "5rem",
    },
    {
      id: "avg_recent",
      header: "Recent activity",
      accessor: (r) => r.avg_recent,
      cell: (r) => (
        <span className={`tabular-nums font-medium ${toneClass(r.avg_recent)}`}>
          {pct(r.avg_recent)}
        </span>
      ),
      width: "8rem",
    },
    {
      id: "avg_activity",
      header: "Overall activity",
      accessor: (r) => r.avg_activity,
      cell: (r) => (
        <span className="tabular-nums">{pct(r.avg_activity)}</span>
      ),
      width: "8rem",
    },
    {
      id: "active_3d",
      header: "Active 3d",
      accessor: (r) => r.active_3d,
      cell: (r) => (
        <span className="text-ok tabular-nums">{r.active_3d}</span>
      ),
      width: "6rem",
    },
    {
      id: "inactive_3d",
      header: "Inactive 3d",
      accessor: (r) => r.inactive_3d,
      cell: (r) =>
        r.inactive_3d === 0 ? (
          <span className="text-muted tabular-nums">0</span>
        ) : (
          <Badge variant={r.inactive_3d > 2 ? "danger" : "warn"}>
            {r.inactive_3d}
          </Badge>
        ),
      width: "6rem",
    },
    {
      id: "submissions",
      header: "Subs",
      accessor: (r) => r.submissions,
      cell: (r) => <span className="tabular-nums">{r.submissions}</span>,
      width: "5rem",
    },
    {
      id: "quiz_attempts",
      header: "Quiz",
      accessor: (r) => r.quiz_attempts,
      cell: (r) => <span className="tabular-nums">{r.quiz_attempts}</span>,
      width: "5rem",
    },
    {
      id: "feedback",
      header: "★ FB",
      accessor: (r) => r.feedback,
      cell: (r) => <span className="tabular-nums">{r.feedback}</span>,
      width: "5rem",
    },
    {
      id: "poll_votes",
      header: "Polls",
      accessor: (r) => r.poll_votes,
      cell: (r) => <span className="tabular-nums">{r.poll_votes}</span>,
      width: "5rem",
    },
    {
      id: "lab_progress",
      header: "Labs",
      accessor: (r) => r.lab_progress,
      cell: (r) => <span className="tabular-nums">{r.lab_progress}</span>,
      width: "5rem",
    },
  ];

  return (
    <DataTable<PulsePodRow>
      columns={columns}
      rows={rows}
      rowKey={(r) => r.pod_id}
      searchPlaceholder="Search pods…"
      initialSortId="avg_recent"
      emptyMessage="No pods match that search."
    />
  );
}
