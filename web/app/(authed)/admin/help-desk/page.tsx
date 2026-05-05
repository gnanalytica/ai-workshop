import Link from "next/link";
import { Card, CardSub, CardTitle } from "@/components/ui/card";
import { requireCapability } from "@/lib/auth/requireCapability";
import { getAdminCohort } from "@/lib/queries/admin-context";
import { listHelpDeskOpen } from "@/lib/queries/faculty";
import { HelpDeskQueueClient } from "./HelpDeskQueueClient";

export default async function AdminHelpDeskPage() {
  await requireCapability("support.triage");
  const c = await getAdminCohort();
  if (!c) {
    return (
      <Card>
        <CardTitle>No active cohort</CardTitle>
        <CardSub className="mt-1">
          Create or activate a cohort first — help-desk tickets are scoped per cohort.
        </CardSub>
        <Link href="/admin" className="text-accent mt-3 inline-block text-sm">
          ← Back to cohorts
        </Link>
      </Card>
    );
  }
  const items = await listHelpDeskOpen(c.id);

  return (
    <div className="space-y-4">
      <header>
        <p className="text-accent font-mono text-xs tracking-widest uppercase">
          {c.name}
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">Help desk</h1>
        <p className="text-muted mt-1 text-sm">
          Pending and resolved tickets in this cohort. Pending are sorted by
          priority — escalated first, then longest-waiting.
        </p>
      </header>
      <HelpDeskQueueClient cohortId={c.id} items={items} />
    </div>
  );
}
