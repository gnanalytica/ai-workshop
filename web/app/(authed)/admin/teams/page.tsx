import { requireCapability } from "@/lib/auth/requireCapability";
import { Card, CardSub, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getAdminCohort } from "@/lib/queries/admin-context";
import { listTeams } from "@/lib/queries/teams";

export default async function AdminTeamsPage() {
  await requireCapability("roster.read");
  const cohort = await getAdminCohort();
  if (!cohort) return <Card><CardTitle>No cohort</CardTitle></Card>;
  const teams = await listTeams(cohort.id);

  return (
    <div className="space-y-6">
      <header>
        <p className="text-accent font-mono text-xs tracking-widest uppercase">Teams</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">{cohort.name}</h1>
        <CardSub className="mt-1">
          {teams.length} teams · {teams.reduce((s, t) => s + t.member_count, 0)} memberships
        </CardSub>
      </header>
      {teams.length === 0 ? (
        <Card><CardTitle>No teams yet</CardTitle><CardSub className="mt-2">Students form their own teams from /teams.</CardSub></Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {teams.map((t) => (
            <Card key={t.id} className="p-5">
              <div className="flex items-baseline justify-between">
                <CardTitle>{t.name}</CardTitle>
                <Badge>{t.member_count} {t.member_count === 1 ? "member" : "members"}</Badge>
              </div>
              <ul className="text-muted mt-3 space-y-1 text-sm">
                {t.members.map((m) => (
                  <li key={m.user_id}>{m.full_name ?? "—"}</li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
