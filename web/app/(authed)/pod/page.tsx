import { Card, CardSub, CardTitle } from "@/components/ui/card";
import { StudentRow } from "@/components/student-row/StudentRow";
import { getMyCurrentCohort } from "@/lib/queries/cohort";
import { getMyPod } from "@/lib/queries/pod";

export default async function MyPodPage() {
  const cohort = await getMyCurrentCohort();
  if (!cohort) return <Card><CardTitle>No active cohort</CardTitle></Card>;
  const pod = await getMyPod(cohort.id);
  if (!pod) {
    return (
      <div className="space-y-4">
        <h1 className="text-3xl font-semibold tracking-tight">My pod</h1>
        <Card>
          <CardTitle>You aren&apos;t in a pod yet</CardTitle>
          <CardSub className="mt-2">
            An admin will assign you shortly. Pods are how you get day-to-day mentorship.
          </CardSub>
        </Card>
      </div>
    );
  }
  return (
    <div className="space-y-6">
      <header>
        <p className="text-accent font-mono text-xs tracking-widest uppercase">My pod</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">{pod.pod_name}</h1>
        {pod.shared_notes && <p className="text-muted mt-2 text-sm">{pod.shared_notes}</p>}
      </header>
      <Card>
        <CardTitle>Your faculty</CardTitle>
        <div className="mt-4 space-y-3">
          {pod.faculty.map((f) => (
            <StudentRow
              key={f.user_id}
              fullName={f.full_name}
              email=""
              avatarUrl={f.avatar_url}
              hint="Mentor"
            />
          ))}
        </div>
      </Card>
    </div>
  );
}
