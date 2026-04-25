import { requireCapability } from "@/lib/auth/requireCapability";
import { Card, CardSub, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getAdminCohort } from "@/lib/queries/admin-context";
import { listPolls } from "@/lib/queries/polls";
import { fmtDateTime } from "@/lib/format";
import { PollsClient } from "./PollsClient";

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
            <Card key={p.id} className="p-4">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <CardTitle>{p.question}</CardTitle>
                <div className="flex items-center gap-2">
                  {p.day_number && <Badge>Day {p.day_number}</Badge>}
                  <Badge variant={p.closed_at ? "default" : "ok"}>
                    {p.closed_at ? "Closed" : "Open"}
                  </Badge>
                  <Badge>{p.vote_count} votes</Badge>
                </div>
              </div>
              <ul className="text-muted mt-3 space-y-1 text-sm">
                {p.options.map((o) => (<li key={o.id}>· {o.label}</li>))}
              </ul>
              <p className="text-muted mt-3 text-xs">
                Opened {fmtDateTime(p.opened_at)}
                {p.closed_at && ` · closed ${fmtDateTime(p.closed_at)}`}
              </p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
