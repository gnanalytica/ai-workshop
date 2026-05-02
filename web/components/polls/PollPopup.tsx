"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import { castVote } from "@/lib/actions/polls";

interface ActivePollPayload {
  id: string;
  question: string;
  options: { id: string; label: string }[];
  opened_at: string;
  closes_at: string | null;
  my_choice: string | null;
}

function formatRemaining(ms: number): string {
  if (ms <= 0) return "0:00";
  const total = Math.floor(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function PollPopup({ cohortId }: { cohortId: string }) {
  const [poll, setPoll] = useState<ActivePollPayload | null>(null);
  const [dismissedId, setDismissedId] = useState<string | null>(null);
  const [now, setNow] = useState<number>(() => Date.now());
  const [pending, start] = useTransition();
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function fetchPoll() {
      abortRef.current?.abort();
      const ac = new AbortController();
      abortRef.current = ac;
      try {
        const res = await fetch(`/api/active-poll?cohortId=${encodeURIComponent(cohortId)}`, {
          signal: ac.signal,
          cache: "no-store",
        });
        if (!res.ok) return;
        const json = (await res.json()) as { poll: ActivePollPayload | null };
        if (!cancelled) setPoll(json.poll);
      } catch {
      }
    }
    fetchPoll();
    const id = setInterval(fetchPoll, 15_000);
    return () => {
      cancelled = true;
      clearInterval(id);
      abortRef.current?.abort();
    };
  }, [cohortId]);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  if (!poll) return null;
  if (poll.my_choice) return null;
  if (dismissedId === poll.id) return null;
  const closesAtMs = poll.closes_at ? new Date(poll.closes_at).getTime() : null;
  if (closesAtMs != null && closesAtMs <= now) return null;

  function vote(c: string) {
    const current = poll;
    if (!current) return;
    start(async () => {
      const r = await castVote({ poll_id: current.id, choice: c });
      if (r.ok) {
        toast.success("Voted");
        setDismissedId(current.id);
      } else {
        toast.error(r.error);
      }
    });
  }

  const remaining = closesAtMs != null ? formatRemaining(closesAtMs - now) : null;

  return (
    <div
      className="
        fixed z-30
        bottom-[max(1.25rem,env(safe-area-inset-bottom))]
        left-4 right-4 sm:left-5 sm:right-auto
        sm:w-[22rem]
        bg-card border border-line rounded-lg
        shadow-[0_8px_24px_-8px_rgba(0,0,0,0.35),0_2px_6px_-2px_rgba(0,0,0,0.18)]
        p-4
      "
      role="dialog"
      aria-label="Active poll"
    >
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-accent text-[10px] font-semibold uppercase tracking-wider">
          Live poll
        </span>
        {remaining != null && (
          <span className="text-muted tabular-nums text-xs">closes in {remaining}</span>
        )}
      </div>
      <p className="text-ink mt-1 text-sm font-medium leading-snug">{poll.question}</p>
      <div className="mt-3 space-y-1.5">
        {poll.options.map((opt) => (
          <button
            key={opt.id}
            type="button"
            disabled={pending}
            onClick={() => vote(opt.id)}
            className="
              border-line text-ink hover:border-accent/55 hover:bg-accent/5
              w-full rounded-md border px-3 py-2 text-left text-sm
              transition-colors disabled:opacity-60
            "
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
