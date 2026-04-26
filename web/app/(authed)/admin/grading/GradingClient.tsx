"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card, CardSub, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  batchGradeAssignment,
  publishGrade,
  manualGrade,
} from "@/lib/actions/submissions";
import type { GradingSubmission } from "@/lib/queries/grading";
import { fmtDateTime, relTime } from "@/lib/format";

export function GradingClient({
  assignmentId,
  initial,
}: {
  assignmentId: string;
  initial: GradingSubmission[];
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [activeId, setActiveId] = useState<string | null>(initial[0]?.id ?? null);
  const [score, setScore] = useState<string>("");
  const [feedback, setFeedback] = useState<string>("");
  const active = initial.find((s) => s.id === activeId) ?? null;

  function loadActive(s: GradingSubmission | null) {
    setActiveId(s?.id ?? null);
    setScore(s?.score?.toString() ?? s?.ai_score?.toString() ?? "");
    setFeedback(s?.feedback_md ?? s?.ai_feedback_md ?? "");
  }

  function runBatch() {
    start(async () => {
      const r = await batchGradeAssignment({ assignment_id: assignmentId });
      if (r.ok && r.data) {
        toast.success(`AI graded ${r.data.graded} · ${r.data.failed} failed · ${r.data.skipped} skipped`);
        router.refresh();
      } else if (!r.ok) {
        toast.error(r.error);
      }
    });
  }

  function approve() {
    if (!active) return;
    start(async () => {
      const r = await publishGrade({ submission_id: active.id });
      if (r.ok) {
        toast.success("Published to student");
        router.refresh();
      } else toast.error(r.error);
    });
  }

  function publishEdited() {
    if (!active) return;
    const numeric = Number(score);
    if (!Number.isFinite(numeric) || numeric < 0 || numeric > 100) {
      toast.error("Score must be 0–100");
      return;
    }
    start(async () => {
      const r = await publishGrade({
        submission_id: active.id,
        score: numeric,
        feedback_md: feedback,
      });
      if (r.ok) {
        toast.success("Published");
        router.refresh();
      } else toast.error(r.error);
    });
  }

  function gradeManually() {
    if (!active) return;
    const numeric = Number(score);
    if (!Number.isFinite(numeric) || numeric < 0 || numeric > 100) {
      toast.error("Score must be 0–100");
      return;
    }
    start(async () => {
      const r = await manualGrade({
        submission_id: active.id,
        score: numeric,
        feedback_md: feedback,
      });
      if (r.ok) {
        toast.success("Graded + published");
        router.refresh();
      } else toast.error(r.error);
    });
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <Button onClick={runBatch} disabled={pending}>
          {pending ? "Running…" : "Run AI batch"}
        </Button>
        <span className="text-muted text-xs">
          Re-grades anything not yet published. Existing AI drafts are overwritten.
        </span>
      </div>

      <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
        <aside className="space-y-1.5">
          {initial.map((s) => (
            <button
              key={s.id}
              onClick={() => loadActive(s)}
              className={
                "w-full rounded-md border p-2 text-left transition-colors " +
                (s.id === activeId ? "border-accent bg-accent/10" : "border-line bg-card hover:border-accent/40")
              }
            >
              <p className="text-ink truncate text-sm font-medium">{s.user_name ?? "—"}</p>
              <div className="mt-1 flex items-center gap-1.5">
                {s.human_reviewed_at ? (
                  <Badge variant="ok">Published · {s.score}</Badge>
                ) : s.ai_graded ? (
                  <Badge variant="warn">AI · {s.ai_score}</Badge>
                ) : s.status === "submitted" ? (
                  <Badge variant="danger">Submitted</Badge>
                ) : (
                  <Badge>{s.status}</Badge>
                )}
              </div>
              <p className="text-muted mt-1 text-[10px]">{relTime(s.updated_at)}</p>
            </button>
          ))}
          {initial.length === 0 && (
            <Card><CardSub>No submissions yet.</CardSub></Card>
          )}
        </aside>

        {!active ? (
          <Card><CardSub>Pick a submission.</CardSub></Card>
        ) : (
          <Card className="space-y-5 p-6">
            <div>
              <CardTitle>{active.user_name ?? "—"}</CardTitle>
              <p className="text-muted mt-1 text-xs">
                Submitted {fmtDateTime(active.updated_at)} · {relTime(active.updated_at)}
              </p>
            </div>

            <div className="bg-bg-soft border-line max-h-72 overflow-y-auto rounded-md border p-4 text-sm whitespace-pre-line">
              {active.body || <span className="text-muted italic">— empty —</span>}
            </div>
            {active.attachments.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {active.attachments.map((a) => (
                  <a key={a.url} href={a.url} target="_blank" rel="noreferrer" className="border-line bg-card hover:border-accent/40 rounded-md border px-3 py-1.5 text-xs">
                    {a.name} ↗
                  </a>
                ))}
              </div>
            )}

            {active.ai_graded && (
              <div className="border-line bg-bg-soft space-y-2 rounded-md border p-4">
                <div className="flex items-center gap-2">
                  <Badge variant="ok">AI draft</Badge>
                  <span className="text-accent font-mono text-lg font-semibold">{active.ai_score}</span>
                  {active.ai_graded_at && <span className="text-muted text-xs">· {relTime(active.ai_graded_at)}</span>}
                </div>
                {active.ai_strengths.length > 0 && (
                  <div>
                    <p className="text-muted text-xs uppercase">Strengths</p>
                    <ul className="text-ink/85 list-disc pl-5 text-sm">
                      {active.ai_strengths.map((s, i) => (<li key={i}>{s}</li>))}
                    </ul>
                  </div>
                )}
                {active.ai_weaknesses.length > 0 && (
                  <div>
                    <p className="text-muted text-xs uppercase">Improvement areas</p>
                    <ul className="text-ink/85 list-disc pl-5 text-sm">
                      {active.ai_weaknesses.map((s, i) => (<li key={i}>{s}</li>))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            <div className="space-y-3">
              <p className="text-muted text-xs">
                {active.human_reviewed_at
                  ? `Already published. Edit + Publish overrides.`
                  : active.ai_graded
                    ? "Approve sends AI's draft to the student. Edit values below to override before publishing."
                    : "No AI draft yet. Score manually below or run AI batch."}
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <Input
                  type="number"
                  min={0}
                  max={100}
                  placeholder="Score 0–100"
                  value={score}
                  onChange={(e) => setScore(e.target.value)}
                  className="max-w-[140px]"
                />
                {active.ai_graded && !active.human_reviewed_at && (
                  <Button variant="outline" onClick={approve} disabled={pending}>
                    Approve AI draft
                  </Button>
                )}
                {active.ai_graded && (
                  <Button onClick={publishEdited} disabled={pending}>
                    {active.human_reviewed_at ? "Re-publish" : "Edit + Publish"}
                  </Button>
                )}
                {!active.ai_graded && (
                  <Button onClick={gradeManually} disabled={pending}>
                    Grade + Publish
                  </Button>
                )}
              </div>
              <textarea
                rows={6}
                placeholder="Feedback (markdown)"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                className="border-line bg-input-bg text-ink placeholder:text-muted w-full rounded-md border p-3 text-sm"
              />
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
