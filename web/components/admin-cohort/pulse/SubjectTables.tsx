"use client";

import Link from "next/link";
import { DataTable, type ColumnDef } from "@/components/data-table/DataTable";
import { Card, CardSub } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { PulsePodRow } from "./PulsePodsTab";
import type { PulseStudentRow } from "./PulseStudentsTab";

function scoreToneClass(score: number | null): string {
  if (score === null) return "text-muted";
  if (score >= 80) return "text-ok";
  if (score >= 60) return "text-warn";
  return "text-danger";
}

function pctToneClass(pct: number): string {
  if (pct >= 70) return "text-ok";
  if (pct >= 50) return "text-warn";
  if (pct > 0) return "text-danger";
  return "text-muted";
}

const podCommon = {
  rowKey: (r: PulsePodRow) => r.pod_id,
  searchPlaceholder: "Search pods…",
  emptyMessage: "No pods match.",
};

const studentCommon = {
  rowKey: (r: PulseStudentRow) => r.user_id,
  searchPlaceholder: "Search students…",
  emptyMessage: "No students match.",
};

const podNameColumn: ColumnDef<PulsePodRow> = {
  id: "name",
  header: "Pod",
  accessor: (r) => r.name,
  cell: (r) => (
    <div className="space-y-0.5">
      <div className="font-medium">{r.name}</div>
      {r.faculty_names.length > 0 && (
        <div className="text-muted text-xs">{r.faculty_names.join(", ")}</div>
      )}
    </div>
  ),
};

const podMembersColumn: ColumnDef<PulsePodRow> = {
  id: "members",
  header: "Members",
  accessor: (r) => r.member_count,
  cell: (r) => <span className="tabular-nums">{r.member_count}</span>,
  width: "5rem",
};

const studentNameColumn: ColumnDef<PulseStudentRow> = {
  id: "name",
  header: "Student",
  accessor: (r) => r.full_name ?? r.email,
  cell: (r) => (
    <Link href={r.studentHref} className="hover:text-accent block transition-colors">
      <div className="font-medium">{r.full_name ?? r.email}</div>
      {r.full_name && <div className="text-muted text-xs">{r.email}</div>}
    </Link>
  ),
};

const studentPodColumn: ColumnDef<PulseStudentRow> = {
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
};

/* ────────── Assignments tab ────────── */

export function SubmissionsPodsTable({ rows }: { rows: PulsePodRow[] }) {
  if (rows.length === 0) {
    return (
      <Card>
        <CardSub>No pods configured yet.</CardSub>
      </Card>
    );
  }
  const columns: ColumnDef<PulsePodRow>[] = [
    podNameColumn,
    podMembersColumn,
    {
      id: "submissions",
      header: "Submitted",
      accessor: (r) => r.submissions,
      cell: (r) => <span className="tabular-nums">{r.submissions}</span>,
      width: "7rem",
    },
    {
      id: "graded_submissions",
      header: "Graded",
      accessor: (r) => r.graded_submissions,
      cell: (r) => <span className="tabular-nums">{r.graded_submissions}</span>,
      width: "6rem",
    },
    {
      id: "avg_submission_grade",
      header: "Avg grade",
      accessor: (r) => r.avg_submission_grade ?? -1,
      cell: (r) => (
        <span
          className={`tabular-nums font-medium ${scoreToneClass(r.avg_submission_grade)}`}
          title="Avg final submission grade across members"
        >
          {r.avg_submission_grade === null
            ? "—"
            : Math.round(r.avg_submission_grade)}
        </span>
      ),
      width: "7rem",
    },
  ];
  return (
    <DataTable<PulsePodRow>
      {...podCommon}
      columns={columns}
      rows={rows}
      initialSortId="avg_submission_grade"
    />
  );
}

