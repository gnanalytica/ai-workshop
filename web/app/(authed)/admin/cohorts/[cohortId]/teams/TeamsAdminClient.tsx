"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Card, CardSub, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  importTeams,
  gradeTeam,
  setTeamDeadline,
  setTeamUnlocked,
  type ImportRowResult,
} from "@/lib/actions/teams";
import type { AdminTeamRow } from "@/lib/queries/teams";
import { parseTeamsCsv } from "@/lib/teams/parse-import";

// --- Component -------------------------------------------------------------

export function TeamsAdminClient({
  cohortId,
  initialTeams,
  initialDeadline,
  canManage,
  canGrade,
}: {
  cohortId: string;
  initialTeams: AdminTeamRow[];
  initialDeadline: string | null;
  canManage: boolean;
  canGrade: boolean;
}) {
  return (
    <div className="space-y-6">
      {canManage && <DeadlineCard cohortId={cohortId} initial={initialDeadline} />}
      {canManage && <ImportCard cohortId={cohortId} />}
      <TeamsTable
        cohortId={cohortId}
        teams={initialTeams}
        canGrade={canGrade}
        canManage={canManage}
        deadline={initialDeadline}
      />
    </div>
  );
}

function toLocalInput(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  const off = d.getTimezoneOffset();
  return new Date(d.getTime() - off * 60000).toISOString().slice(0, 16);
}

function DeadlineCard({ cohortId, initial }: { cohortId: string; initial: string | null }) {
  const [value, setValue] = useState(toLocalInput(initial));
  const [pending, start] = useTransition();

  function save(clear = false) {
    start(async () => {
      const iso = clear || !value ? null : new Date(value).toISOString();
      const r = await setTeamDeadline({ cohort_id: cohortId, deadline: iso });
      if (r.ok) toast.success(clear ? "Deadline cleared" : "Deadline saved");
      else toast.error(r.error);
    });
  }

  return (
    <Card className="space-y-3 p-4">
      <CardTitle className="text-base">Submission deadline</CardTitle>
      <CardSub>After this time teams can no longer edit, unless you reopen them individually.</CardSub>
      <div className="flex flex-wrap items-center gap-2">
        <input
          type="datetime-local"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="border-line bg-input-bg text-ink rounded-md border px-2 py-1.5 text-sm"
        />
        <Button onClick={() => save(false)} disabled={pending}>Save</Button>
        <Button variant="ghost" onClick={() => save(true)} disabled={pending}>Clear</Button>
      </div>
    </Card>
  );
}

