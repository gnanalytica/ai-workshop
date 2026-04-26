import { requireCapability } from "@/lib/auth/requireCapability";
import { Card, CardSub, CardTitle } from "@/components/ui/card";
import { PodCard } from "@/components/pod-card/PodCard";
import { listPods } from "@/lib/queries/admin";
import { getUserCohort } from "@/lib/queries/user-cohort";
import { CreatePodForm } from "./CreatePodForm";

export default async function PodsPage() {
  const cohort = await getUserCohort();
  if (!cohort) {
    return (
      <Card>
        <CardTitle>No cohort</CardTitle>
        <CardSub className="mt-2">You don&apos;t have access to any cohort yet.</CardSub>
      </Card>
    );
  }
  await requireCapability("pods.write", cohort.id);
  const pods = await listPods(cohort.id);

  return (
    <div className="space-y-6">
      <header className="flex items-start justify-between gap-4">
        <div>
          <p className="text-accent font-mono text-xs tracking-widest uppercase">Pods</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">{cohort.name}</h1>
          <p className="text-muted mt-1 text-sm">
            {pods.length} pods · {pods.reduce((s, p) => s + p.member_count, 0)} students placed
          </p>
        </div>
      </header>

      <Card>
        <CardTitle>New pod</CardTitle>
        <CardSub className="mt-1 mb-3">
          Create a pod for this cohort. You can assign faculty and students after.
        </CardSub>
        <CreatePodForm cohortId={cohort.id} />
      </Card>

      {pods.length === 0 ? (
        <Card>
          <CardTitle>No pods yet</CardTitle>
          <CardSub className="mt-2">
            Create your first pod above, then assign faculty and students.
          </CardSub>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {pods.map((p) => (
            <PodCard
              key={p.pod_id}
              podId={p.pod_id}
              name={p.name}
              memberCount={p.member_count}
              facultyCount={p.faculty_count}
              facultyNames={p.faculty_names}
              href={`/pods/${p.pod_id}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