export function SubmissionsStudentsTable({
  rows,
}: {
  rows: PulseStudentRow[];
}) {
  if (rows.length === 0) {
    return (
      <Card>
        <CardSub>No confirmed students.</CardSub>
      </Card>
    );
  }
  const columns: ColumnDef<PulseStudentRow>[] = [
    studentNameColumn,
    studentPodColumn,
    {
      id: "submissions",
      header: "Subs",
      accessor: (r) => r.submissions,
      cell: (r) => <span className="tabular-nums">{r.submissions}</span>,
      width: "5rem",
    },
    {
      id: "graded_submissions",
      header: "Graded",
      accessor: (r) => r.graded_submissions,
      cell: (r) => <span className="tabular-nums">{r.graded_submissions}</span>,
      width: "5rem",
    },
    {
      id: "avg_submission_grade",
      header: "Avg grade",
      accessor: (r) => r.avg_submission_grade ?? -1,
      cell: (r) => (
        <span
          className={`tabular-nums font-medium ${scoreToneClass(r.avg_submission_grade)}`}
        >
          {r.avg_submission_grade === null
            ? "—"
            : Math.round(r.avg_submission_grade)}
        </span>
      ),
      width: "7rem",
    },
  ];
  return (
    <DataTable<PulseStudentRow>
      {...studentCommon}
      columns={columns}
      rows={rows}
      initialSortId="avg_submission_grade"
    />
  );
}

/* ────────── Quizzes tab ────────── */

export function QuizzesPodsTable({ rows }: { rows: PulsePodRow[] }) {
  if (rows.length === 0) {
    return (
      <Card>
        <CardSub>No pods configured yet.</CardSub>
      </Card>
    );
  }
  const columns: ColumnDef<PulsePodRow>[] = [
    podNameColumn,
    podMembersColumn,
    {
      id: "quiz_attempts",
      header: "Attempts",
      accessor: (r) => r.quiz_attempts,
      cell: (r) => <span className="tabular-nums">{r.quiz_attempts}</span>,
      width: "6rem",
    },
    {
      id: "avg_quiz_score",
      header: "Avg quiz",
      accessor: (r) => r.avg_quiz_score ?? -1,
      cell: (r) => (
        <span
          className={`tabular-nums font-medium ${scoreToneClass(r.avg_quiz_score)}`}
          title="Avg best-attempt quiz score across members who attempted"
        >
          {r.avg_quiz_score === null ? "—" : Math.round(r.avg_quiz_score)}
        </span>
      ),
      width: "7rem",
    },
  ];
  return (
    <DataTable<PulsePodRow>
      {...podCommon}
      columns={columns}
      rows={rows}
      initialSortId="avg_quiz_score"
    />
  );
}

export function QuizzesStudentsTable({
  rows,
}: {
  rows: PulseStudentRow[];
}) {
  if (rows.length === 0) {
    return (
      <Card>
        <CardSub>No confirmed students.</CardSub>
      </Card>
    );
  }
  const columns: ColumnDef<PulseStudentRow>[] = [
    studentNameColumn,
    studentPodColumn,
    {
      id: "quiz_attempts",
      header: "Attempts",
      accessor: (r) => r.quiz_attempts,
      cell: (r) => <span className="tabular-nums">{r.quiz_attempts}</span>,
      width: "6rem",
    },
    {
      id: "avg_quiz_score",
      header: "Avg quiz",
      accessor: (r) => r.avg_quiz_score ?? -1,
      cell: (r) => (
        <span
          className={`tabular-nums font-medium ${scoreToneClass(r.avg_quiz_score)}`}
        >
          {r.avg_quiz_score === null ? "—" : Math.round(r.avg_quiz_score)}
        </span>
      ),
      width: "7rem",
    },
  ];
  return (
    <DataTable<PulseStudentRow>
      {...studentCommon}
      columns={columns}
      rows={rows}
      initialSortId="avg_quiz_score"
    />
  );
}

/* ────────── Engagement tab ────────── */

