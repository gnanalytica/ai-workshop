import { notFound } from "next/navigation";
import { requireCapability } from "@/lib/auth/requireCapability";
import { Card, CardSub } from "@/components/ui/card";
import { getPodDetail, getPodCandidates } from "@/lib/queries/pod-detail";
import { fmtDateTime, relTime } from "@/lib/format";
import { FacultyOps, MemberOps } from "./PodOpsClient";

export default async function PodDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const pod = await getPodDetail(id);
  if (!pod) notFound();
  await requireCapability("pods.write", pod.cohort_id);
  const candidates = await getPodCandidates(pod.cohort_id, pod.pod_id);

  return (
    <div className="space-y-6">
      <header>
        <p className="text-accent font-mono text-xs tracking-widest uppercase">Pod</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">{pod.name}</h1>
        {pod.mentor_note && <p className="text-muted mt-2 text-sm">{pod.mentor_note}</p>}
      </header>

      <section>
        <h2 className="mb-3 text-lg font-semibold tracking-tight">Faculty</h2>
        <Card className="p-4">
          <FacultyOps podId={pod.pod_id} current={pod.faculty} candidates={candidates.faculty} />
        </Card>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold tracking-tight">Members ({pod.members.length})</h2>
        <Card className="p-4">
          <MemberOps podId={pod.pod_id} current={pod.members} candidates={candidates.unassignedStudents} />
        </Card>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold tracking-tight">Recent activity</h2>
        {pod.events.length === 0 ? (
          <Card><CardSub>No events yet.</CardSub></Card>
        ) : (
          <ol className="space-y-2 text-sm">
            {pod.events.map((e) => (
              <li key={e.id} className="border-line border-l-2 pl-3">
                <span className="text-ink">{e.kind}</span>{" "}
                <span className="text-muted">by {e.actor_name ?? "system"}</span>
                <span className="text-muted text-xs"> · {fmtDateTime(e.at)} · {relTime(e.at)}</span>
              </li>
            ))}
          </ol>
        )}
      </section>
    </div>
  );
}
