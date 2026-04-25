import { requireCapability } from "@/lib/auth/requireCapability";
import { Card, CardSub, CardTitle } from "@/components/ui/card";
import { PodCard } from "@/components/pod-card/PodCard";
import { getAdminCohort } from "@/lib/queries/admin-context";
import { listPods } from "@/lib/queries/admin";

export default async function AdminPodsPage() {
  await requireCapability("pods.write");
  const cohort = await getAdminCohort();
  if (!cohort) return <Card><CardTitle>No cohort</CardTitle></Card>;
  const pods = await listPods(cohort.id);

  return (
    <div className="space-y-6">
      <header>
        <p className="text-accent font-mono text-xs tracking-widest uppercase">Pods</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">{cohort.name}</h1>
        <p className="text-muted mt-1 text-sm">
          {pods.length} pods · {pods.reduce((s, p) => s + p.member_count, 0)} students placed
        </p>
      </header>
      {pods.length === 0 ? (
        <Card><CardTitle>No pods yet</CardTitle><CardSub className="mt-2">Use the &ldquo;New pod&rdquo; action (CSV import or manual) to get started.</CardSub></Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {pods.map((p) => (
            <PodCard
              key={p.pod_id}
              podId={p.pod_id}
              name={p.name}
              memberCount={p.member_count}
              facultyCount={p.faculty_count}
              primaryFaculty={p.primary_name}
              href={`/admin/pods/${p.pod_id}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
