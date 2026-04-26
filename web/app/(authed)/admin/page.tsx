import Link from "next/link";
import { requireCapability } from "@/lib/auth/requireCapability";
import { Card, CardSub, CardTitle } from "@/components/ui/card";
import { KpiGrid, StatCard } from "@/components/kpi/StatCard";
import { Button } from "@/components/ui/button";
import { getAdminCohort } from "@/lib/queries/admin-context";
import { getAdminCohortKpis } from "@/lib/queries/admin";
import { fmtDate } from "@/lib/format";

export default async function AdminHomePage() {
  await requireCapability("schedule.read");
  const cohort = await getAdminCohort();
  if (!cohort) {
    return (
      <Card>
        <CardTitle>No cohorts yet</CardTitle>
        <CardSub className="mt-2">Create one from the Schedule page.</CardSub>
        <Button asChild className="mt-4">
          <Link href="/admin/schedule">Go to schedule</Link>
        </Button>
      </Card>
    );
  }
  const kpis = await getAdminCohortKpis(cohort.id);

  return (
    <div className="space-y-8">
      <header>
        <p className="text-accent font-mono text-xs tracking-widest uppercase">Cohort home</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">{cohort.name}</h1>
        <p className="text-muted mt-1 text-sm">
          {fmtDate(cohort.starts_on)} → {fmtDate(cohort.ends_on)} · {cohort.status}
        </p>
      </header>

      <KpiGrid>
        <StatCard label="Confirmed" value={kpis.confirmed} tone="ok" hint="students" />
        <StatCard label="Pending" value={kpis.pending} tone={kpis.pending > 0 ? "warn" : "default"} />
        <StatCard label="Faculty" value={kpis.faculty} />
        <StatCard label="Pods" value={kpis.pods} />
      </KpiGrid>

      <section>
        <h2 className="mb-3 text-lg font-semibold tracking-tight">Quick actions</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Button variant="outline" asChild><Link href="/admin/roster">Manage roster →</Link></Button>
          <Button variant="outline" asChild><Link href="/pods">Pods →</Link></Button>
          <Button variant="outline" asChild><Link href="/admin/analytics">Analytics →</Link></Button>
          <Button variant="outline" asChild><Link href="/admin/board">Board →</Link></Button>
        </div>
      </section>
    </div>
  );
}
