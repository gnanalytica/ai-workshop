"use client";

import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import { Card, CardSub, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { upsertMyCapstone } from "@/lib/actions/capstone";
import type { CapstoneProject, CapstoneStatus } from "@/lib/queries/capstone";

const STATUSES: CapstoneStatus[] = ["exploring", "locked", "building", "shipped"];

const STATUS_TONE: Record<CapstoneStatus, "default" | "warn" | "accent" | "ok"> = {
  exploring: "default",
  locked: "warn",
  building: "accent",
  shipped: "ok",
};

export function CapstoneEditor({
  cohortId,
  initial,
}: {
  cohortId: string;
  initial: CapstoneProject | null;
}) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [problem, setProblem] = useState(initial?.problem_statement ?? "");
  const [target, setTarget] = useState(initial?.target_user ?? "");
  const [repo, setRepo] = useState(initial?.repo_url ?? "");
  const [demo, setDemo] = useState(initial?.demo_url ?? "");
  const [status, setStatus] = useState<CapstoneStatus>(initial?.status ?? "exploring");
  const [pending, start] = useTransition();

  // Resync local state if the prop changes (e.g. after a server action /
  // revalidatePath, or when admin previews as a different student).
  useEffect(() => {
    setTitle(initial?.title ?? "");
    setProblem(initial?.problem_statement ?? "");
    setTarget(initial?.target_user ?? "");
    setRepo(initial?.repo_url ?? "");
    setDemo(initial?.demo_url ?? "");
    setStatus(initial?.status ?? "exploring");
  }, [initial]);

  function save() {
    start(async () => {
      const r = await upsertMyCapstone({
        cohort_id: cohortId,
        title: title.trim() || null,
        problem_statement: problem.trim() || null,
        target_user: target.trim() || null,
        repo_url: repo.trim() || null,
        demo_url: demo.trim() || null,
        status,
      });
      if (r.ok) toast.success("Capstone saved");
      else toast.error(r.error);
    });
  }

  const isEmpty = !initial;

  return (
    <Card className="space-y-4 p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div className="min-w-0">
          <CardTitle>Project</CardTitle>
          {isEmpty && (
            <CardSub className="mt-1">
              This is your home base for the 30 days. Start with a title and the
              problem you&apos;re tackling — you can sharpen it as you go.
            </CardSub>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={STATUS_TONE[status]}>{status}</Badge>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as CapstoneStatus)}
            className="border-line bg-input-bg text-ink rounded-md border px-2 py-1.5 text-sm"
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <label className="text-muted text-xs uppercase tracking-wider">Title</label>
          <Input
            value={title}
            maxLength={140}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What are you building?"
            className="mt-1"
          />
        </div>

        <div>
          <label className="text-muted text-xs uppercase tracking-wider">Problem statement</label>
          <textarea
            rows={4}
            value={problem}
            maxLength={2000}
            onChange={(e) => setProblem(e.target.value)}
            placeholder="What problem does this solve, and why does it matter?"
            className="border-line bg-input-bg text-ink mt-1 w-full rounded-md border p-3 text-sm"
          />
        </div>

        <div>
          <label className="text-muted text-xs uppercase tracking-wider">Target user</label>
          <Input
            value={target}
            maxLength={280}
            onChange={(e) => setTarget(e.target.value)}
            placeholder="Who is this for?"
            className="mt-1"
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="text-muted text-xs uppercase tracking-wider">GitHub repo</label>
            <Input
              value={repo}
              onChange={(e) => setRepo(e.target.value)}
              placeholder="https://github.com/owner/repo"
              className="mt-1"
            />
            <CardSub className="mt-1 text-xs">Public GitHub URL only.</CardSub>
          </div>
          <div>
            <label className="text-muted text-xs uppercase tracking-wider">Demo URL</label>
            <Input
              value={demo}
              onChange={(e) => setDemo(e.target.value)}
              placeholder="https://…"
              className="mt-1"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={save} disabled={pending}>
          {pending ? "Saving…" : "Save"}
        </Button>
      </div>
    </Card>
  );
}
