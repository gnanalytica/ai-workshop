"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { DataTable, type ColumnDef } from "@/components/data-table/DataTable";
import { StudentRow } from "@/components/student-row/StudentRow";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { fmtDate, exportCsv } from "@/lib/format";
import type { RosterRow } from "@/lib/queries/admin";
import { bulkUpdateRegistrationStatus, updateRegistrationStatus } from "@/lib/actions/roster";

const STATUS_VARIANT: Record<RosterRow["status"], "ok" | "warn" | "default" | "danger"> = {
  confirmed: "ok",
  pending: "warn",
  waitlist: "default",
  cancelled: "danger",
};

function RowStatus({
  row,
  cohortId,
  disabled,
  onChange,
}: {
  row: RosterRow;
  cohortId: string;
  disabled: boolean;
  onChange: (status: RosterRow["status"]) => void;
}) {
  return (
    <select
      value={row.status}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value as RosterRow["status"])}
      data-cohort={cohortId}
      className="border-line bg-input-bg text-ink rounded-md border px-2 py-1 text-xs"
    >
      <option value="pending">pending</option>
      <option value="confirmed">confirmed</option>
      <option value="waitlist">waitlist</option>
      <option value="cancelled">cancelled</option>
    </select>
  );
}

const COLUMNS: ColumnDef<RosterRow>[] = [
  {
    id: "name",
    header: "Student",
    cell: (r) => (
      <StudentRow fullName={r.full_name} email={r.email} pod={r.pod_name} hint={r.college ?? undefined} />
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

export function RosterTable({ rows, cohortId }: { rows: RosterRow[]; cohortId: string }) {
  const [pending, start] = useTransition();

  const bulk = (status: "confirmed" | "cancelled" | "waitlist") => (selected: RosterRow[]) => {
    start(async () => {
      const result = await bulkUpdateRegistrationStatus({
        cohort_id: cohortId,
        user_ids: selected.map((s) => s.user_id),
        status,
      });
      if (result.ok) toast.success(`Marked ${selected.length} as ${status}`);
      else toast.error(result.error);
    });
  };

  const rowChange = (row: RosterRow, status: RosterRow["status"]) => {
    start(async () => {
      const r = await updateRegistrationStatus({
        cohort_id: cohortId,
        user_id: row.user_id,
        status,
      });
      if (r.ok) toast.success(`Marked ${row.full_name ?? row.email} as ${status}`);
      else toast.error(r.error);
    });
  };

  const columns: ColumnDef<RosterRow>[] = [
    ...COLUMNS.filter((c) => c.id !== "status"),
    {
      id: "status",
      header: "Status",
      cell: (r) => <RowStatus row={r} cohortId={cohortId} disabled={pending} onChange={(s) => rowChange(r, s)} />,
      accessor: (r) => r.status,
      width: "140px",
    },
  ];

  return (
    <DataTable
      columns={columns}
      rows={rows}
      rowKey={(r) => r.user_id}
      searchPlaceholder="Search by name, email, college, pod…"
      initialSortId="created_at"
      mobileCard={(r) => (
        <div className="flex flex-col gap-2">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <StudentRow
                fullName={r.full_name}
                email={r.email}
                pod={r.pod_name}
                hint={r.college ?? undefined}
              />
            </div>
            <Badge variant={STATUS_VARIANT[r.status]}>{r.status}</Badge>
          </div>
          <div className="text-muted flex items-center justify-between text-xs">
            <span>{r.source ?? "—"}</span>
            <span>{fmtDate(r.created_at)}</span>
          </div>
          <RowStatus row={r} cohortId={cohortId} disabled={pending} onChange={(s) => rowChange(r, s)} />
        </div>
      )}
      bulkActions={(selected) => (
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" disabled={pending} onClick={() => bulk("confirmed")(selected)}>
            Confirm
          </Button>
          <Button size="sm" variant="outline" disabled={pending} onClick={() => bulk("waitlist")(selected)}>
            Waitlist
          </Button>
          <Button size="sm" variant="danger" disabled={pending} onClick={() => bulk("cancelled")(selected)}>
            Cancel
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() =>
              exportCsv(`roster-${cohortId.slice(0, 8)}`, selected, [
                { header: "Name", value: (r) => r.full_name ?? "" },
                { header: "Email", value: (r) => r.email },
                { header: "College", value: (r) => r.college ?? "" },
                { header: "Status", value: (r) => r.status },
                { header: "Pod", value: (r) => r.pod_name ?? "" },
                { header: "Source", value: (r) => r.source ?? "" },
                { header: "Registered", value: (r) => fmtDate(r.created_at) },
              ])
            }
          >
            Export CSV
          </Button>
        </div>
      )}
    />
  );
}
