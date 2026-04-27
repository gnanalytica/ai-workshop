"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Card, CardSub } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { relTime } from "@/lib/format";
import {
  createPodNote,
  setPodNoteFollowup,
  deletePodNote,
} from "@/lib/actions/faculty-pod-notes";
import type { PodNote } from "@/lib/queries/faculty-pod-notes";

export function PodNotesPanel({
  cohortId,
  studentId,
  notes,
  currentUserId,
}: {
  cohortId: string;
  studentId: string;
  notes: PodNote[];
  currentUserId: string;
}) {
  const [body, setBody] = useState("");
  const [followup, setFollowup] = useState(false);
  const [pending, start] = useTransition();

  function submit() {
    if (body.trim().length < 3) {
      toast.error("Note must be at least 3 characters");
      return;
    }
    start(async () => {
      const r = await createPodNote({
        cohort_id: cohortId,
        student_id: studentId,
        body_md: body.trim(),
        needs_followup: followup,
      });
      if (r.ok) {
        toast.success("Note added");
        setBody("");
        setFollowup(false);
      } else toast.error(r.error);
    });
  }

  function toggleFollowup(noteId: string, next: boolean) {
    start(async () => {
      const r = await setPodNoteFollowup({
        note_id: noteId,
        student_id: studentId,
        needs_followup: next,
      });
      if (r.ok) toast.success(next ? "Flagged for follow-up" : "Cleared");
      else toast.error(r.error);
    });
  }

  function remove(noteId: string) {
    if (!confirm("Delete this note?")) return;
    start(async () => {
      const r = await deletePodNote({ note_id: noteId, student_id: studentId });
      if (r.ok) toast.success("Deleted");
      else toast.error(r.error);
    });
  }

  return (
    <div className="space-y-3">
      <Card>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Observable, factual, 1–3 sentences. e.g. 'Missed Mon + Tue pre-class. DM'd Wed AM, said college mid-terms.'"
          rows={3}
          className="border-line bg-input-bg text-ink w-full rounded-md border px-3 py-2 text-sm"
          aria-label="Pod note body"
        />
        <div className="mt-2 flex items-center justify-between">
          <label className="text-muted flex items-center gap-2 text-xs">
            <input
              type="checkbox"
              className="accent-[hsl(var(--accent))]"
              checked={followup}
              onChange={(e) => setFollowup(e.target.checked)}
            />
            Flag for follow-up
          </label>
          <Button size="sm" onClick={submit} disabled={pending}>
            Add note
          </Button>
        </div>
      </Card>

      {notes.length === 0 ? (
        <Card>
          <CardSub>No pod notes yet for this student.</CardSub>
        </Card>
      ) : (
        <Card className="p-0">
          <ul className="divide-line/50 divide-y">
            {notes.map((n) => (
              <li key={n.id} className="space-y-1 px-5 py-3 text-sm">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-ink font-medium">{n.author_name ?? "—"}</span>
                  <span className="text-muted text-xs">{relTime(n.created_at)}</span>
                  {n.needs_followup && <Badge variant="warn">Needs follow-up</Badge>}
                </div>
                <p className="text-ink/90 whitespace-pre-line">{n.body_md}</p>
                <div className="flex items-center gap-2 pt-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => toggleFollowup(n.id, !n.needs_followup)}
                    disabled={pending}
                  >
                    {n.needs_followup ? "Clear follow-up" : "Flag follow-up"}
                  </Button>
                  {n.author_id === currentUserId && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => remove(n.id)}
                      disabled={pending}
                    >
                      Delete
                    </Button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
