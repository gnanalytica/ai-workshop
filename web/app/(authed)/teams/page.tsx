import { Card, CardSub, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getMyCurrentCohort } from "@/lib/queries/cohort";
import { listTeams } from "@/lib/queries/teams";
import { TeamsClient } from "./TeamsClient";

export default async function TeamsPage() {
  const cohort = await getMyCurrentCohort();
  if (!cohort) return <Card><CardTitle>No active cohort</CardTitle></Card>;
  const teams = await listTeams(cohort.id);

  return (
    <div className="space-y-6">
      <header>
        <p className="text-accent font-mono text-xs tracking-widest uppercase">Teams</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">Find your capstone team</h1>
        <CardSub className="mt-1">
          {teams.length} teams formed · join one or start a new team
        </CardSub>
      </header>

      <TeamsClient cohortId={cohort.id} teams={teams} />

      {teams.length > 0 && (
        <section>
          <h2 className="mb-3 text-lg font-semibold tracking-tight">Existing teams</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {teams.map((t) => (
              <Card key={t.id} className="p-4">
                <div className="flex items-baseline justify-between">
                  <CardTitle>{t.name}</CardTitle>
                  <Badge>{t.member_count}</Badge>
                </div>
                <ul className="text-muted mt-2 space-y-1 text-sm">
                  {t.members.map((m) => (
                    <li key={m.user_id}>{m.full_name ?? "—"}</li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
