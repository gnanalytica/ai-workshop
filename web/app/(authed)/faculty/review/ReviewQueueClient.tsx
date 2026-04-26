"use client";

import { useState, useEffect } from "react";
import { Card, CardSub, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { PendingSubmission } from "@/lib/queries/faculty";
import { fmtDateTime, relTime } from "@/lib/format";

export function ReviewQueueClient({
  submissions,
  initialId,
}: {
  submissions: PendingSubmission[];
  initialId: string | null;
}) {
  const [activeId, setActiveId] = useState<string | null>(initialId ?? submissions[0]?.id ?? null);
  const active = submissions.find((s) => s.id === activeId) ?? null;
  useEffect(() => {
    if (!activeId && submissions[0]) setActiveId(submissions[0].id);
  }, [activeId, submissions]);

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
              {s.human_reviewed_at ? (
                <Badge variant="ok">Published · {s.score}</Badge>
              ) : s.ai_graded ? (
                <Badge variant="warn">AI · {s.ai_score}</Badge>
              ) : (
                <Badge variant="danger">Not graded</Badge>
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
                <a key={a.url} href={a.url} target="_blank" rel="noreferrer" className="border-line bg-card hover:border-accent/40 rounded-md border px-3 py-1.5 text-xs">
                  {a.name} ↗
                </a>
              ))}
            </div>
          )}

          {active.human_reviewed_at ? (
            <div className="border-line bg-bg-soft space-y-2 rounded-md border p-4">
              <div className="flex items-center gap-2">
                <Badge variant="ok">Published</Badge>
                <span className="text-accent font-mono text-lg font-semibold">{active.score}</span>
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
          ) : active.ai_graded ? (
            <Card>
              <CardSub>
                AI draft is ready (score {active.ai_score}). Awaiting trainer review before publishing to the student.
              </CardSub>
            </Card>
          ) : (
            <Card>
              <CardSub>
                Not yet graded. Trainer/admin will run AI batch or grade manually.
              </CardSub>
            </Card>
          )}
        </Card>
      )}
    </div>
  );
}
