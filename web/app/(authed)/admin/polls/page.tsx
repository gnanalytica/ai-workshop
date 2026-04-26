import { requireCapability } from "@/lib/auth/requireCapability";
import { Card, CardSub, CardTitle } from "@/components/ui/card";
import { getAdminCohort } from "@/lib/queries/admin-context";
import { listPolls } from "@/lib/queries/polls";
import { PollsClient } from "./PollsClient";
import { PollRow } from "./PollRow";

export default async function AdminPollsPage() {
  await requireCapability("content.write");
  const cohort = await getAdminCohort();
  if (!cohort) return <Card><CardTitle>No cohort</CardTitle></Card>;
  const polls = await listPolls(cohort.id);

  return (
    <div className="space-y-6">
      <header>
        <p className="text-accent font-mono text-xs tracking-widest uppercase">Polls</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">{cohort.name}</h1>
        <CardSub className="mt-1">
          {polls.length} polls · {polls.filter((p) => !p.closed_at).length} open
        </CardSub>
      </header>

      <PollsClient cohortId={cohort.id} />

      {polls.length === 0 ? (
        <Card><CardSub>No polls yet.</CardSub></Card>
      ) : (
        <div className="space-y-3">
          {polls.map((p) => (
            <PollRow key={p.id} poll={p} cohortId={cohort.id} />
          ))}
        </div>
      )}
    </div>
  );
}
