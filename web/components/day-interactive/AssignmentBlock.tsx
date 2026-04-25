"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Card, CardSub, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { saveDraft, submitAssignment } from "@/lib/actions/submissions";
import type { DayAssignment } from "@/lib/queries/day-interactive";
import { fmtDate, relTime } from "@/lib/format";

export function AssignmentBlock({ assignment }: { assignment: DayAssignment }) {
  const [body, setBody] = useState(assignment.submission?.body ?? "");
  const [pending, start] = useTransition();
  const status = assignment.submission?.status ?? "draft";
  const locked = status === "graded" || status === "returned";

  function go(action: "draft" | "submit") {
    start(async () => {
      const fn = action === "submit" ? submitAssignment : saveDraft;
      const r = await fn({ assignment_id: assignment.id, body, attachments: [] });
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

      {locked ? (
        <Card className="bg-bg-soft">
          <CardSub className="text-accent font-mono text-xs uppercase">Feedback</CardSub>
          <p className="text-ink mt-1 text-sm">
            Score: {assignment.submission?.score ?? "—"} ·{" "}
            {assignment.submission?.updated_at && relTime(assignment.submission.updated_at)}
          </p>
          {assignment.submission?.feedback_md && (
            <p className="text-ink/85 mt-2 text-sm whitespace-pre-line">
              {assignment.submission.feedback_md}
            </p>
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
