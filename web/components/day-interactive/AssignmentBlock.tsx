"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Card, CardSub, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { saveDraft, submitAssignment } from "@/lib/actions/submissions";
import type { DayAssignment } from "@/lib/queries/day-interactive";
import { fmtDate, relTime } from "@/lib/format";

type LinkRow = { label: string; url: string };

function isValidUrl(v: string) {
  if (!v) return false;
  try {
    const u = new URL(v);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

export function AssignmentBlock({ assignment }: { assignment: DayAssignment }) {
  const [body, setBody] = useState(assignment.submission?.body ?? "");
  const [links, setLinks] = useState<LinkRow[]>(assignment.submission?.links ?? []);
  const [pending, start] = useTransition();
  const status = assignment.submission?.status ?? "draft";
  const submitted = status === "submitted";
  const published = !!assignment.submission?.published;
  const locked = published || submitted;

  function addLink() {
    setLinks((rows) => [...rows, { label: "", url: "" }]);
  }
  function setLink(i: number, patch: Partial<LinkRow>) {
    setLinks((rows) => rows.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));
  }
  function removeLink(i: number) {
    setLinks((rows) => rows.filter((_, idx) => idx !== i));
  }

  function go(action: "draft" | "submit") {
    const cleanLinks = links
      .map((l) => ({ label: l.label.trim(), url: l.url.trim() }))
      .filter((l) => l.label && l.url);
    const bad = cleanLinks.find((l) => !isValidUrl(l.url));
    if (bad) {
      toast.error(`"${bad.label}" needs a valid http(s) URL`);
      return;
    }
    start(async () => {
      const fn = action === "submit" ? submitAssignment : saveDraft;
      const r = await fn({ assignment_id: assignment.id, body, links: cleanLinks });
      if (r.ok) toast.success(action === "submit" ? "Submitted" : "Draft saved");
      else toast.error(r.error);
    });
  }

  return (
    <Card className="space-y-4 p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <CardTitle>📝 {assignment.title}</CardTitle>
        <div className="flex items-center gap-2">
          <Badge>{assignment.kind}</Badge>
          {assignment.due_at && (
            <Badge variant="warn">Due {fmtDate(assignment.due_at)}</Badge>
          )}
          <Badge variant={status === "graded" ? "ok" : status === "submitted" ? "accent" : "default"}>
            {status}
          </Badge>
        </div>
      </div>

      {assignment.body_md && (
        <p className="text-ink/85 text-sm whitespace-pre-line">{assignment.body_md}</p>
      )}

      {locked && !published ? (
        <Card className="bg-bg-soft space-y-3">
          <CardSub className="text-accent font-mono text-xs uppercase">Submitted</CardSub>
          <p className="text-ink/85 text-sm">
            Your submission is in. Feedback will appear once an admin has reviewed it.
          </p>
          {assignment.submission?.body && (
            <p className="text-muted text-xs whitespace-pre-line">{assignment.submission.body.slice(0, 240)}{(assignment.submission.body.length ?? 0) > 240 ? "…" : ""}</p>
          )}
          {(assignment.submission?.links.length ?? 0) > 0 && (
            <div className="flex flex-wrap gap-2">
              {assignment.submission?.links.map((l) => (
                <a key={l.url} href={l.url} target="_blank" rel="noreferrer" className="border-line bg-card hover:border-accent/40 rounded-md border px-3 py-1 text-xs">
                  {l.label} ↗
                </a>
              ))}
            </div>
          )}
        </Card>
      ) : locked ? (
        <Card className="bg-bg-soft space-y-3">
          <div className="flex items-center gap-2">
            <CardSub className="text-accent font-mono text-xs uppercase">Feedback</CardSub>
          </div>
          <p className="text-ink text-sm">
            Score: <span className="text-accent font-mono font-semibold">{assignment.submission?.score ?? "—"}</span>
            {assignment.submission?.updated_at && (
              <span className="text-muted ml-2 text-xs">· {relTime(assignment.submission.updated_at)}</span>
            )}
          </p>
          {assignment.submission?.feedback_md && (
            <p className="text-ink/85 text-sm whitespace-pre-line">
              {assignment.submission.feedback_md}
            </p>
          )}
          {(assignment.submission?.links.length ?? 0) > 0 && (
            <div className="flex flex-wrap gap-2">
              {assignment.submission?.links.map((l) => (
                <a key={l.url} href={l.url} target="_blank" rel="noreferrer" className="border-line bg-card hover:border-accent/40 rounded-md border px-3 py-1 text-xs">
                  {l.label} ↗
                </a>
              ))}
            </div>
          )}
          {(assignment.submission?.ai_strengths.length ?? 0) > 0 && (
            <div>
              <p className="text-muted mb-1 text-xs uppercase tracking-wider">Strengths</p>
              <ul className="text-ink/85 list-disc pl-5 text-sm">
                {assignment.submission?.ai_strengths.map((s, i) => (<li key={i}>{s}</li>))}
              </ul>
            </div>
          )}
          {(assignment.submission?.ai_weaknesses.length ?? 0) > 0 && (
            <div>
              <p className="text-muted mb-1 text-xs uppercase tracking-wider">Improvement areas</p>
              <ul className="text-ink/85 list-disc pl-5 text-sm">
                {assignment.submission?.ai_weaknesses.map((s, i) => (<li key={i}>{s}</li>))}
              </ul>
            </div>
          )}
        </Card>
      ) : (
        <>
          <textarea
            rows={8}
            placeholder="Your submission (markdown)"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className="border-line bg-input-bg text-ink w-full rounded-md border p-3 font-mono text-sm"
          />
          <div className="space-y-2">
            <p className="text-muted text-xs uppercase tracking-wider">Links (optional)</p>
            {links.map((l, i) => (
              <div key={i} className="flex gap-2">
                <Input
                  placeholder="Label (e.g. Repo, Doc)"
                  value={l.label}
                  onChange={(e) => setLink(i, { label: e.target.value })}
                  className="w-40"
                />
                <Input
                  placeholder="https://…"
                  value={l.url}
                  onChange={(e) => setLink(i, { url: e.target.value })}
                  className="flex-1"
                />
                <Button variant="outline" size="sm" onClick={() => removeLink(i)}>
                  ✕
                </Button>
              </div>
            ))}
            {links.length < 10 && (
              <Button variant="outline" size="sm" onClick={addLink}>
                + Add link
              </Button>
            )}
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" disabled={pending} onClick={() => go("draft")}>
              Save draft
            </Button>
            <Button disabled={pending || !body.trim()} onClick={() => go("submit")}>
              {pending ? "Saving…" : "Submit"}
            </Button>
          </div>
        </>
      )}
    </Card>
  );
}
