import { Card, CardSub, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getMyCurrentCohort } from "@/lib/queries/cohort";
import {
  getMyCapstone,
  getMyCapstoneMilestones,
  groupCapstoneMilestones,
  type CapstoneMilestoneGroup,
  type CapstoneMilestoneSubmission,
} from "@/lib/queries/capstone";
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
          One project across the 30 days. Choose it, build it, and publish it.
        </p>
      </header>

      <CapstoneEditor cohortId={cohort.id} initial={project} />

      <section className="space-y-3">
        <h2 className="text-muted text-sm font-semibold tracking-wider uppercase">Milestones</h2>
        {milestones.length === 0 ? (
          <Card><CardSub>No capstone milestones in this cohort yet.</CardSub></Card>
        ) : (
          <div className="space-y-3">
            {groupCapstoneMilestones(milestones).map((g) => (
              <MilestoneCard key={g.milestone_number} group={g} />
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

function statusBadge(status: CapstoneMilestoneGroup["status"]) {
  if (status === "graded") return <Badge variant="ok">Accepted</Badge>;
  if (status === "submitted") return <Badge variant="accent">In review</Badge>;
  if (status === "drafting") return <Badge variant="warn">Drafting</Badge>;
  return <Badge>Not started</Badge>;
}

function MilestoneCard({ group }: { group: CapstoneMilestoneGroup }) {
  const items = [group.brief, group.reflection, ...group.extras].filter(
    (x): x is CapstoneMilestoneSubmission => !!x,
  );
  const facultyNotes = items
    .map((s) => s.faculty_notes_md)
    .filter((n): n is string => !!n);
  const lastUpdated = items
    .map((s) => s.updated_at)
    .filter(Boolean)
    .sort()
    .at(-1);

  return (
    <Card className="space-y-3 p-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div className="min-w-0">
          <p className="text-muted font-mono text-xs">
            Milestone {group.milestone_number} · D{String(group.start_day).padStart(2, "0")}
          </p>
          <CardTitle className="mt-0.5 break-words text-base">
            {group.brief?.assignment_title ?? `Milestone ${group.milestone_number}`}
          </CardTitle>
        </div>
        <div className="flex items-center gap-2">
          {statusBadge(group.status)}
          {lastUpdated && <span className="text-muted text-xs">{relTime(lastUpdated)}</span>}
        </div>
      </div>

      <ul className="space-y-1.5">
        {items.map((s) => (
          <li key={s.assignment_id} className="border-line/60 flex items-baseline gap-2 border-l-2 pl-3 text-sm">
            <span className="text-muted shrink-0 text-xs uppercase tracking-wide">
              {s.kind === "reflection" ? "Reflection" : "Brief"}
            </span>
            <span className="text-ink/90 min-w-0 flex-1 break-words">{s.assignment_title}</span>
            {s.human_reviewed_at ? (
              <span className="text-success shrink-0 text-xs">Graded · {s.score ?? "—"}</span>
            ) : s.status === "submitted" ? (
              <span className="text-accent shrink-0 text-xs">In review</span>
            ) : s.status === "draft" || s.body || s.links.length ? (
              <span className="text-warn shrink-0 text-xs">Draft</span>
            ) : (
              <span className="text-muted shrink-0 text-xs">—</span>
            )}
          </li>
        ))}
      </ul>

      {group.brief?.body && (
        <p className="text-ink/85 text-sm whitespace-pre-line">
          {group.brief.body.slice(0, 280)}
          {group.brief.body.length > 280 ? "…" : ""}
        </p>
      )}

      {group.brief?.links?.length ? (
        <div className="flex flex-wrap gap-1.5">
          {group.brief.links.map((l) => (
            <a
              key={l.url}
              href={l.url}
              target="_blank"
              rel="noreferrer"
              className="border-line bg-card hover:border-accent/40 rounded-md border px-2 py-0.5 text-xs"
            >
              {l.label} ↗
            </a>
          ))}
        </div>
      ) : null}

      {group.brief?.feedback_md && (
        <div className="bg-bg-soft rounded-md p-3">
          <p className="text-muted mb-1 text-xs tracking-wider uppercase">Admin feedback</p>
          <p className="text-ink/85 text-sm whitespace-pre-line">{group.brief.feedback_md}</p>
        </div>
      )}

      {facultyNotes.length > 0 && (
        <div className="border-accent/30 bg-accent/5 rounded-md border p-3">
          <p className="text-muted mb-1 text-xs tracking-wider uppercase">Faculty notes</p>
          {facultyNotes.map((n, i) => (
            <p key={i} className="text-ink/85 text-sm whitespace-pre-line">
              {n}
            </p>
          ))}
        </div>
      )}
    </Card>
  );
}
