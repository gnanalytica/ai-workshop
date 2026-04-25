import { requireCapability } from "@/lib/auth/requireCapability";
import { Card, CardSub, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getAdminCohort } from "@/lib/queries/admin-context";
import { listCapstones } from "@/lib/queries/capstones";
import { fmtDate, relTime } from "@/lib/format";

const PHASE_TONE: Record<string, "default" | "warn" | "accent" | "ok"> = {
  idea: "default",
  spec: "warn",
  mid: "accent",
  demo: "accent",
  shipped: "ok",
};

const PHASE_ORDER = ["idea", "spec", "mid", "demo", "shipped"] as const;

export default async function AdminMilestonesPage() {
  await requireCapability("grading.read");
  const cohort = await getAdminCohort();
  if (!cohort) return <Card><CardTitle>No cohort</CardTitle></Card>;
  const capstones = await listCapstones(cohort.id);
  const byPhase = PHASE_ORDER.map((p) => ({
    phase: p,
    items: capstones.filter((c) => c.phase === p),
  }));

  return (
    <div className="space-y-6">
      <header>
        <p className="text-accent font-mono text-xs tracking-widest uppercase">Milestones</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">{cohort.name}</h1>
        <CardSub className="mt-1">
          {capstones.length} capstones in flight
        </CardSub>
      </header>

      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
        {byPhase.map(({ phase, items }) => (
          <div key={phase}>
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-xs font-medium tracking-widest uppercase">{phase}</h2>
              <Badge variant={PHASE_TONE[phase]}>{items.length}</Badge>
            </div>
            <div className="space-y-2">
              {items.length === 0 ? (
                <p className="text-muted text-xs">—</p>
              ) : (
                items.map((c) => (
                  <Card key={c.id} className="p-3">
                    <p className="text-ink truncate text-sm font-medium">{c.title}</p>
                    <p className="text-muted truncate text-xs">{c.owner_name ?? "—"}</p>
                    <p className="text-muted mt-1 text-[10px]">
                      {fmtDate(c.updated_at)} · {relTime(c.updated_at)}
                    </p>
                  </Card>
                ))
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
