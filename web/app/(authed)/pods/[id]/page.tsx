import Link from "next/link";
import { notFound } from "next/navigation";
import { requireCapability } from "@/lib/auth/requireCapability";
import { Card, CardSub } from "@/components/ui/card";
import { getFacultyCohort } from "@/lib/queries/faculty";
import { getPodDetail, getPodCandidates } from "@/lib/queries/pod-detail";
import { fmtDateTime, relTime } from "@/lib/format";
import { FacultyOps, MemberOps } from "./PodOpsClient";
import { DeletePodButton } from "./DeletePodButton";

export default async function PodDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const pod = await getPodDetail(id);
  if (!pod) notFound();
  await requireCapability("pods.write", pod.cohort_id);
  const [candidates, facultyCtx] = await Promise.all([
    getPodCandidates(pod.cohort_id, pod.pod_id),
    getFacultyCohort(),
  ]);
  const showCohortBoard = facultyCtx?.cohort.id === pod.cohort_id;

  return (
    <div className="space-y-6">
      <div className="text-muted flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
        <Link href={`/pods?cohort=${pod.cohort_id}`} className="text-accent hover:underline">
          ← All pods
        </Link>
        {showCohortBoard && (
          <Link href="/faculty/cohort#pods-board" className="text-accent hover:underline">
            Cohort board (drag students)
          </Link>
        )}
      </div>
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-accent font-mono text-xs tracking-widest uppercase">Pod</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight break-words sm:text-3xl">{pod.name}</h1>
          {pod.shared_notes && <p className="text-muted mt-2 text-sm">{pod.shared_notes}</p>}
        </div>
        <DeletePodButton podId={pod.pod_id} podName={pod.name} cohortId={pod.cohort_id} />
      </header>

      <Card className="border-line/80 bg-bg-soft">
        <CardSub className="text-ink/85 text-sm leading-relaxed">
          Faculty must already be on the cohort roster. The students shown under Members are
          confirmed students who are not yet in another pod. You can also use the cohort board
          to move several students at the same time.
        </CardSub>
      </Card>

      <section>
        <h2 className="mb-3 text-lg font-semibold tracking-tight">Faculty</h2>
        <Card className="p-4">
          <FacultyOps podId={pod.pod_id} current={pod.faculty} candidates={candidates.faculty} />
        </Card>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold tracking-tight">
          Members ({pod.members.length})
        </h2>
        <Card className="p-4">
          <MemberOps
            podId={pod.pod_id}
            current={pod.members}
            candidates={candidates.unassignedStudents}
          />
        </Card>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold tracking-tight">Recent activity</h2>
        {pod.events.length === 0 ? (
          <Card>
            <CardSub>No events yet.</CardSub>
          </Card>
        ) : (
          <ol className="space-y-2 text-sm">
            {pod.events.map((e) => (
              <li key={e.id} className="border-line border-l-2 pl-3">
                <span className="text-ink">{e.kind}</span>{" "}
                <span className="text-muted">by {e.actor_name ?? "system"}</span>
                <span className="text-muted text-xs">
                  {" "}
                  · {fmtDateTime(e.at)} · {relTime(e.at)}
                </span>
              </li>
            ))}
          </ol>
        )}
      </section>
    </div>
  );
}