function freshnessBadge(days: number | null) {
  if (days === null)
    return <Badge variant="danger">never</Badge>;
  if (days === 0) return <Badge variant="ok">today</Badge>;
  if (days <= 1) return <Badge variant="ok">1d</Badge>;
  if (days <= 3) return <Badge variant="warn">{days}d</Badge>;
  return <Badge variant="danger">{days}d</Badge>;
}

export function EngagementPodsTable({ rows }: { rows: PulsePodRow[] }) {
  if (rows.length === 0) {
    return (
      <Card>
        <CardSub>No pods configured yet.</CardSub>
      </Card>
    );
  }
  const columns: ColumnDef<PulsePodRow>[] = [
    podNameColumn,
    podMembersColumn,
    {
      id: "avg_recent",
      header: "Recent",
      accessor: (r) => r.avg_recent,
      cell: (r) => (
        <span className={`tabular-nums font-medium ${pctToneClass(r.avg_recent)}`}>
          {Math.round(r.avg_recent)}%
        </span>
      ),
      width: "6rem",
    },
    {
      id: "avg_activity",
      header: "Overall",
      accessor: (r) => r.avg_activity,
      cell: (r) => (
        <span className="tabular-nums">{Math.round(r.avg_activity)}%</span>
      ),
      width: "6rem",
    },
    {
      id: "active_3d",
      header: "Active 3d",
      accessor: (r) => r.active_3d,
      cell: (r) => <span className="text-ok tabular-nums">{r.active_3d}</span>,
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
      {...podCommon}
      columns={columns}
      rows={rows}
      initialSortId="avg_recent"
    />
  );
}

export function EngagementStudentsTable({
  rows,
}: {
  rows: PulseStudentRow[];
}) {
  if (rows.length === 0) {
    return (
      <Card>
        <CardSub>No confirmed students.</CardSub>
      </Card>
    );
  }
  const columns: ColumnDef<PulseStudentRow>[] = [
    studentNameColumn,
    studentPodColumn,
    {
      id: "recent_score",
      header: "Recent",
      accessor: (r) => r.recent_score,
      cell: (r) => (
        <span className={`tabular-nums font-medium ${pctToneClass(r.recent_score)}`}>
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
      accessor: (r) =>
        r.days_since_active === null
          ? Number.MAX_SAFE_INTEGER
          : r.days_since_active,
      cell: (r) => freshnessBadge(r.days_since_active),
      width: "7rem",
    },
  ];
  return (
    <DataTable<PulseStudentRow>
      {...studentCommon}
      columns={columns}
      rows={rows}
      initialSortId="recent_score"
    />
  );
}

/* ────────── Feedback tab ────────── */

export function FeedbackPodsTable({ rows }: { rows: PulsePodRow[] }) {
  if (rows.length === 0) {
    return (
      <Card>
        <CardSub>No pods configured yet.</CardSub>
      </Card>
    );
  }
  const columns: ColumnDef<PulsePodRow>[] = [
    podNameColumn,
    podMembersColumn,
    {
      id: "feedback",
      header: "Responses",
      accessor: (r) => r.feedback,
      cell: (r) => <span className="tabular-nums">{r.feedback}</span>,
      width: "7rem",
    },
  ];
  return (
    <DataTable<PulsePodRow>
      {...podCommon}
      columns={columns}
      rows={rows}
      initialSortId="feedback"
    />
  );
}

export function FeedbackStudentsTable({
  rows,
}: {
  rows: PulseStudentRow[];
}) {
  if (rows.length === 0) {
    return (
      <Card>
        <CardSub>No confirmed students.</CardSub>
      </Card>
    );
  }
  const columns: ColumnDef<PulseStudentRow>[] = [
    studentNameColumn,
    studentPodColumn,
    {
      id: "feedback",
      header: "Responses",
      accessor: (r) => r.feedback,
      cell: (r) => <span className="tabular-nums">{r.feedback}</span>,
      width: "7rem",
    },
  ];
  return (
    <DataTable<PulseStudentRow>
      {...studentCommon}
      columns={columns}
      rows={rows}
      initialSortId="feedback"
    />
  );
}
