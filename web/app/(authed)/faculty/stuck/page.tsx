import { requireCapability } from "@/lib/auth/requireCapability";
import { getSession } from "@/lib/auth/session";
import { Card, CardSub, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getFacultyCohort } from "@/lib/queries/faculty";
import { listFacultyStuck } from "@/lib/queries/faculty-stuck";
import { relTime } from "@/lib/format";
import { StuckActions } from "./StuckActions";

export default async function FacultyStuckPage() {
  await requireCapability("support.triage");
  const f = await getFacultyCohort();
  const me = await getSession();
  if (!f || !me) return <Card><CardTitle>You aren&apos;t assigned to a cohort.</CardTitle></Card>;

  const items = await listFacultyStuck(f.cohort.id, me.id);

  const open = items.filter((i) => i.status !== "resolved");
  const recent = items.filter((i) => i.status === "resolved").slice(0, 10);

  return (
    <div className="space-y-6">
      <header>
        <p className="text-accent font-mono text-xs tracking-widest uppercase">
          {f.cohort.name} · Help desk · your pod
        </p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">Help desk</h1>
        <p className="text-muted mt-1 text-sm">
          Open tickets from students in your pod. Claim when you&apos;re helping, resolve when it&apos;s fixed.
          Escalate (or route to tech) if it needs cohort staff or platform help.
        </p>
      </header>

      <section>
        <h2 className="mb-3 text-lg font-semibold tracking-tight">Open</h2>
        {open.length === 0 ? (
          <Card><CardSub>No open tickets for your pod right now.</CardSub></Card>
        ) : (
          <div className="space-y-2">
            {open.map((s) => (
              <Card key={s.id} className="flex items-start justify-between gap-3 p-4">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-ink text-sm font-medium">{s.user_name ?? "—"}</span>
                    {s.pod_name && <Badge>{s.pod_name}</Badge>}
                    <Badge variant={s.kind === "tech" ? "danger" : "warn"}>{s.kind}</Badge>
                    <Badge variant={s.status === "helping" ? "accent" : "default"}>{s.status}</Badge>
                    {s.escalated_at && <Badge variant="danger">escalated</Badge>}
                    <span className="text-muted text-xs">{relTime(s.created_at)}</span>
                  </div>
                  {s.message && <p className="text-ink/85 mt-2 text-sm">{s.message}</p>}
                  {s.claimed_by_name && (
                    <p className="text-muted mt-1 text-xs">helping: {s.claimed_by_name}</p>
                  )}
                  {s.escalation_note && (
                    <p className="text-danger mt-1 text-xs">escalation: {s.escalation_note}</p>
                  )}
                </div>
                <StuckActions
                  id={s.id}
                  cohortId={f.cohort.id}
                  status={s.status}
                  alreadyEscalated={!!s.escalated_at}
                />
              </Card>
            ))}
          </div>
        )}
      </section>

      {recent.length > 0 && (
        <section>
          <h2 className="mb-3 text-lg font-semibold tracking-tight">Recently resolved</h2>
          <Card>
            <ul className="divide-y divide-line/50">
              {recent.map((s) => (
                <li key={s.id} className="flex items-center justify-between py-2 text-sm">
                  <div>
                    <span className="text-ink">{s.user_name ?? "—"}</span>
                    {s.pod_name && <span className="text-muted ml-2">· {s.pod_name}</span>}
                    {s.message && (
                      <span className="text-muted ml-2 truncate">· {s.message.slice(0, 80)}</span>
                    )}
                  </div>
                  <span className="text-muted text-xs">{relTime(s.created_at)}</span>
                </li>
              ))}
            </ul>
          </Card>
        </section>
      )}
    </div>
  );
}
