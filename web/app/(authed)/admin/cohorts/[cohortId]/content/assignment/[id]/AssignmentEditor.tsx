"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { updateAssignment } from "@/lib/actions/content";
import type { AssignmentKind } from "@/lib/queries/assignment-detail";

interface Initial {
  id: string;
  title: string;
  body_md: string;
  kind: AssignmentKind;
  due_at: string | null;
  weight: number;
  auto_grade: boolean;
}

function toDateInput(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
}

export function AssignmentEditor({
  cohortId,
  initial,
}: {
  cohortId: string;
  initial: Initial;
}) {
  const [title, setTitle] = useState(initial.title);
  const [body, setBody] = useState(initial.body_md);
  const [kind, setKind] = useState<AssignmentKind>(initial.kind);
  const [due, setDue] = useState(toDateInput(initial.due_at));
  const [weight, setWeight] = useState(String(initial.weight));
  const [autoGrade, setAutoGrade] = useState(initial.auto_grade);
  const [pending, start] = useTransition();

  function save() {
    if (!title.trim()) {
      toast.error("Title required");
      return;
    }
    const w = Number(weight);
    if (!Number.isFinite(w) || w < 0 || w > 100) {
      toast.error("Weight must be 0–100");
      return;
    }
    start(async () => {
      const r = await updateAssignment({
        id: initial.id,
        cohort_id: cohortId,
        title: title.trim(),
        body_md: body.trim() ? body : null,
        kind,
        due_at: due ? new Date(due).toISOString() : null,
        weight: w,
        auto_grade: autoGrade,
      });
      if (r.ok) toast.success("Saved");
      else toast.error(r.error);
    });
  }

  return (
    <div className="space-y-4">
      <Field label="Title">
        <Input value={title} onChange={(e) => setTitle(e.target.value)} />
      </Field>

      <Field label="Body (markdown)" hint="Shown to students above the submit form">
        <textarea
          rows={10}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="What students should do, how to format the submission, what links to include…"
          className="border-line bg-input-bg text-ink w-full rounded-md border p-2 font-mono text-sm"
        />
      </Field>

      <div className="grid gap-3 sm:grid-cols-3">
        <Field label="Kind">
          <select
            value={kind}
            onChange={(e) => setKind(e.target.value as AssignmentKind)}
            className="border-line bg-input-bg text-ink w-full rounded-md border px-2 py-1.5 text-sm"
          >
            <option value="lab">Lab</option>
            <option value="capstone">Capstone</option>
            <option value="reflection">Reflection</option>
          </select>
        </Field>

        <Field label="Due date">
          <Input type="date" value={due} onChange={(e) => setDue(e.target.value)} />
        </Field>

        <Field label="Weight" hint="Used for scoring rollups">
          <Input
            inputMode="decimal"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
          />
        </Field>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={autoGrade}
          onChange={(e) => setAutoGrade(e.target.checked)}
        />
        <span>Auto-grade with AI on submission</span>
      </label>

      <div className="flex justify-end pt-2">
        <Button onClick={save} disabled={pending}>
          {pending ? "Saving…" : "Save changes"}
        </Button>
      </div>
    </div>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <div className="mb-1 flex items-baseline justify-between">
        <span className="text-ink text-xs font-semibold uppercase tracking-wider">
          {label}
        </span>
        {hint && <span className="text-muted text-[11px]">{hint}</span>}
      </div>
      {children}
    </label>
  );
}
