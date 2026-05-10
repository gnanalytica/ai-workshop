"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Card, CardSub, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { setMilestoneFacultyNote } from "@/lib/actions/faculty-milestone-notes";
import { relTime } from "@/lib/format";
import type { PodMilestoneRow } from "@/lib/queries/faculty-pod-milestones";

interface Props {
  rows: PodMilestoneRow[];
}

export function PodMilestoneNotes({ rows }: Props) {
  if (rows.length === 0) {
    return (
      <Card>
        <CardTitle className="mb-1 text-base">Milestone notes</CardTitle>
        <CardSub>
          No pod members have submitted a milestone yet. Once a student saves a draft
          or submits, you&apos;ll be able to leave coaching notes here.
        </CardSub>
      </Card>
    );
  }

  // group by student
  const byStudent = new Map<string, PodMilestoneRow[]>();
  for (const r of rows) {
    const list = byStudent.get(r.user_id) ?? [];
    list.push(r);
    byStudent.set(r.user_id, list);
  }

  return (
    <Card className="space-y-4">
      <div>
        <CardTitle className="text-base">Milestone notes</CardTitle>
        <CardSub className="mt-1">
          Coaching notes only — visible to the student. You can&apos;t set a grade;
          admins handle scoring.
        </CardSub>
      </div>
      <div className="divide-line space-y-4 divide-y">
        {Array.from(byStudent.entries()).map(([uid, items]) => (
          <StudentBlock key={uid} items={items} />
        ))}
      </div>
    </Card>
  );
}

function StudentBlock({ items }: { items: PodMilestoneRow[] }) {
  const name = items[0]?.user_name ?? "Student";
  return (
    <section className="pt-4 first:pt-0">
      <p className="text-ink mb-2 text-sm font-medium">{name}</p>
      <div className="space-y-2">
        {items.slice(0, 3).map((row) => (
          <NoteRow key={row.submission_id} row={row} />
        ))}
      </div>
    </section>
  );
}

function NoteRow({ row }: { row: PodMilestoneRow }) {
  const [note, setNote] = useState(row.faculty_notes_md ?? "");
  const [pending, start] = useTransition();
  const dirty = note !== (row.faculty_notes_md ?? "");

  function save() {
    start(async () => {
      const r = await setMilestoneFacultyNote({
        submission_id: row.submission_id,
        note,
      });
      if (r.ok) toast.success("Note saved");
      else toast.error(r.error);
    });
  }

  return (
    <div className="border-line/60 rounded-md border p-3">
      <div className="mb-2 flex flex-wrap items-baseline gap-2">
        <Badge>M{row.milestone_number}</Badge>
        <span className="text-muted font-mono text-xs">
          D{String(row.day_number).padStart(2, "0")}
        </span>
        <span className="text-ink/90 min-w-0 flex-1 break-words text-sm">
          {row.assignment_title}
        </span>
        <span
          className={
            row.status === "graded"
              ? "text-success text-xs"
              : row.status === "submitted"
                ? "text-accent text-xs"
                : "text-warn text-xs"
          }
        >
          {row.status}
        </span>
        <span className="text-muted text-xs">{relTime(row.updated_at)}</span>
      </div>

      {row.body && (
        <p className="text-ink/80 mb-2 text-xs italic whitespace-pre-line">
          {row.body.slice(0, 220)}
          {row.body.length > 220 ? "…" : ""}
        </p>
      )}

      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        rows={2}
        placeholder="Coaching note… (e.g., 'Tighten the one-line pitch — it's two ideas right now.')"
        className="border-line bg-card text-ink placeholder:text-muted/70 w-full rounded-md border px-2 py-1.5 text-sm"
      />

      <div className="mt-1.5 flex justify-end">
        <Button
          size="sm"
          variant="outline"
          onClick={save}
          disabled={!dirty || pending}
        >
          {pending ? "Saving…" : dirty ? "Save note" : "Saved"}
        </Button>
      </div>
    </div>
  );
}
