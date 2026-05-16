"use client";

import Link from "next/link";
import { DataTable, type ColumnDef } from "@/components/data-table/DataTable";
import { Card, CardSub } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export interface PulseStudentRow {
  user_id: string;
  full_name: string | null;
  email: string;
  pod_name: string | null;
  /** Overall activity score (0–100) — same metric as the at-risk list. */
  score: number;
  /** Last-3-day activity score (0–100). */
  recent_score: number;
  submissions: number;
  quiz_attempts: number;
  feedback: number;
  poll_votes: number;
  lab_progress: number;
  /** Avg best-score across the student's quiz attempts. Null = never attempted. */
  avg_quiz_score: number | null;
  /** Avg final grade across the student's graded submissions. */
  avg_submission_grade: number | null;
  graded_submissions: number;
  /** Days since the student's most recent activity, or null if never. */
  days_since_active: number | null;
  studentHref: string;
}

function toneClass(value: number): string {
  if (value >= 70) return "text-ok";
  if (value >= 50) return "text-warn";
  if (value > 0) return "text-danger";
  return "text-muted";
}

function scoreToneClass(score: number | null): string {
  if (score === null) return "text-muted";
  if (score >= 80) return "text-ok";
  if (score >= 60) return "text-warn";
  return "text-danger";
}

function freshness(days: number | null) {
  if (days === null) return { label: "never", variant: "danger" as const };
  if (days === 0) return { label: "today", variant: "ok" as const };
  if (days === 1) return { label: "1d ago", variant: "ok" as const };
  if (days <= 3) return { label: `${days}d ago`, variant: "warn" as const };
  return { label: `${days}d ago`, variant: "danger" as const };
}

export function PulseStudentsTab({ rows }: { rows: PulseStudentRow[] }) {
  if (rows.length === 0) {
    return (
      <Card>
        <CardSub>No confirmed students in this cohort yet.</CardSub>
      </Card>
    );
  }

  const columns: ColumnDef<PulseStudentRow>[] = [
    {
      id: "name",
      header: "Student",
      accessor: (r) => r.full_name ?? r.email,
      cell: (r) => (
        <Link
          href={r.studentHref}
          className="hover:text-accent block transition-colors"
        >
          <div className="font-medium">{r.full_name ?? r.email}</div>
          {r.full_name && (
            <div className="text-muted text-xs">{r.email}</div>
          )}
        </Link>
      ),
    },
    {
      id: "pod",
      header: "Pod",
      accessor: (r) => r.pod_name ?? "—",
      cell: (r) =>
        r.pod_name ? (
          <span className="text-sm">{r.pod_name}</span>
        ) : (
          <span className="text-muted text-xs">unassigned</span>
        ),
      width: "8rem",
    },
    {
      id: "recent_score",
      header: "Recent",
      accessor: (r) => r.recent_score,
      cell: (r) => (
        <span className={`tabular-nums font-medium ${toneClass(r.recent_score)}`}>
          {Math.round(r.recent_score)}%
        </span>
      ),
      width: "6rem",
    },
    {
      id: "score",
      header: "Overall",
      accessor: (r) => r.score,
      cell: (r) => (
        <span className="tabular-nums">{Math.round(r.score)}%</span>
      ),
      width: "6rem",
    },
    {
      id: "avg_quiz_score",
      header: "Avg quiz",
      accessor: (r) => r.avg_quiz_score ?? -1,
      cell: (r) => (
        <span
          className={`tabular-nums font-medium ${scoreToneClass(r.avg_quiz_score)}`}
          title="Average best-attempt quiz score"
        >
          {r.avg_quiz_score === null ? "—" : Math.round(r.avg_quiz_score)}
        </span>
      ),
      width: "6rem",
    },
    {
      id: "avg_submission_grade",
      header: "Avg grade",
      accessor: (r) => r.avg_submission_grade ?? -1,
      cell: (r) => (
        <span
          className={`tabular-nums font-medium ${scoreToneClass(r.avg_submission_grade)}`}
          title="Average final submission grade"
        >
          {r.avg_submission_grade === null
            ? "—"
            : Math.round(r.avg_submission_grade)}
        </span>
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
    {
      id: "freshness",
      header: "Last active",
      // null/never sorts to the bottom by ?? -1 + dir; we want "longest gap" first
      // by default — pass days_since_active straight (null→treated as worst by
      // DataTable's null-handling).
      accessor: (r) =>
        r.days_since_active === null ? Number.MAX_SAFE_INTEGER : r.days_since_active,
      cell: (r) => {
        const f = freshness(r.days_since_active);
        return <Badge variant={f.variant}>{f.label}</Badge>;
      },
      width: "7rem",
    },
  ];

  return (
    <DataTable<PulseStudentRow>
      columns={columns}
      rows={rows}
      rowKey={(r) => r.user_id}
      searchPlaceholder="Search students…"
      initialSortId="recent_score"
      emptyMessage="No students match that search."
    />
  );
}
