"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Search, X } from "lucide-react";
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

type Filter = "all" | "ungraded" | "ai_draft" | "published";

const FILTER_LABELS: Record<Filter, string> = {
  all: "All",
  ungraded: "Ungraded",
  ai_draft: "AI draft",
  published: "Published",
};

function bucket(s: GradingSubmission): Filter {
  if (s.human_reviewed_at) return "published";
  if (s.ai_graded) return "ai_draft";
  if (s.status === "submitted") return "ungraded";
  return "all";
}

export function GradingClient({
  assignmentId,
  autoGrade,
  initial,
}: {
  assignmentId: string;
  autoGrade: boolean;
  initial: GradingSubmission[];
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [filter, setFilter] = useState<Filter>("all");
  const [q, setQ] = useState("");
  const [autoAdvance, setAutoAdvance] = useState(true);
  const [activeId, setActiveId] = useState<string | null>(initial[0]?.id ?? null);
  const [score, setScore] = useState<string>("");
  const [feedback, setFeedback] = useState<string>("");

  const counts = useMemo(() => {
    const c: Record<Filter, number> = { all: initial.length, ungraded: 0, ai_draft: 0, published: 0 };
    for (const s of initial) c[bucket(s)] += 1;
    return c;
  }, [initial]);

  const visible = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return initial.filter((s) => {
      if (filter !== "all" && bucket(s) !== filter) return false;
      if (needle && !(s.user_name ?? "").toLowerCase().includes(needle)) return false;
      return true;
    });
  }, [initial, filter, q]);

  const active = initial.find((s) => s.id === activeId) ?? null;

  function loadActive(s: GradingSubmission | null) {
    setActiveId(s?.id ?? null);
    setScore(s?.score?.toString() ?? s?.ai_score?.toString() ?? "");
    setFeedback(s?.feedback_md ?? s?.ai_feedback_md ?? "");
  }

  function advanceAfterPublish() {
    if (!active || !autoAdvance) return;
    // Next ungraded / AI-draft in the visible list (after the current one).
    // Falls back to first non-published if we've wrapped around.
    const idx = visible.findIndex((s) => s.id === active.id);
    const after = visible.slice(idx + 1).find((s) => !s.human_reviewed_at);
    const next = after ?? visible.find((s) => !s.human_reviewed_at && s.id !== active.id);
    if (next) loadActive(next);
  }

  function runBatch() {
    start(async () => {
      const r = await batchGradeAssignment({ assignment_id: assignmentId });
      if (r.ok && r.data) {
        toast.success(
          `AI graded ${r.data.graded} · ${r.data.failed} failed · ${r.data.skipped} skipped`,
        );
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
        toast.success("Published");
        advanceAfterPublish();
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
        advanceAfterPublish();
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
        advanceAfterPublish();
        router.refresh();
      } else toast.error(r.error);
    });
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          {(Object.keys(FILTER_LABELS) as Filter[]).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={
                "rounded-full border px-3 py-1 text-xs font-medium transition-colors " +
                (filter === f
                  ? "border-accent bg-accent/10 text-accent"
                  : "border-line text-muted hover:text-ink")
              }
            >
              {FILTER_LABELS[f]}
              <span className="ml-1.5 opacity-70">{counts[f]}</span>
            </button>
          ))}
        </div>

        {autoGrade && (
          <div className="flex flex-wrap items-center gap-2">
            <label className="text-muted flex cursor-pointer items-center gap-1.5 text-xs">
              <input
                type="checkbox"
                checked={autoAdvance}
                onChange={(e) => setAutoAdvance(e.target.checked)}
                className="accent-[hsl(var(--accent))]"
              />
              Auto-advance after publish
            </label>
            <Button onClick={runBatch} disabled={pending} size="sm">
              {pending ? "Running…" : "Run AI batch"}
            </Button>
          </div>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-[300px_1fr]">
        <aside className="space-y-2">
          <div className="border-line bg-card relative rounded-md border">
            <Search
              size={13}
              className="text-muted pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2"
            />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search student…"
              className="text-ink placeholder:text-muted/70 w-full bg-transparent py-1.5 pr-7 pl-7 text-sm outline-none"
            />
            {q && (
              <button
                type="button"
                onClick={() => setQ("")}
                className="text-muted hover:text-ink absolute top-1/2 right-2 -translate-y-1/2"
                aria-label="Clear search"
              >
                <X size={12} />
              </button>
            )}
          </div>

          <div className="max-h-[70vh] space-y-1.5 overflow-y-auto pr-1">
            {visible.length === 0 ? (
              <Card>
                <CardSub>
                  {initial.length === 0
                    ? "No submissions yet."
                    : "No submissions match this filter."}
                </CardSub>
              </Card>
            ) : (
              visible.map((s) => (
                <button
                  key={s.id}
                  onClick={() => loadActive(s)}
                  className={
                    "w-full rounded-md border p-2 text-left transition-colors " +
                    (s.id === activeId
                      ? "border-accent bg-accent/10"
                      : "border-line bg-card hover:border-accent/40")
                  }
                >
                  <p className="text-ink truncate text-sm font-medium">
                    {s.user_name ?? "—"}
                  </p>
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
                  <p className="text-muted mt-1 text-[10px]">
                    {relTime(s.updated_at)}
                  </p>
                </button>
              ))
            )}
          </div>
        </aside>

        {!active ? (
          <Card>
            <CardSub>
              Pick a submission from the list. Use the filter chips above to
              focus on what needs grading.
            </CardSub>
          </Card>
        ) : (
          <Card className="space-y-5 p-6">
            <div>
              <CardTitle>{active.user_name ?? "—"}</CardTitle>
              <p className="text-muted mt-1 text-xs">
                Submitted {fmtDateTime(active.updated_at)} ·{" "}
                {relTime(active.updated_at)}
              </p>
            </div>

            <div className="bg-bg-soft border-line max-h-72 overflow-y-auto rounded-md border p-4 text-sm whitespace-pre-line">
              {active.body || (
                <span className="text-muted italic">— empty —</span>
              )}
            </div>
            {active.links.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {active.links.map((l) => (
                  <a
                    key={l.url}
                    href={l.url}
                    target="_blank"
                    rel="noreferrer"
                    className="border-line bg-card hover:border-accent/40 rounded-md border px-3 py-1.5 text-xs"
                  >
                    {l.label} ↗
                  </a>
                ))}
              </div>
            )}

            {active.ai_graded && (
              <div className="border-line bg-bg-soft space-y-2 rounded-md border p-4">
                <div className="flex items-center gap-2">
                  <Badge variant="ok">AI draft</Badge>
                  <span className="text-accent font-mono text-lg font-semibold">
                    {active.ai_score}
                  </span>
                  {active.ai_graded_at && (
                    <span className="text-muted text-xs">
                      · {relTime(active.ai_graded_at)}
                    </span>
                  )}
                </div>
                {active.ai_strengths.length > 0 && (
                  <div>
                    <p className="text-muted text-xs uppercase">Strengths</p>
                    <ul className="text-ink/85 list-disc pl-5 text-sm">
                      {active.ai_strengths.map((s, i) => (
                        <li key={i}>{s}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {active.ai_weaknesses.length > 0 && (
                  <div>
                    <p className="text-muted text-xs uppercase">
                      Improvement areas
                    </p>
                    <ul className="text-ink/85 list-disc pl-5 text-sm">
                      {active.ai_weaknesses.map((s, i) => (
                        <li key={i}>{s}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            <div className="space-y-3">
              <p className="text-muted text-xs">
                {active.human_reviewed_at
                  ? "Already published. Edit + Re-publish to override."
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
