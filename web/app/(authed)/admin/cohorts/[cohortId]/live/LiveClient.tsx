"use client";

import { useEffect, useState, useTransition, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card, CardSub, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { createPoll, closePoll } from "@/lib/actions/polls";

interface ActivePoll {
  id: string;
  question: string;
  options: { id: string; label: string }[];
  opened_at: string;
  closes_at: string | null;
  vote_count: number;
  chart: ReactNode;
}

const DURATIONS: { label: string; minutes: number | null }[] = [
  { label: "1m", minutes: 1 },
  { label: "2m", minutes: 2 },
  { label: "5m", minutes: 5 },
  { label: "10m", minutes: 10 },
  { label: "Open", minutes: null },
];

function fmtRemaining(closesAt: string | null): string | null {
  if (!closesAt) return null;
  const ms = new Date(closesAt).getTime() - Date.now();
  if (ms <= 0) return "0:00";
  const total = Math.floor(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function LiveClient({
  cohortId,
  active,
  hasActive,
}: {
  cohortId: string;
  active: ActivePoll[];
  hasActive: boolean;
}) {
  const router = useRouter();
  const [question, setQuestion] = useState("");
  const [optionsRaw, setOptionsRaw] = useState("Yes\nNo");
  const [duration, setDuration] = useState<number | null>(1);
  const [pending, start] = useTransition();
  const [, force] = useState(0);

  useEffect(() => {
    if (!hasActive) return;
    const tick = setInterval(() => force((n) => n + 1), 1000);
    const refresh = setInterval(() => router.refresh(), 5000);
    return () => {
      clearInterval(tick);
      clearInterval(refresh);
    };
  }, [hasActive, router]);

  function fire() {
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
        duration_minutes: duration ?? undefined,
      });
      if (r.ok) {
        toast.success("Poll fired");
        setQuestion("");
        setOptionsRaw("Yes\nNo");
        router.refresh();
      } else toast.error(r.error);
    });
  }

  function endNow(pollId: string) {
    start(async () => {
      const r = await closePoll({ poll_id: pollId, cohort_id: cohortId });
      if (r.ok) {
        toast.success("Closed");
        router.refresh();
      } else toast.error(r.error);
    });
  }

  return (
    <div className="space-y-4">
      <Card className={hasActive ? "p-5" : "mx-auto max-w-xl p-6"}>
        <CardTitle>Fire a poll</CardTitle>
        <CardSub className="mt-1">
          One question. The room sees it within 15 seconds.
        </CardSub>
        <div className="mt-4 space-y-3">
          <Input
            placeholder="Your question"
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
          <div className="flex flex-wrap items-center gap-2">
            {DURATIONS.map((d) => (
              <button
                key={d.label}
                type="button"
                onClick={() => setDuration(d.minutes)}
                className={
                  "rounded-md border px-3 py-1.5 font-mono text-xs uppercase tracking-wider transition-colors " +
                  (duration === d.minutes
                    ? "border-accent bg-accent/10 text-accent"
                    : "border-line text-muted hover:border-accent/40 hover:text-ink")
                }
              >
                {d.label}
              </button>
            ))}
            <div className="flex-1" />
            <Button onClick={fire} disabled={pending}>
              {pending ? "Firing…" : "Fire poll"}
            </Button>
          </div>
        </div>
      </Card>

      {active.length > 0 && (
        <div className="space-y-3">
          {active.map((p) => {
            const remaining = fmtRemaining(p.closes_at);
            return (
              <Card key={p.id} className="space-y-3 p-5">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <CardTitle className="min-w-0 break-words">{p.question}</CardTitle>
                  <div className="flex items-center gap-2">
                    {remaining && (
                      <Badge variant="accent">
                        <span className="font-mono tabular-nums">{remaining}</span>
                      </Badge>
                    )}
                    <Badge>{p.vote_count} votes</Badge>
                    <Button size="sm" variant="outline" onClick={() => endNow(p.id)} disabled={pending}>
                      End now
                    </Button>
                  </div>
                </div>
                {p.chart}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
