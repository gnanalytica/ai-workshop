import Link from "next/link";
import { getMyCurrentCohort } from "@/lib/queries/cohort";
import { listMyHelpDeskTickets } from "@/lib/queries/student-help-desk";
import { Card, CardSub, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { fmtDateTime, relTime } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { HelpDeskButton } from "@/components/day-interactive/HelpDeskButton";

const STATUS: Record<string, { label: string; variant: "default" | "warn" | "accent" | "ok" }> = {
  open: { label: "Open", variant: "warn" },
  helping: { label: "In progress", variant: "accent" },
  resolved: { label: "Resolved", variant: "ok" },
  cancelled: { label: "Cancelled", variant: "default" },
};

export default async function StudentHelpDeskPage() {
  const cohort = await getMyCurrentCohort();
  if (!cohort) {
    return (
      <Card>
        <CardTitle>No active cohort</CardTitle>
        <CardSub className="mt-2">You need a confirmed registration to use help desk.</CardSub>
      </Card>
    );
  }

  const tickets = await listMyHelpDeskTickets(cohort.id);
  const openTotal = tickets[0]?.open_in_cohort ?? 0;

  return (
    <div data-tour="help-desk-page" className="space-y-6">
      <header>
        <p className="text-accent font-mono text-xs tracking-widest uppercase">
          {cohort.name} · Help desk
        </p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">Your tickets</h1>
        <p className="text-muted mt-1 text-sm max-w-2xl">
          You opened these from a lesson (Get help). Open tickets are handled in order; faculty see your
          pod first, and staff or tech can take over if it&apos;s escalated.
          {openTotal > 0 && ` ${openTotal} open ticket${openTotal === 1 ? "" : "s"} in this cohort right now.`}
        </p>
        <div className="mt-4 flex flex-wrap items-start gap-3">
          <HelpDeskButton cohortId={cohort.id} />
          <Button variant="outline" size="sm" asChild>
            <Link href="/day/today">Back to today&apos;s lesson</Link>
          </Button>
        </div>
      </header>

      {tickets.length === 0 ? (
        <Card>
          <CardSub>No tickets yet. Use Get help on a day page if something blocks you.</CardSub>
        </Card>
      ) : (
        <div className="space-y-2">
          {tickets.map((t) => {
            const s = STATUS[t.status] ?? { label: t.status, variant: "default" as const };
            return (
              <Card key={t.id} className="p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant={s.variant}>{s.label}</Badge>
                      <Badge>{t.kind}</Badge>
                      <span className="text-muted text-xs" title={fmtDateTime(t.created_at)}>
                        {relTime(t.created_at)}
                      </span>
                    </div>
                    {t.status === "open" && t.queue_position != null && (
                      <p className="text-ink/90 mt-2 text-sm">
                        <span className="font-medium">Queue:</span> #{t.queue_position} of {openTotal} open
                        in this cohort
                      </p>
                    )}
                    {t.status === "helping" && (
                      <p className="text-ink/90 mt-2 text-sm">Someone is working on this.</p>
                    )}
                    {t.escalated_at && (
                      <p className="text-muted mt-1 text-xs">Sent to staff / tech for extra help</p>
                    )}
                    {t.message && <p className="text-ink/85 mt-2 text-sm whitespace-pre-wrap">{t.message}</p>}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
