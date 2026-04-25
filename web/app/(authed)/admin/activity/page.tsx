import { requireCapability } from "@/lib/auth/requireCapability";
import { Card, CardSub, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getAdminCohort } from "@/lib/queries/admin-context";
import { listCohortActivity, type ActivityKind } from "@/lib/queries/activity";
import { fmtDateTime, relTime } from "@/lib/format";

const KIND_TONE: Record<ActivityKind, "default" | "ok" | "warn" | "accent" | "danger"> = {
  registration: "accent",
  lab: "ok",
  submission: "ok",
  attendance: "default",
  stuck: "warn",
  kudos: "accent",
};

export default async function AdminActivityPage() {
  await requireCapability("roster.read");
  const cohort = await getAdminCohort();
  if (!cohort) return <Card><CardTitle>No cohort</CardTitle></Card>;
  const items = await listCohortActivity(cohort.id, 60);

  return (
    <div className="space-y-6">
      <header>
        <p className="text-accent font-mono text-xs tracking-widest uppercase">Activity</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">{cohort.name}</h1>
        <CardSub className="mt-1">{items.length} most-recent events across the cohort</CardSub>
      </header>

      {items.length === 0 ? (
        <Card><CardSub>Nothing to show yet.</CardSub></Card>
      ) : (
        <ol className="border-line space-y-2 border-l-2 pl-5">
          {items.map((it) => (
            <li key={it.id} className="relative">
              <span className="bg-accent absolute -left-[27px] top-2 h-2 w-2 rounded-full" />
              <Card className="p-3">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Badge variant={KIND_TONE[it.kind]}>{it.kind}</Badge>
                    <span className="text-ink text-sm font-medium">{it.user_name ?? "—"}</span>
                  </div>
                  <span className="text-muted text-xs">{relTime(it.at)}</span>
                </div>
                <p className="text-muted mt-1 text-xs">{it.detail} · {fmtDateTime(it.at)}</p>
              </Card>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
