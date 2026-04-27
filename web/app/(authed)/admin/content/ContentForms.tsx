"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Card, CardSub, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  createAssignment,
  deleteAssignment,
  createQuiz,
} from "@/lib/actions/content";
import type { AssignmentRow, QuizRow } from "@/lib/queries/content";
import { fmtDate } from "@/lib/format";

type AKind = AssignmentRow["kind"];

export function NewAssignmentForm({ cohortId }: { cohortId: string }) {
  const [day, setDay] = useState("1");
  const [kind, setKind] = useState<AKind>("lab");
  const [title, setTitle] = useState("");
  const [due, setDue] = useState("");
  const [pending, start] = useTransition();

  function submit() {
    start(async () => {
      const r = await createAssignment({
        cohort_id: cohortId,
        day_number: Number(day),
        kind,
        title: title.trim(),
        due_at: due ? new Date(due).toISOString() : null,
      });
      if (r.ok) {
        toast.success("Assignment created");
        setTitle("");
        setDue("");
      } else toast.error(r.error);
    });
  }

  return (
    <Card className="space-y-3 p-5">
      <CardTitle>New assignment</CardTitle>
      <div className="flex gap-2">
        <Input value={day} onChange={(e) => setDay(e.target.value)} placeholder="Day" inputMode="numeric" className="w-20" />
        <select
          value={kind}
          onChange={(e) => setKind(e.target.value as AKind)}
          className="border-line bg-input-bg text-ink rounded-md border px-2 py-1.5 text-sm"
        >
          <option value="lab">Lab</option>
          <option value="capstone">Capstone</option>
          <option value="reflection">Reflection</option>
          <option value="quiz">Quiz</option>
        </select>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" className="flex-1" />
      </div>
      <Input type="date" value={due} onChange={(e) => setDue(e.target.value)} />
      <Button onClick={submit} disabled={pending || !title || !day}>
        {pending ? "Creating…" : "Create"}
      </Button>
    </Card>
  );
}

export function AssignmentRowActions({
  row,
  cohortId,
}: {
  row: AssignmentRow;
  cohortId: string;
}) {
  const [pending, start] = useTransition();
  function remove() {
    if (!window.confirm(`Delete "${row.title}"?`)) return;
    start(async () => {
      const r = await deleteAssignment({ id: row.id, cohort_id: cohortId });
      if (r.ok) toast.success("Deleted");
      else toast.error(r.error);
    });
  }
  return (
    <Button size="sm" variant="danger" onClick={remove} disabled={pending}>
      Delete
    </Button>
  );
}

export function AssignmentsTable({
  rows,
  cohortId,
}: {
  rows: AssignmentRow[];
  cohortId: string;
}) {
  if (rows.length === 0) return <Card><CardSub>No assignments yet.</CardSub></Card>;
  return (
    <div className="border-line overflow-hidden rounded-lg border">
      <table className="w-full text-sm">
        <thead className="bg-bg-soft text-muted text-xs uppercase">
          <tr>
            <th className="w-16 px-3 py-2 text-left">Day</th>
            <th className="px-3 py-2 text-left">Title</th>
            <th className="w-28 px-3 py-2 text-left">Kind</th>
            <th className="w-32 px-3 py-2 text-left">Due</th>
            <th className="w-28 px-3 py-2 text-right">Subs</th>
            <th className="w-24 px-3 py-2"></th>
          </tr>
        </thead>
        <tbody>
          {rows.map((a) => (
            <tr key={a.id} className="border-line border-t">
              <td className="px-3 py-2 font-mono text-xs">D{String(a.day_number).padStart(2, "0")}</td>
              <td className="px-3 py-2">{a.title}</td>
              <td className="px-3 py-2"><Badge>{a.kind}</Badge></td>
              <td className="text-muted px-3 py-2 text-xs">{a.due_at ? fmtDate(a.due_at) : "—"}</td>
              <td className="px-3 py-2 text-right tabular-nums">{a.submission_count}</td>
              <td className="px-3 py-2 text-right">
                <AssignmentRowActions row={a} cohortId={cohortId} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function NewQuizForm({ cohortId }: { cohortId: string }) {
  const [day, setDay] = useState("1");
  const [title, setTitle] = useState("");
  const [pending, start] = useTransition();

  function submit() {
    start(async () => {
      const r = await createQuiz({
        cohort_id: cohortId,
        day_number: Number(day),
        title: title.trim(),
      });
      if (r.ok) {
        toast.success("Quiz created. Add questions in SQL or via the future editor.");
        setTitle("");
      } else toast.error(r.error);
    });
  }

  return (
    <Card className="space-y-3 p-5">
      <CardTitle>New quiz</CardTitle>
      <div className="flex gap-2">
        <Input value={day} onChange={(e) => setDay(e.target.value)} placeholder="Day" inputMode="numeric" className="w-20" />
        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" className="flex-1" />
      </div>
      <Button onClick={submit} disabled={pending || !title || !day}>
        {pending ? "Creating…" : "Create"}
      </Button>
    </Card>
  );
}

export function QuizzesTable({ rows, cohortId }: { rows: QuizRow[]; cohortId: string }) {
  if (rows.length === 0) return <Card><CardSub>No quizzes yet.</CardSub></Card>;
  return (
    <div className="border-line overflow-hidden rounded-lg border">
      <table className="w-full text-sm">
        <thead className="bg-bg-soft text-muted text-xs uppercase">
          <tr>
            <th className="w-16 px-3 py-2 text-left">Day</th>
            <th className="px-3 py-2 text-left">Title</th>
            <th className="w-20 px-3 py-2 text-left">Ver</th>
            <th className="w-28 px-3 py-2 text-right">Q</th>
            <th className="w-28 px-3 py-2 text-right">Attempts</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((q) => (
            <tr key={q.id} className="border-line border-t">
              <td className="px-3 py-2 font-mono text-xs">D{String(q.day_number).padStart(2, "0")}</td>
              <td className="px-3 py-2">
                <Link
                  href={`/admin/cohorts/${cohortId}/content/quiz/${q.id}`}
                  className="text-accent hover:underline"
                >
                  {q.title}
                </Link>
              </td>
              <td className="text-muted px-3 py-2 text-xs">v{q.version}</td>
              <td className="px-3 py-2 text-right tabular-nums">{q.question_count}</td>
              <td className="px-3 py-2 text-right tabular-nums">{q.attempt_count}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
