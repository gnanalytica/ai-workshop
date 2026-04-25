"use client";

import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import { Card, CardSub, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { gradeSubmission } from "@/lib/actions/grading";
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
    setScore("");
    setFeedback("");
  }, [activeId]);

  function submit() {
    if (!active) return;
    const numeric = Number(score);
    if (!Number.isFinite(numeric) || numeric < 0 || numeric > 100) {
      toast.error("Score must be 0-100");
      return;
    }
    start(async () => {
      const r = await gradeSubmission({ submission_id: active.id, score: numeric, feedback });
      if (r.ok) {
        toast.success("Graded");
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
            <p className="text-muted mt-0.5 text-[10px]">{relTime(s.updated_at)}</p>
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

          <div>
            <Badge>Body preview pending wiring; open via /admin/student/&lt;id&gt; for full work.</Badge>
          </div>

          {canGrade ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min={0}
                  max={100}
                  placeholder="Score 0–100"
                  value={score}
                  onChange={(e) => setScore(e.target.value)}
                  className="max-w-[140px]"
                />
                <Button onClick={submit} disabled={pending}>
                  {pending ? "Grading…" : "Save grade"}
                </Button>
              </div>
              <textarea
                rows={5}
                placeholder="Feedback (optional)"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                className="border-line bg-input-bg text-ink placeholder:text-muted w-full rounded-md border p-3 text-sm"
              />
            </div>
          ) : (
            <Card>
              <CardSub>Read-only view for executive faculty.</CardSub>
            </Card>
          )}
        </Card>
      )}
    </div>
  );
}
