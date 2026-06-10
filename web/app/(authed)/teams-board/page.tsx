import Link from "next/link";
import { Card, CardSub, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { requireCapability } from "@/lib/auth/requireCapability";
import { getMyCurrentCohort } from "@/lib/queries/cohort";
import { listTeamsBoard, type TeamBoardRow } from "@/lib/queries/teams";

export const dynamic = "force-dynamic";

export default async function TeamsBoardPage() {
  const cohort = await getMyCurrentCohort();
  if (!cohort) {
    return (
      <Card>
        <CardTitle>No active cohort</CardTitle>
        <CardSub className="mt-2">The teams board appears once a cohort is live.</CardSub>
      </Card>
    );
  }

  // Roll numbers are PII — staff only.
  await requireCapability("roster.read", cohort.id);

  const teams = await listTeamsBoard(cohort.id);
  const studentCount = teams.reduce((n, t) => n + t.members.length, 0);
  const submittedCount = teams.filter((t) => t.submission?.status === "submitted").length;

  return (
    <div className="space-y-6">
      <header>
        <p className="text-accent font-mono text-xs tracking-widest uppercase">{cohort.name}</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">Teams board</h1>
        <CardSub className="mt-1">
          {teams.length} teams · {studentCount} students · {submittedCount} submitted
        </CardSub>
      </header>

      {teams.length === 0 ? (
        <Card>
          <CardTitle>No teams yet</CardTitle>
          <CardSub className="mt-2">Teams appear here once the finalized group list is imported.</CardSub>
        </Card>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {teams.map((t) => (
            <TeamBoardCard key={t.id} team={t} />
          ))}
        </div>
      )}
    </div>
  );
}

function TeamBoardCard({ team }: { team: TeamBoardRow }) {
  const s = team.submission;
  const submitted = s?.status === "submitted";
  const links: { label: string; url: string | null }[] = [
    { label: "Live", url: s?.product_url ?? null },
    { label: "Slides", url: s?.presentation_url ?? null },
    { label: "Repo", url: s?.repo_url ?? null },
    { label: "Video", url: s?.demo_video_url ?? null },
  ].filter((l) => l.url);

  return (
    <Card className="flex flex-col gap-4 p-4">
      {/* Heading */}
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <CardTitle className="text-base break-words">
          {team.team_number != null && (
            <span className="text-muted font-mono text-sm">#{team.team_number} · </span>
          )}
          {team.name}
        </CardTitle>
        <Badge variant={submitted ? "ok" : s ? "accent" : "default"}>
          {submitted ? "Submitted" : s ? "Draft" : "No submission"}
        </Badge>
      </div>

      {/* Members */}
      <div>
        <p className="text-muted font-mono text-[11px] tracking-widest uppercase">
          Members · {team.members.length}
        </p>
        {team.members.length === 0 ? (
          <p className="text-muted mt-1 text-sm">No members assigned.</p>
        ) : (
          <ul className="mt-1.5 space-y-1">
            {team.members.map((m) => (
              <li key={m.user_id} className="flex items-baseline gap-2 text-sm">
                <span className="text-muted w-16 shrink-0 font-mono text-xs">
                  {m.roll_number ?? "—"}
                </span>
                <span className="text-ink/90 break-words">{m.full_name ?? "Unnamed"}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Pitched ideas */}
      {team.pitched_ideas.length > 0 && (
        <div>
          <p className="text-muted font-mono text-[11px] tracking-widest uppercase">Pitched ideas</p>
          <ul className="mt-1.5 space-y-1">
            {team.pitched_ideas.map((idea, i) => {
              const chosen = !!s?.chosen_idea && s.chosen_idea === idea;
              return (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <span className="text-muted shrink-0">{i + 1}.</span>
                  <span className={chosen ? "text-ink font-medium" : "text-ink/85"}>
                    <span className="break-words whitespace-pre-line">{idea}</span>
                    {chosen && <Badge variant="accent" className="ml-2 align-middle">Building</Badge>}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* Submission */}
      {s && (s.title || s.pitch || links.length > 0) && (
        <div className="border-line/60 border-t pt-3">
          <p className="text-muted font-mono text-[11px] tracking-widest uppercase">Submission</p>
          {s.title && <p className="text-ink mt-1 text-sm font-medium break-words">{s.title}</p>}
          {s.pitch && <p className="text-ink/80 mt-0.5 text-sm break-words">{s.pitch}</p>}
          {links.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-3 text-sm">
              {links.map((l) => (
                <Link
                  key={l.label}
                  href={l.url!}
                  target="_blank"
                  rel="noreferrer"
                  className="text-accent hover:underline"
                >
                  {l.label} →
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