function ImportCard({ cohortId }: { cohortId: string }) {
  const [text, setText] = useState("");
  const [report, setReport] = useState<ImportRowResult[] | null>(null);
  const [parseErrors, setParseErrors] = useState<string[]>([]);
  const [pending, start] = useTransition();

  function run() {
    const { rows, errors } = parseTeamsCsv(text);
    setParseErrors(errors);
    if (rows.length === 0) {
      toast.error("No valid rows to import");
      return;
    }
    start(async () => {
      const r = await importTeams({ cohort_id: cohortId, rows });
      if (r.ok) {
        setReport(r.data?.rows ?? []);
        toast.success(`Imported ${rows.length} team(s)`);
      } else toast.error(r.error);
    });
  }

  return (
    <Card className="space-y-3 p-4">
      <CardTitle className="text-base">Import teams</CardTitle>
      <CardSub>
        One row per team:{" "}
        <code className="text-xs">team_number, team_name, &quot;roll1;roll2;roll3&quot;, idea_1, idea_2, idea_3</code>.
        A header row is optional. Re-importing a team name updates it.
      </CardSub>
      <textarea
        rows={6}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={'1, Neural Ninjas, "23BCE1001;23BCE1002;23BCE1003", Idea A, Idea B, Idea C'}
        className="border-line bg-input-bg text-ink w-full rounded-md border p-3 font-mono text-xs"
      />
      <div className="flex justify-end">
        <Button onClick={run} disabled={pending || !text.trim()}>
          {pending ? "Importing…" : "Import"}
        </Button>
      </div>

      {parseErrors.length > 0 && (
        <div className="text-danger text-xs">
          {parseErrors.map((e, i) => <p key={i}>{e}</p>)}
        </div>
      )}

      {report && (
        <div className="border-line space-y-1 rounded-md border p-3 text-sm">
          <p className="text-muted mb-1 text-xs tracking-wider uppercase">Result</p>
          {report.map((r, i) => (
            <div key={i} className="flex flex-wrap items-baseline gap-2">
              <span className="text-ink/90 font-medium">{r.name}</span>
              <Badge variant="ok">{r.matched} matched</Badge>
              {r.unmatched.length > 0 && (
                <span className="text-warn text-xs">unmatched roll: {r.unmatched.join(", ")}</span>
              )}
              {r.error && <span className="text-danger text-xs">{r.error}</span>}
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

function TeamsTable({
  cohortId,
  teams,
  canGrade,
  canManage,
  deadline,
}: {
  cohortId: string;
  teams: AdminTeamRow[];
  canGrade: boolean;
  canManage: boolean;
  deadline: string | null;
}) {
  if (teams.length === 0) {
    return (
      <Card>
        <CardSub>No teams imported yet. Paste the finalized group list above.</CardSub>
      </Card>
    );
  }
  const pastDeadline = deadline != null && new Date(deadline).getTime() <= Date.now();

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold tracking-tight">Teams ({teams.length})</h2>
      <div className="space-y-2">
        {teams.map((t) => (
          <TeamAdminRow
            key={t.id}
            cohortId={cohortId}
            team={t}
            canGrade={canGrade}
            canManage={canManage}
            pastDeadline={pastDeadline}
          />
        ))}
      </div>
    </div>
  );
}

function TeamAdminRow({
  cohortId,
  team,
  canGrade,
  canManage,
  pastDeadline,
}: {
  cohortId: string;
  team: AdminTeamRow;
  canGrade: boolean;
  canManage: boolean;
  pastDeadline: boolean;
}) {
  const s = team.submission;
  const submitted = s?.status === "submitted";
  const [score, setScore] = useState(team.grade?.score?.toString() ?? "");
  const [feedback, setFeedback] = useState(team.grade?.feedback_md ?? "");
  const [pending, start] = useTransition();

  const locked = pastDeadline && !s?.unlocked;

  function saveGrade() {
    start(async () => {
      const parsed = score.trim() === "" ? null : Number(score);
      if (parsed != null && (Number.isNaN(parsed) || parsed < 0 || parsed > 100)) {
        toast.error("Score must be 0–100");
        return;
      }
      const r = await gradeTeam({
        team_id: team.id,
        cohort_id: cohortId,
        score: parsed,
        feedback_md: feedback.trim() || null,
      });
      if (r.ok) toast.success("Grade saved");
      else toast.error(r.error);
    });
  }

  function toggleUnlock() {
    start(async () => {
      const r = await setTeamUnlocked({
        team_id: team.id,
        cohort_id: cohortId,
        unlocked: !s?.unlocked,
      });
      if (r.ok) toast.success(s?.unlocked ? "Re-locked" : "Reopened for edits");
      else toast.error(r.error);
    });
  }

  const links: { label: string; url: string | null | undefined }[] = [
    { label: "live", url: s?.product_url },
    { label: "slides", url: s?.presentation_url },
    { label: "repo", url: s?.repo_url },
    { label: "video", url: s?.demo_video_url },
  ];

  return (
    <Card className="space-y-3 p-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div className="min-w-0">
          <div className="flex flex-wrap items-baseline gap-2">
            {team.team_number != null && <span className="text-muted font-mono text-xs">#{team.team_number}</span>}
            <CardTitle className="text-base">{s?.title || team.name}</CardTitle>
            <Badge variant={submitted ? "ok" : "default"}>{submitted ? "Submitted" : "Draft"}</Badge>
            {s?.unlocked && <Badge variant="warn">Reopened</Badge>}
            {locked && <Badge variant="default">Locked</Badge>}
            {team.grade?.score != null && <Badge variant="accent">{team.grade.score}/100</Badge>}
          </div>
          <p className="text-muted mt-1 text-xs">
            {team.name} · {team.member_names.join(", ")}
          </p>
        </div>
        {canManage && (
          <Button variant="ghost" size="sm" onClick={toggleUnlock} disabled={pending}>
            {s?.unlocked ? "Re-lock" : "Reopen"}
          </Button>
        )}
      </div>

      <div className="flex flex-wrap gap-3 text-sm">
        {links.filter((l) => l.url).length === 0 ? (
          <span className="text-muted text-xs">No links submitted yet.</span>
        ) : (
          links
            .filter((l) => l.url)
            .map((l) => (
              <a key={l.label} href={l.url!} target="_blank" rel="noreferrer" className="text-accent text-xs hover:underline">
                {l.label} ↗
              </a>
            ))
        )}
      </div>

      {canGrade && (
        <div className="border-line/60 flex flex-wrap items-end gap-2 border-t pt-3">
          <div>
            <label className="text-muted text-xs tracking-wider uppercase">Score</label>
            <Input
              value={score}
              onChange={(e) => setScore(e.target.value)}
              inputMode="numeric"
              placeholder="0–100"
              className="mt-1 w-24"
            />
          </div>
          <div className="min-w-[200px] flex-1">
            <label className="text-muted text-xs tracking-wider uppercase">Feedback</label>
            <Input
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Shared with the whole team"
              className="mt-1"
            />
          </div>
          <Button onClick={saveGrade} disabled={pending} size="sm">Save grade</Button>
        </div>
      )}
    </Card>
  );
}
