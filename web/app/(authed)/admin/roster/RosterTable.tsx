"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { DataTable, type ColumnDef } from "@/components/data-table/DataTable";
import { StudentRow } from "@/components/student-row/StudentRow";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { fmtDate } from "@/lib/format";
import type { RosterRow } from "@/lib/queries/admin";
import { bulkUpdateRegistrationStatus } from "@/lib/actions/roster";

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

  return (
    <DataTable
      columns={COLUMNS}
      rows={rows}
      rowKey={(r) => r.user_id}
      searchPlaceholder="Search by name, email, college, pod…"
      initialSortId="created_at"
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
        </div>
      )}
    />
  );
}
