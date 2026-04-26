"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { upsertQuizQuestion, deleteQuizQuestion } from "@/lib/actions/content";
import type { QuizQuestionRow, QuizKind } from "@/lib/queries/quiz-detail";

type Draft = QuizQuestionRow & { _key: string };

function makeKey() {
  return Math.random().toString(36).slice(2, 10);
}

function nextOrdinal(rows: Draft[]) {
  return (rows.reduce((m, r) => Math.max(m, r.ordinal), 0) || 0) + 1;
}

function emptyDraft(ordinal: number): Draft {
  return {
    _key: makeKey(),
    ordinal,
    prompt: "",
    kind: "single",
    options: [
      { id: "a", label: "" },
      { id: "b", label: "" },
    ],
    answer: "a",
  };
}

export function QuestionsEditor({
  cohortId,
  quizId,
  initial,
}: {
  cohortId: string;
  quizId: string;
  initial: QuizQuestionRow[];
}) {
  const [drafts, setDrafts] = useState<Draft[]>(
    initial.map((q) => ({ ...q, _key: makeKey() })),
  );
  const [pending, start] = useTransition();

  function update(idx: number, patch: Partial<Draft>) {
    setDrafts((arr) => arr.map((d, i) => (i === idx ? { ...d, ...patch } : d)));
  }

  function addQuestion() {
    setDrafts((arr) => [...arr, emptyDraft(nextOrdinal(arr))]);
  }

  function removeLocal(idx: number) {
    setDrafts((arr) => arr.filter((_, i) => i !== idx));
  }

  function save(idx: number) {
    const d = drafts[idx];
    if (!d) return;
    if (!d.prompt.trim()) {
      toast.error("Prompt required");
      return;
    }
    start(async () => {
      const r = await upsertQuizQuestion({
        cohort_id: cohortId,
        quiz_id: quizId,
        ordinal: d.ordinal,
        prompt: d.prompt.trim(),
        kind: d.kind,
        options: d.kind === "short" ? [] : d.options.filter((o) => o.label.trim()),
        answer: d.answer,
      });
      if (r.ok) toast.success(`Saved Q${d.ordinal}`);
      else toast.error(r.error);
    });
  }

  function remove(idx: number) {
    const d = drafts[idx];
    if (!d) return;
    if (!window.confirm(`Delete Q${d.ordinal}?`)) return;
    start(async () => {
      const r = await deleteQuizQuestion({
        cohort_id: cohortId,
        quiz_id: quizId,
        ordinal: d.ordinal,
      });
      if (r.ok) {
        toast.success("Deleted");
        removeLocal(idx);
      } else toast.error(r.error);
    });
  }

  return (
    <div className="space-y-6">
      {drafts.length === 0 && (
        <p className="text-muted text-sm">No questions yet. Add one to get started.</p>
      )}
      {drafts.map((d, idx) => (
        <div key={d._key} className="border-line space-y-3 rounded-md border p-4">
          <div className="flex items-center justify-between">
            <Badge>Q{d.ordinal}</Badge>
            <div className="flex gap-2">
              <Button size="sm" onClick={() => save(idx)} disabled={pending}>
                Save
              </Button>
              <Button size="sm" variant="danger" onClick={() => remove(idx)} disabled={pending}>
                Delete
              </Button>
            </div>
          </div>

          <textarea
            rows={2}
            value={d.prompt}
            onChange={(e) => update(idx, { prompt: e.target.value })}
            placeholder="Question prompt"
            className="border-line bg-input-bg text-ink w-full rounded-md border p-2 text-sm"
          />

          <div className="flex items-center gap-3 text-xs">
            <label className="text-muted">Type</label>
            <select
              value={d.kind}
              onChange={(e) => {
                const kind = e.target.value as QuizKind;
                update(idx, {
                  kind,
                  answer: kind === "multi" ? [] : kind === "single" ? d.options[0]?.id ?? "" : "",
                });
              }}
              className="border-line bg-input-bg text-ink rounded-md border px-2 py-1"
            >
              <option value="single">Single choice</option>
              <option value="multi">Multiple choice</option>
              <option value="short">Short answer</option>
            </select>
          </div>

          {d.kind === "short" ? (
            <Input
              placeholder="Correct answer (case-insensitive)"
              value={(d.answer as string) ?? ""}
              onChange={(e) => update(idx, { answer: e.target.value })}
            />
          ) : (
            <div className="space-y-2">
              {d.options.map((opt, oi) => {
                const checked =
                  d.kind === "multi"
                    ? Array.isArray(d.answer) && (d.answer as string[]).includes(opt.id)
                    : d.answer === opt.id;
                return (
                  <div key={opt.id} className="flex items-center gap-2">
                    <input
                      type={d.kind === "multi" ? "checkbox" : "radio"}
                      name={`q-${d._key}-correct`}
                      checked={checked}
                      onChange={() => {
                        if (d.kind === "multi") {
                          const arr = Array.isArray(d.answer) ? [...(d.answer as string[])] : [];
                          if (checked) arr.splice(arr.indexOf(opt.id), 1);
                          else arr.push(opt.id);
                          update(idx, { answer: arr });
                        } else {
                          update(idx, { answer: opt.id });
                        }
                      }}
                    />
                    <Input
                      value={opt.label}
                      onChange={(e) => {
                        const opts = d.options.map((o, j) => (j === oi ? { ...o, label: e.target.value } : o));
                        update(idx, { options: opts });
                      }}
                      placeholder={`Option ${opt.id}`}
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        const opts = d.options.filter((_, j) => j !== oi);
                        update(idx, { options: opts });
                      }}
                    >
                      −
                    </Button>
                  </div>
                );
              })}
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  const id = String.fromCharCode(97 + d.options.length);
                  update(idx, { options: [...d.options, { id, label: "" }] });
                }}
              >
                + Add option
              </Button>
            </div>
          )}
        </div>
      ))}

      <Button onClick={addQuestion} disabled={pending}>
        + Add question
      </Button>
    </div>
  );
}
