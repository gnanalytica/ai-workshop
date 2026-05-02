"use client";

import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { startQuizSession, stopQuizSession } from "@/lib/actions/quizzes";

function fmt(ms: number): string {
  if (ms <= 0) return "0:00";
  const total = Math.floor(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function LiveSessionControls({
  quizId,
  closesAt,
}: {
  quizId: string;
  closesAt: string | null;
}) {
  const [duration, setDuration] = useState(10);
  const [now, setNow] = useState<number>(() => Date.now());
  const [pending, start] = useTransition();

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const closesAtMs = closesAt ? new Date(closesAt).getTime() : null;
  const live = closesAtMs != null && closesAtMs > now;

  function onStart() {
    start(async () => {
      const r = await startQuizSession({ quiz_id: quizId, duration_minutes: duration });
      if (r.ok) toast.success("Live session started");
      else toast.error(r.error);
    });
  }

  function onStop() {
    start(async () => {
      const r = await stopQuizSession({ quiz_id: quizId });
      if (r.ok) toast.success("Live session stopped");
      else toast.error(r.error);
    });
  }

  return (
    <div className="border-line bg-bg-soft flex flex-wrap items-center gap-3 rounded-md border p-3">
      {live ? (
        <>
          <span className="text-accent text-[10px] font-semibold uppercase tracking-wider">
            Live
          </span>
          <span className="text-ink tabular-nums text-sm">
            ends in {fmt(closesAtMs! - now)}
          </span>
          <div className="ml-auto">
            <Button size="sm" variant="danger" onClick={onStop} disabled={pending}>
              Stop live session
            </Button>
          </div>
        </>
      ) : (
        <>
          <label className="text-muted text-xs">Duration (min)</label>
          <Input
            type="number"
            min={1}
            max={180}
            value={duration}
            onChange={(e) => setDuration(Math.max(1, Number(e.target.value) || 1))}
            className="w-20"
          />
          <Button size="sm" onClick={onStart} disabled={pending}>
            Start live session
          </Button>
        </>
      )}
    </div>
  );
}
