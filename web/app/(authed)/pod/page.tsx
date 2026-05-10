import Link from "next/link";
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
        <header>
          <p className="text-accent font-mono text-xs tracking-widest uppercase">My pod</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">No pod yet</h1>
        </header>
        <Card>
          <CardTitle>You aren&apos;t in a pod yet</CardTitle>
          <CardSub className="mt-2">
            Pods are assigned by Day 2. Once your admin sorts the cohort,
            you&apos;ll see your pod here. Your pod is where day-to-day
            faculty coaching happens.
          </CardSub>
          <div className="mt-3">
            <Link href="/people" className="text-accent text-sm hover:underline">
              Meet your full classmates list →
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div data-tour="pod-page" className="space-y-6">
      <header>
        <p className="text-accent font-mono text-xs tracking-widest uppercase">My pod</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">{pod.pod_name}</h1>
        <p className="text-muted mt-1 text-sm">
          {pod.podmates.length + 1} student{pod.podmates.length === 0 ? "" : "s"}
          {pod.faculty.length > 0 && ` · coached by ${pod.faculty.length} faculty`}
        </p>
        {pod.shared_notes && (
          <p className="text-ink/85 bg-bg-soft border-line/60 mt-3 rounded-md border p-3 text-sm">
            {pod.shared_notes}
          </p>
        )}
      </header>

      <section>
        <div className="mb-3 flex items-baseline justify-between gap-2">
          <h2 className="text-lg font-semibold tracking-tight">Your podmates</h2>
          <span className="text-muted text-xs">
            {pod.podmates.length} {pod.podmates.length === 1 ? "person" : "people"}
          </span>
        </div>
        {pod.podmates.length === 0 ? (
          <Card>
            <CardSub>
              You&apos;re the only student in this pod right now. As your admin
              sorts the cohort, more classmates will land here.
            </CardSub>
          </Card>
        ) : (
          <Card>
            <div className="space-y-3">
              {pod.podmates.map((m) => (
                <StudentRow
                  key={m.user_id}
                  fullName={m.full_name}
                  email={m.email ?? ""}
                  avatarUrl={m.avatar_url}
                  hint={m.college ?? undefined}
                />
              ))}
            </div>
          </Card>
        )}
      </section>

      <section>
        <div className="mb-3 flex items-baseline justify-between gap-2">
          <h2 className="text-lg font-semibold tracking-tight">Faculty</h2>
          <span className="text-muted text-xs">Coaching this pod</span>
        </div>
        {pod.faculty.length === 0 ? (
          <Card>
            <CardSub>
              A faculty member will be assigned to your pod by Day 2. Until
              then, the help desk routes to whichever faculty is on call.
            </CardSub>
          </Card>
        ) : (
          <Card>
            <div className="space-y-3">
              {pod.faculty.map((f) => (
                <StudentRow
                  key={f.user_id}
                  fullName={f.full_name}
                  email=""
                  avatarUrl={f.avatar_url}
                  hint="Faculty"
                />
              ))}
            </div>
          </Card>
        )}
      </section>
    </div>
  );
}
