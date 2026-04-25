import { Card, CardTitle } from "@/components/ui/card";
import { StudentRow } from "@/components/student-row/StudentRow";
import { getMyCurrentCohort } from "@/lib/queries/cohort";
import { listClassmates } from "@/lib/queries/people";

export default async function PeoplePage() {
  const cohort = await getMyCurrentCohort();
  if (!cohort) return <Card><CardTitle>No active cohort</CardTitle></Card>;
  const classmates = await listClassmates(cohort.id);
  return (
    <div className="space-y-6">
      <header>
        <p className="text-accent font-mono text-xs tracking-widest uppercase">{cohort.name}</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">Classmates</h1>
        <p className="text-muted mt-1 text-sm">{classmates.length} confirmed students.</p>
      </header>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {classmates.map((c) => (
          <Card key={c.user_id} className="p-4">
            <StudentRow
              fullName={c.full_name}
              email={c.email}
              avatarUrl={c.avatar_url}
              pod={c.pod_name}
              hint={c.college ?? undefined}
            />
          </Card>
        ))}
      </div>
    </div>
  );
}
