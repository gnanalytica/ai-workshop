"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import { castVote } from "@/lib/actions/polls";
import { getSupabaseBrowser } from "@/lib/supabase/client";

interface PollResultRow { choice: string; label: string; votes: number }

interface ActivePollPayload {
  id: string;
  question: string;
  options: { id: string; label: string }[];
  opened_at: string;
  closes_at: string | null;
  closed_at: string | null;
  my_choice: string | null;
  phase: "open" | "results";
  results: PollResultRow[] | null;
  kind: "poll" | "pulse";
}

function formatRemaining(ms: number): string {
  if (ms <= 0) return "0:00";
  const total = Math.floor(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function ResultsBars({ results }: { results: PollResultRow[] }) {
  const total = results.reduce((s, r) => s + r.votes, 0);
  return (
    <div className="space-y-1.5">
      {results.map((r) => {
        const pct = total === 0 ? 0 : Math.round((r.votes / total) * 100);
        return (
          <div key={r.choice} className="space-y-0.5">
            <div className="flex items-baseline justify-between gap-2 text-xs">
              <span className="text-ink truncate">{r.label}</span>
              <span className="text-muted tabular-nums">
                {r.votes} <span className="opacity-60">· {pct}%</span>
              </span>
            </div>
            <div className="bg-bg-soft h-1.5 w-full overflow-hidden rounded-sm">
              <div className="bg-accent h-full" style={{ width: `${pct}%` }} />
            </div>
          </div>
        );
      })}
      <p className="text-muted pt-1 text-[10px] uppercase tracking-wider">
        {total} {total === 1 ? "vote" : "votes"} total
      </p>
    </div>
  );
}

export function PollPopup({ cohortId }: { cohortId: string }) {
  const [poll, setPoll] = useState<ActivePollPayload | null>(null);
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(() => new Set());
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
    // Initial fetch on mount.
    fetchPoll();
    // Refetch on visibility return (covers backgrounded tabs catching up).
    function onVisibility() {
      if (document.visibilityState === "visible") fetchPoll();
    }
    document.addEventListener("visibilitychange", onVisibility);
    // Slow fallback poll — only when visible. Down from 15s. Realtime
    // broadcast handles the fast path; this catches dropped events and
    // cron-driven auto-close.
    const fallback = setInterval(() => {
      if (document.visibilityState === "visible") fetchPoll();
    }, 60_000);
    // Realtime broadcast — emitted by createPoll/closePoll server actions.
    const sb = getSupabaseBrowser();
    const ch = sb.channel(`cohort:${cohortId}`);
    ch.on("broadcast", { event: "poll" }, () => fetchPoll()).subscribe();
    return () => {
      cancelled = true;
      clearInterval(fallback);
      document.removeEventListener("visibilitychange", onVisibility);
      sb.removeChannel(ch);
      abortRef.current?.abort();
    };
  }, [cohortId]);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  if (!poll) return null;
  if (dismissedIds.has(poll.id)) return null;

  const closesAtMs = poll.closes_at ? new Date(poll.closes_at).getTime() : null;
  // Local clock may differ from server — treat poll as transitioned to results
  // if either the server says so OR our timer has expired and we already voted.
  const transitioned =
    poll.phase === "results" ||
    (poll.phase === "open" && poll.my_choice != null && closesAtMs != null && closesAtMs <= now);
  // If still open and not voted, hide on local-clock expiry (server will catch up).
  if (poll.phase === "open" && !poll.my_choice && closesAtMs != null && closesAtMs <= now) return null;

  function vote(c: string) {
    const current = poll;
    if (!current) return;
    start(async () => {
      const r = await castVote({ poll_id: current.id, choice: c });
      if (r.ok) {
        toast.success("Voted");
        // Optimistically reflect the vote — popup transitions to "voted ✓"
        // until the server returns phase='results'.
        setPoll((p) => (p && p.id === current.id ? { ...p, my_choice: c } : p));
      } else {
        toast.error(r.error);
      }
    });
  }

  const remaining = closesAtMs != null && !transitioned ? formatRemaining(closesAtMs - now) : null;
  const showVotingUI = poll.phase === "open" && !poll.my_choice;
  const showThanks = poll.phase === "open" && poll.my_choice != null && !transitioned;
  const showResults = transitioned && poll.results;
  const isPulse = poll.kind === "pulse";
  const eyebrow = showResults
    ? isPulse
      ? "Pulse closed · results"
      : "Poll closed · results"
    : isPulse
      ? "Quick pulse"
      : "Live poll";
  const questionText = isPulse
    ? (poll.question?.trim() ? poll.question : "How are we doing?")
    : poll.question;

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
          {eyebrow}
        </span>
        {remaining != null && (
          <span className="text-muted tabular-nums text-xs">closes in {remaining}</span>
        )}
        {showResults && (
          <button
            type="button"
            aria-label="Dismiss results"
            onClick={() => setDismissedIds((s) => new Set(s).add(poll.id))}
            className="text-muted hover:text-ink text-xs leading-none"
          >
            ✕
          </button>
        )}
      </div>
      <p className="text-ink mt-1 text-sm font-medium leading-snug">{questionText}</p>

      {showVotingUI && !isPulse && (
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
      )}

      {showVotingUI && isPulse && (
        <div className="mt-3 grid grid-cols-3 gap-2 max-[20rem]:grid-cols-2">
          {poll.options.map((opt) => (
            <button
              key={opt.id}
              type="button"
              disabled={pending}
              onClick={() => vote(opt.id)}
              className="
                border-line text-ink hover:border-accent/55 hover:bg-accent/5
                aspect-square rounded-md border px-2 py-3 text-center
                text-base leading-tight
                transition-colors disabled:opacity-60
                flex items-center justify-center
              "
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}

      {showThanks && !isPulse && (
        <p className="text-muted mt-3 text-xs">
          ✓ Voted. Results appear when the poll closes.
        </p>
      )}

      {showResults && (
        <div className="mt-3">
          <ResultsBars results={poll.results!} />
        </div>
      )}
    </div>
  );
}
