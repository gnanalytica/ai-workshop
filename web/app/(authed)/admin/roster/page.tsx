import { requireCapability } from "@/lib/auth/requireCapability";
import { Card, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getAdminCohort } from "@/lib/queries/admin-context";
import { listRoster } from "@/lib/queries/admin";
import { RosterTable } from "./RosterTable";

export default async function RosterPage() {
  await requireCapability("roster.read");
  const cohort = await getAdminCohort();
  if (!cohort) return <Card><CardTitle>No cohort</CardTitle></Card>;
  const rows = await listRoster(cohort.id);

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-accent font-mono text-xs tracking-widest uppercase">Roster</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">{cohort.name}</h1>
          <p className="text-muted mt-1 text-sm">
            {rows.length} total · {rows.filter((r) => r.status === "confirmed").length} confirmed ·{" "}
            {rows.filter((r) => r.status === "pending").length} pending
          </p>
        </div>
        <div className="flex gap-2">
          <Badge variant="ok">Confirmed</Badge>
          <Badge variant="warn">Pending</Badge>
          <Badge>Waitlist</Badge>
        </div>
      </header>
      <RosterTable rows={rows} cohortId={cohort.id} />
    </div>
  );
}
