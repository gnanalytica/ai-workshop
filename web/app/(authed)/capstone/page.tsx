import Link from "next/link";
import { Card, CardSub, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getMyCurrentCohort } from "@/lib/queries/cohort";
import { getMyTeam } from "@/lib/queries/teams";
import { fmtDate, relTime } from "@/lib/format";
import { TeamSubmissionEditor } from "./TeamSubmissionEditor";

export const dynamic = "force-dynamic";

export default async function CapstonePage() {
  const cohort = await getMyCurrentCohort();
  if (!cohort) {
    return (
      <Card>
        <CardTitle>No active cohort</CardTitle>
        <CardSub className="mt-2">
          Your capstone team will appear here once an admin confirms your enrollment.
        </CardSub>
      </Card>
    );
  }

  const team = await getMyTeam(cohort.id);

  if (!team) {
    return (
      <div className="space-y-6">
        <header>
          <p className="text-accent font-mono text-xs tracking-widest uppercase">{cohort.name}</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">Capstone team</h1>
        </header>
        <Card>
          <CardTitle>You&apos;re not on a team yet</CardTitle>
          <CardSub className="mt-2">
            Capstone teams are set up by the faculty from the finalized group list. If
            you think this is a mistake, reach out to your faculty or the help desk.
          </CardSub>
          <Link href="/showcase" className="text-accent mt-3 inline-block text-sm hover:underline">
            Browse the team showcase →
          </Link>
        </Card>
      </div>
    );
  }

  const grade = team.grade;

  return (
    <div className="space-y-8">
      <header>
        <p className="text-accent font-mono text-xs tracking-widest uppercase">{cohort.name}</p>
        <div className="mt-1 flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{team.name}</h1>
          {team.team_number != null && <Badge variant="accent">Team {team.team_number}</Badge>}
        </div>
        <p className="text-muted mt-1 text-sm">
          Your final project is a team submission. Any teammate can edit it
          {team.deadline ? <> · due {fmtDate(team.deadline)}</> : null}.
        </p>
      </header>

      {/* Teammates */}
      <section className="space-y-2">
        <h2 className="text-muted text-sm font-semibold tracking-wider uppercase">Teammates</h2>
        <Card className="p-4">
          <ul className="grid gap-2 sm:grid-cols-2">
            {team.members.map((m) => (
              <li key={m.user_id} className="flex items-baseline justify-between gap-2 text-sm">
                <span className="text-ink/90">{m.full_name ?? "—"}</span>
                {m.roll_number && <span className="text-muted font-mono text-xs">{m.roll_number}</span>}
              </li>
            ))}
          </ul>
        </Card>
      </section>

      {/* Pitched ideas */}
      {team.pitched_ideas.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-muted text-sm font-semibold tracking-wider uppercase">Ideas you pitched</h2>
          <div className="grid gap-2 sm:grid-cols-3">
            {team.pitched_ideas.map((idea, i) => (
              <Card key={i} className="p-3">
                <p className="text-muted font-mono text-xs">Idea {i + 1}</p>
                <p className="text-ink/90 mt-1 text-sm break-words">{idea}</p>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Graded feedback */}
      {grade && (grade.score != null || grade.feedback_md) && (
        <section className="space-y-2">
          <h2 className="text-muted text-sm font-semibold tracking-wider uppercase">Result</h2>
          <Card className="border-accent/30 bg-accent/5 space-y-2 border p-4">
            <div className="flex items-center gap-2">
              <Badge variant="ok">Graded</Badge>
              {grade.score != null && (
                <span className="text-ink text-lg font-semibold tabular-nums">{grade.score}/100</span>
              )}
              <span className="text-muted text-xs">{relTime(grade.reviewed_at)}</span>
            </div>
            {grade.feedback_md && (
              <p className="text-ink/85 text-sm whitespace-pre-line">{grade.feedback_md}</p>
            )}
          </Card>
        </section>
      )}

      {/* The deliverable */}
      <section className="space-y-2">
        <h2 className="text-muted text-sm font-semibold tracking-wider uppercase">Final submission</h2>
        <TeamSubmissionEditor
          teamId={team.id}
          cohortId={team.cohort_id}
          pitchedIdeas={team.pitched_ideas}
          initial={team.submission}
          editable={team.editable}
        />
        {!team.editable && (
          <p className="text-warn text-xs">
            The submission deadline has passed. Ask your faculty to reopen the team if
            you still need to make changes.
          </p>
        )}
      </section>
    </div>
  );
}
