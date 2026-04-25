"use client";

import { DataTable, type ColumnDef } from "@/components/data-table/DataTable";
import { StudentRow } from "@/components/student-row/StudentRow";
import { Badge } from "@/components/ui/badge";
import { fmtDate } from "@/lib/format";
import type { RosterRow } from "@/lib/queries/admin";

const STATUS_VARIANT: Record<RosterRow["status"], "ok" | "warn" | "default" | "danger"> = {
  confirmed: "ok",
  pending: "warn",
  waitlist: "default",
  cancelled: "danger",
};

const COLUMNS: ColumnDef<RosterRow>[] = [
  {
    id: "name",
    header: "Student",
    cell: (r) => (
      <StudentRow
        fullName={r.full_name}
        email={r.email}
        pod={r.pod_name}
        hint={r.college ?? undefined}
      />
    ),
    accessor: (r) => r.full_name ?? r.email,
  },
  {
    id: "status",
    header: "Status",
    cell: (r) => <Badge variant={STATUS_VARIANT[r.status]}>{r.status}</Badge>,
    accessor: (r) => r.status,
    width: "120px",
  },
  {
    id: "source",
    header: "Source",
    cell: (r) => <span className="text-muted text-xs">{r.source ?? "—"}</span>,
    accessor: (r) => r.source ?? "",
    width: "140px",
  },
  {
    id: "created_at",
    header: "Registered",
    cell: (r) => <span className="text-muted text-xs">{fmtDate(r.created_at)}</span>,
    accessor: (r) => r.created_at,
    width: "140px",
  },
];

export function RosterTable({ rows }: { rows: RosterRow[] }) {
  return (
    <DataTable
      columns={COLUMNS}
      rows={rows}
      rowKey={(r) => r.user_id}
      searchPlaceholder="Search by name, email, college, pod…"
      initialSortId="created_at"
      bulkActions={(selected) => (
        <span className="text-xs">
          {/* Bulk actions wired up via server action in a follow-on PR */}
          {selected.length} selected — actions coming.
        </span>
      )}
    />
  );
}
