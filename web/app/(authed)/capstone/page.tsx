import { Card, CardSub, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getMyCurrentCohort } from "@/lib/queries/cohort";
import { getMyCapstone, getMyCapstoneMilestones } from "@/lib/queries/capstone";
import { fmtDate, relTime } from "@/lib/format";
import { CapstoneEditor } from "./CapstoneEditor";

export const dynamic = "force-dynamic";

export default async function CapstonePage() {
  const cohort = await getMyCurrentCohort();
  if (!cohort) {
    return (
      <Card>
        <CardTitle>No active cohort</CardTitle>
        <CardSub className="mt-2">
          Your capstone will appear here once an admin confirms your enrollment.
        </CardSub>
      </Card>
    );
  }

  const [project, milestones] = await Promise.all([
    getMyCapstone(cohort.id),
    getMyCapstoneMilestones(cohort.id),
  ]);

  return (
    <div className="space-y-8">
      <header>
        <p className="text-accent font-mono text-xs tracking-widest uppercase">{cohort.name}</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">Your capstone</h1>
        <p className="text-muted mt-1 text-sm">
          One project across the 30 days. Lock it in, build it, ship it.
        </p>
      </header>

      <CapstoneEditor cohortId={cohort.id} initial={project} />

      <section className="space-y-3">
        <h2 className="text-muted text-sm font-semibold tracking-wider uppercase">Milestones</h2>
        {milestones.length === 0 ? (
          <Card><CardSub>No capstone milestones in this cohort yet.</CardSub></Card>
        ) : (
          <div className="space-y-2">
            {milestones.map((m) => (
              <Card key={m.assignment_id} className="space-y-2 p-4">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-muted font-mono text-xs">D{String(m.day_number).padStart(2, "0")}</p>
                    <CardTitle className="mt-0.5 break-words text-base">{m.assignment_title}</CardTitle>
                  </div>
                  <div className="flex items-center gap-2">
                    {m.human_reviewed_at ? (
                      <Badge variant="ok">Graded · {m.score ?? "—"}</Badge>
                    ) : m.status === "submitted" ? (
                      <Badge variant="accent">In review</Badge>
                    ) : m.status === "draft" ? (
                      <Badge variant="warn">Draft</Badge>
                    ) : (
                      <Badge>Not started</Badge>
                    )}
                    {m.updated_at && (
                      <span className="text-muted text-xs">{relTime(m.updated_at)}</span>
                    )}
                  </div>
                </div>
                {m.body && (
                  <p className="text-ink/85 text-sm whitespace-pre-line">
                    {m.body.slice(0, 280)}{m.body.length > 280 ? "…" : ""}
                  </p>
                )}
                {m.links.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {m.links.map((l) => (
                      <a key={l.url} href={l.url} target="_blank" rel="noreferrer" className="border-line bg-card hover:border-accent/40 rounded-md border px-2 py-0.5 text-xs">
                        {l.label} ↗
                      </a>
                    ))}
                  </div>
                )}
                {m.feedback_md && (
                  <div className="bg-bg-soft rounded-md p-3">
                    <p className="text-muted mb-1 text-xs uppercase tracking-wider">Feedback</p>
                    <p className="text-ink/85 text-sm whitespace-pre-line">{m.feedback_md}</p>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
        <p className="text-muted text-xs">
          Cohort runs {fmtDate(cohort.starts_on)} → {fmtDate(cohort.ends_on)}.
        </p>
      </section>
    </div>
  );
}
