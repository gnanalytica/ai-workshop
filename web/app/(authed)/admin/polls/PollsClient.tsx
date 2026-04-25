"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Card, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createPoll } from "@/lib/actions/polls";

export function PollsClient({ cohortId }: { cohortId: string }) {
  const [question, setQuestion] = useState("");
  const [optionsRaw, setOptionsRaw] = useState("Yes\nNo");
  const [day, setDay] = useState<string>("");
  const [pending, start] = useTransition();

  function submit() {
    const options = optionsRaw.split("\n").map((s) => s.trim()).filter(Boolean);
    if (!question || options.length < 2) {
      toast.error("Need a question and ≥ 2 options");
      return;
    }
    start(async () => {
      const r = await createPoll({
        cohort_id: cohortId,
        question,
        options,
        day_number: day ? Number(day) : undefined,
      });
      if (r.ok) {
        toast.success("Poll created");
        setQuestion("");
        setOptionsRaw("Yes\nNo");
        setDay("");
      } else toast.error(r.error);
    });
  }

  return (
    <Card className="p-5">
      <CardTitle>New poll</CardTitle>
      <div className="mt-3 space-y-3">
        <Input
          placeholder="Question"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
        />
        <textarea
          rows={4}
          placeholder="One option per line"
          value={optionsRaw}
          onChange={(e) => setOptionsRaw(e.target.value)}
          className="border-line bg-input-bg text-ink w-full rounded-md border p-3 font-mono text-xs"
        />
        <div className="flex items-center gap-2">
          <Input
            type="number"
            min={1}
            max={30}
            placeholder="Day (optional)"
            value={day}
            onChange={(e) => setDay(e.target.value)}
            className="max-w-[160px]"
          />
          <div className="flex-1" />
          <Button onClick={submit} disabled={pending}>
            {pending ? "Creating…" : "Create poll"}
          </Button>
        </div>
      </div>
    </Card>
  );
}
