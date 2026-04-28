import Link from "next/link";
import { requireCapability } from "@/lib/auth/requireCapability";
import { Card, CardSub, CardTitle } from "@/components/ui/card";
import { PodCard } from "@/components/pod-card/PodCard";
import { listPods } from "@/lib/queries/admin";
import { getFacultyCohort } from "@/lib/queries/faculty";
import { resolvePodsPageCohort } from "@/lib/pods/resolvePodsCohort";
import { CreatePodForm } from "./CreatePodForm";

export default async function PodsPage({
  searchParams,
}: {
  searchParams: Promise<{ cohort?: string }>;
}) {
  const { cohort: cohortParam } = await searchParams;
  const [cohort, facultyCtx] = await Promise.all([
    resolvePodsPageCohort(cohortParam ?? null),
    getFacultyCohort(),
  ]);
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
  const cohortQuery = `cohort=${cohort.id}`;
  const facultyOwnCohort = facultyCtx?.cohort.id === cohort.id;

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
        {facultyOwnCohort && (
          <Link
            href="/faculty/cohort#pods-board"
            className="text-accent shrink-0 text-sm font-medium hover:underline"
          >
            Cohort drag-and-drop board →
          </Link>
        )}
      </header>

      {facultyOwnCohort && (
        <Card className="border-accent/30 bg-accent/5">
          <CardTitle className="text-base">Faculty</CardTitle>
          <CardSub className="text-ink/90 mt-1 text-sm leading-relaxed">
            Open a pod below to add faculty and manage the roster. Use the{" "}
            <Link href="/faculty/cohort#pods-board" className="text-accent font-medium hover:underline">
              cohort board
            </Link>{" "}
            to move students between pods in bulk.
          </CardSub>
        </Card>
      )}

      <Card id="create-pod" className="scroll-mt-24">
        <CardTitle>{pods.length === 0 ? "Create first pod" : "New pod"}</CardTitle>
        <CardSub className="mt-1 mb-3">
          {pods.length === 0
            ? "Add a name and optional faculty note, then open the pod from the grid to attach faculty and students."
            : "Create another pod for this cohort. Then open it to attach faculty and students."}
        </CardSub>
        <CreatePodForm cohortId={cohort.id} />
      </Card>

      {pods.length === 0 ? (
        <Card>
          <CardTitle>No pods in the grid yet</CardTitle>
          <CardSub className="mt-2 space-y-2">
            <p>Use the form above to create your first pod, then open it from the grid to assign people.</p>
            {facultyOwnCohort && (
              <p>
                Tip: you can also create pods from{" "}
                <Link href="/faculty/cohort#pods" className="text-accent hover:underline">
                  Cohort → Pods
                </Link>
                .
              </p>
            )}
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
              href={`/pods/${p.pod_id}?${cohortQuery}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
