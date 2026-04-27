import Link from "next/link";
import { requireCapability } from "@/lib/auth/requireCapability";
import { getSession } from "@/lib/auth/session";
import { Card, CardTitle } from "@/components/ui/card";
import { getFacultyCohort } from "@/lib/queries/faculty";
import { listFacultyHelpDesk } from "@/lib/queries/faculty-help-desk";
import { HelpDeskQueue } from "./HelpDeskQueue";

export default async function FacultyStuckPage() {
  await requireCapability("support.triage");
  const f = await getFacultyCohort();
  const me = await getSession();
  if (!f || !me) return <Card><CardTitle>You aren&apos;t assigned to a cohort.</CardTitle></Card>;

  const items = await listFacultyHelpDesk(f.cohort.id, me.id);
  const open = items.filter((i) => i.status !== "resolved");

  return (
    <div className="space-y-6">
      <header>
        <p className="text-accent font-mono text-xs tracking-widest uppercase">
          {f.cohort.name} · Help desk · your pod
        </p>
        <div className="mt-1 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-3xl font-semibold tracking-tight">Help desk</h1>
          <Link
            href="/faculty/help-desk/history"
            className="text-accent hover:text-accent/80 text-sm font-medium"
          >
            View resolved →
          </Link>
        </div>
        <p className="text-muted mt-1 text-sm">
          Open tickets from students in your pod. Claim when you&apos;re helping, resolve when it&apos;s fixed.
          Escalate (or route to tech) if it needs cohort staff or platform help.
        </p>
      </header>

      <HelpDeskQueue items={open} meId={me.id} cohortId={f.cohort.id} />
    </div>
  );
}
