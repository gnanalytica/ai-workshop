"use client";

import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import { Card, CardSub, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { overrideGrade } from "@/lib/actions/submissions";
import type { PendingSubmission } from "@/lib/queries/faculty";
import { fmtDateTime, relTime } from "@/lib/format";

export function ReviewQueueClient({
  submissions,
  initialId,
  canGrade,
}: {
  submissions: PendingSubmission[];
  initialId: string | null;
  canGrade: boolean;
}) {
  const [activeId, setActiveId] = useState<string | null>(initialId ?? submissions[0]?.id ?? null);
  const [score, setScore] = useState<string>("");
  const [feedback, setFeedback] = useState("");
  const [pending, start] = useTransition();
  const active = submissions.find((s) => s.id === activeId) ?? null;

  useEffect(() => {
    if (active) {
      setScore(active.score?.toString() ?? active.ai_score?.toString() ?? "");
      setFeedback(active.ai_feedback_md ?? "");
    } else {
      setScore("");
      setFeedback("");
    }
  }, [active]);

  function submit() {
    if (!active) return;
    const numeric = Number(score);
    if (!Number.isFinite(numeric) || numeric < 0 || numeric > 100) {
      toast.error("Score must be 0-100");
      return;
    }
    start(async () => {
      const r = await overrideGrade({ submission_id: active.id, score: numeric, feedback_md: feedback });
      if (r.ok) {
        toast.success("Saved override");
        setActiveId(submissions.find((s) => s.id !== active.id)?.id ?? null);
      } else {
        toast.error(r.error);
      }
    });
  }

  function approveAsIs() {
    if (!active) return;
    start(async () => {
      const r = await overrideGrade({ submission_id: active.id });
      if (r.ok) {
        toast.success("Approved");
        setActiveId(submissions.find((s) => s.id !== active.id)?.id ?? null);
      } else {
        toast.error(r.error);
      }
    });
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
      <aside className="space-y-2">
        {submissions.map((s) => (
          <button
            key={s.id}
            onClick={() => setActiveId(s.id)}
            className={
              "w-full rounded-md border p-3 text-left transition-colors " +
              (s.id === activeId
                ? "border-accent bg-accent/10"
                : "border-line bg-card hover:border-accent/40")
            }
          >
            <p className="text-ink truncate text-sm font-medium">{s.user_name ?? "—"}</p>
            <p className="text-muted mt-0.5 truncate text-xs">
              D{String(s.day_number).padStart(2, "0")} · {s.assignment_title}
            </p>
            <div className="mt-1 flex items-center gap-1">
              {s.ai_graded ? (
                <Badge variant="ok">AI · {s.ai_score}</Badge>
              ) : (
                <Badge variant="warn">Not graded</Badge>
              )}
              <span className="text-muted text-[10px]">{relTime(s.updated_at)}</span>
            </div>
          </button>
        ))}
      </aside>

      {!active ? (
        <Card><CardSub>Pick a submission from the left.</CardSub></Card>
      ) : (
        <Card className="space-y-5 p-6">
          <div>
            <p className="text-accent font-mono text-xs tracking-widest uppercase">
              Day {active.day_number} · {active.assignment_title}
            </p>
            <CardTitle className="mt-1">{active.user_name ?? "—"}</CardTitle>
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
                <a
                  key={a.url}
                  href={a.url}
                  target="_blank"
                  rel="noreferrer"
                  className="border-line bg-card hover:border-accent/40 rounded-md border px-3 py-1.5 text-xs"
                >
                  {a.name} ↗
                </a>
              ))}
            </div>
          )}

          {active.ai_graded && (
            <div className="border-line bg-bg-soft space-y-3 rounded-md border p-4">
              <div className="flex items-center gap-2">
                <Badge variant="ok">AI graded</Badge>
                <span className="text-accent font-mono text-lg font-semibold">{active.ai_score}</span>
                <span className="text-muted text-xs">
                  · {active.ai_graded_at ? relTime(active.ai_graded_at) : ""}
                </span>
              </div>
              {active.ai_strengths.length > 0 && (
                <div>
                  <p className="text-muted mb-1 text-xs uppercase tracking-wider">Strengths</p>
                  <ul className="text-ink/85 list-disc pl-5 text-sm">
                    {active.ai_strengths.map((s, i) => (<li key={i}>{s}</li>))}
                  </ul>
                </div>
              )}
              {active.ai_weaknesses.length > 0 && (
                <div>
                  <p className="text-muted mb-1 text-xs uppercase tracking-wider">Improvement areas</p>
                  <ul className="text-ink/85 list-disc pl-5 text-sm">
                    {active.ai_weaknesses.map((s, i) => (<li key={i}>{s}</li>))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {canGrade ? (
            <div className="space-y-3">
              <p className="text-muted text-xs">
                AI has already graded this. Override only if needed; otherwise approve as-is.
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
                <Button variant="outline" onClick={approveAsIs} disabled={pending}>
                  Approve AI grade
                </Button>
                <Button onClick={submit} disabled={pending}>
                  {pending ? "Saving…" : "Save override"}
                </Button>
              </div>
              <textarea
                rows={6}
                placeholder="Feedback (defaults to AI's draft — edit as needed)"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                className="border-line bg-input-bg text-ink placeholder:text-muted w-full rounded-md border p-3 text-sm"
              />
            </div>
          ) : (
            <Card>
              <CardSub>Read-only view.</CardSub>
            </Card>
          )}
        </Card>
      )}
    </div>
  );
}
