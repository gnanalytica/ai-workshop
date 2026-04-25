import { requireCapability } from "@/lib/auth/requireCapability";
import { Card, CardSub, CardTitle } from "@/components/ui/card";
import { getAdminCohort } from "@/lib/queries/admin-context";
import { listStuckOpen } from "@/lib/queries/faculty";
import { StuckQueueClient } from "./StuckQueueClient";

export default async function StuckPage() {
  await requireCapability("support.triage");
  const cohort = await getAdminCohort();
  if (!cohort) return <Card><CardTitle>No cohort</CardTitle></Card>;
  const items = await listStuckOpen(cohort.id);

  return (
    <div className="space-y-6">
      <header>
        <p className="text-accent font-mono text-xs tracking-widest uppercase">Stuck queue</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">{cohort.name}</h1>
        <CardSub className="mt-1">{items.length} open · live triage feed</CardSub>
      </header>
      <StuckQueueClient cohortId={cohort.id} items={items} />
    </div>
  );
}
