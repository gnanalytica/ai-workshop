import Link from "next/link";
import { redirect } from "next/navigation";
import { requireCapability } from "@/lib/auth/requireCapability";
import { Card, CardSub, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { listAdminCohorts } from "@/lib/queries/admin-context";
import { fmtDate } from "@/lib/format";

export default async function AdminHome() {
  await requireCapability("schedule.read");
  const cohorts = await listAdminCohorts();

  if (cohorts.length === 0) {
    return (
      <Card>
        <CardTitle>No cohorts yet</CardTitle>
        <CardSub className="mt-2">
          Create one to get started. Schedule lives at the org level.
        </CardSub>
        <Button asChild className="mt-4">
          <Link href="/admin/schedule">Create a cohort</Link>
        </Button>
      </Card>
    );
  }

  if (cohorts.length === 1) {
    redirect(`/admin/cohorts/${cohorts[0]!.id}`);
  }

  const live = cohorts.filter((c) => c.status === "live");
  const others = cohorts.filter((c) => c.status !== "live");

  return (
    <div className="space-y-6">
      <header>
        <p className="text-accent font-mono text-xs tracking-widest uppercase">
          Admin
        </p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">Cohorts</h1>
        <p className="text-muted mt-1 text-sm">
          {cohorts.length} total · pick one to manage
        </p>
      </header>

      {live.length > 0 && (
        <section>
          <h2 className="text-muted mb-2 text-xs font-medium tracking-widest uppercase">
            Live
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {live.map((c) => (
              <CohortCard key={c.id} cohort={c} />
            ))}
          </div>
        </section>
      )}

      {others.length > 0 && (
        <section>
          <h2 className="text-muted mb-2 text-xs font-medium tracking-widest uppercase">
            Other
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {others.map((c) => (
              <CohortCard key={c.id} cohort={c} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function CohortCard({
  cohort,
}: {
  cohort: { id: string; name: string; slug: string; starts_on: string; ends_on: string; status: string };
}) {
  return (
    <Link
      href={`/admin/cohorts/${cohort.id}`}
      className="border-line hover:border-accent/40 hover:bg-bg-soft block rounded-lg border p-4 transition-colors"
    >
      <div className="flex items-baseline justify-between gap-2">
        <CardTitle className="truncate">{cohort.name}</CardTitle>
        <Badge variant={cohort.status === "live" ? "ok" : "default"}>
          {cohort.status}
        </Badge>
      </div>
      <CardSub className="mt-1 font-mono text-xs">{cohort.slug}</CardSub>
      <p className="text-muted mt-3 text-xs">
        {fmtDate(cohort.starts_on)} → {fmtDate(cohort.ends_on)}
      </p>
    </Link>
  );
}
