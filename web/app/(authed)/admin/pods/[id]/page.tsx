import { notFound } from "next/navigation";
import { requireCapability } from "@/lib/auth/requireCapability";
import { Card, CardSub } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StudentRow } from "@/components/student-row/StudentRow";
import { getPodDetail } from "@/lib/queries/pod-detail";
import { fmtDateTime, relTime } from "@/lib/format";

export default async function PodDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const pod = await getPodDetail(id);
  if (!pod) notFound();
  await requireCapability("pods.write", pod.cohort_id);

  return (
    <div className="space-y-6">
      <header>
        <p className="text-accent font-mono text-xs tracking-widest uppercase">Pod</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">{pod.name}</h1>
        {pod.mentor_note && <p className="text-muted mt-2 text-sm">{pod.mentor_note}</p>}
      </header>

      <section>
        <h2 className="mb-3 text-lg font-semibold tracking-tight">Faculty</h2>
        <div className="space-y-2">
          {pod.faculty.length === 0 ? (
            <Card><CardSub>No faculty assigned.</CardSub></Card>
          ) : (
            pod.faculty.map((f) => (
              <Card key={f.user_id} className="flex items-center justify-between p-4">
                <StudentRow fullName={f.full_name} email="" hint={f.is_primary ? "Primary" : "Mentor"} />
                {f.is_primary && <Badge variant="accent">Primary</Badge>}
              </Card>
            ))
          )}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold tracking-tight">Members ({pod.members.length})</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {pod.members.map((m) => (
            <Card key={m.user_id} className="p-4">
              <StudentRow fullName={m.full_name} email={m.email} />
            </Card>
          ))}
        </div>
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
