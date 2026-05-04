"use client";

import { useEffect, useOptimistic, useRef, useState, useTransition } from "react";
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

export function PollPopup({
  cohortId,
  initialPoll = null,
}: {
  cohortId: string;
  initialPoll?: ActivePollPayload | null;
}) {
  const [poll, setPoll] = useState<ActivePollPayload | null>(initialPoll);
  // useOptimistic lets the UI flip to "voted ✓" instantly during the
  // server-action transition. If the action fails (toast.error), React
  // auto-reverts to `poll` since we don't update real state.
  const [optimisticPoll, applyOptimisticVote] = useOptimistic(
    poll,
    (current, choice: string): ActivePollPayload | null =>
      current ? { ...current, my_choice: choice } : current,
  );
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(() => new Set());
  const [now, setNow] = useState<number>(() => Date.now());
  const [pending, start] = useTransition();
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    let cancelled = false;
    // Initial state already came from the server render. Subsequent fetches
    // (realtime tickle, visibility return, post-vote) bypass the browser
    // cache so any actual change is picked up immediately.
    async function fetchPoll() {
      abortRef.current?.abort();
      const ac = new AbortController();
      abortRef.current = ac;
      try {
        const res = await fetch(
          `/api/active-poll?cohortId=${encodeURIComponent(cohortId)}`,
          { signal: ac.signal, cache: "reload" },
        );
        if (!res.ok) return;
        const json = (await res.json()) as { poll: ActivePollPayload | null };
        if (!cancelled) setPoll(json.poll);
      } catch {
      }
    }
    // Refetch on visibility return (covers backgrounded tabs catching up).
    function onVisibility() {
      if (document.visibilityState === "visible") fetchPoll();
    }
    document.addEventListener("visibilitychange", onVisibility);
    // Realtime broadcast — emitted by createPoll/closePoll/castVote server
    // actions and by the auto-close-polls Edge Function on cron close.
    const sb = getSupabaseBrowser();
    const ch = sb.channel(`cohort:${cohortId}`);
    ch.on("broadcast", { event: "poll" }, ({ payload }) => {
      // Server actions broadcast the cohort-shared poll (no my_choice).
      // Merge with locally-known my_choice: preserve it across same poll id,
      // reset it when the poll id changes (new poll → no prior vote).
      const p = payload as
        | { poll?: Omit<ActivePollPayload, "my_choice"> | null }
        | undefined;
      if (p && Object.prototype.hasOwnProperty.call(p, "poll")) {
        const cohortShared = p.poll ?? null;
        if (cancelled) return;
        setPoll((prev) => {
          if (!cohortShared) return null;
          const myChoice =
            prev?.id === cohortShared.id ? prev.my_choice ?? null : null;
          return { ...cohortShared, my_choice: myChoice };
        });
      } else {
        // Legacy tickle (no payload) — jitter the fallback fetch to spread
        // simultaneous receivers across ~2s instead of all at once.
        setTimeout(() => fetchPoll(), Math.random() * 2000);
      }
    }).subscribe();
    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", onVisibility);
      sb.removeChannel(ch);
      abortRef.current?.abort();
    };
  }, [cohortId]);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  // Render-side state uses optimisticPoll so a vote flips the UI instantly.
  // Real state mutations still go through setPoll (broadcast / fetch path).
  const renderPoll = optimisticPoll;
  const isVisible = !!renderPoll && !dismissedIds.has(renderPoll.id);

  useEffect(() => {
    if (typeof document === "undefined") return;
    if (!isVisible) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isVisible]);

  if (!renderPoll) return null;
  if (dismissedIds.has(renderPoll.id)) return null;

  const closesAtMs = renderPoll.closes_at
    ? new Date(renderPoll.closes_at).getTime()
    : null;
  // Local clock may differ from server — treat poll as transitioned to results
  // if either the server says so OR our timer has expired and we already voted.
  const transitioned =
    renderPoll.phase === "results" ||
    (renderPoll.phase === "open" &&
      renderPoll.my_choice != null &&
      closesAtMs != null &&
      closesAtMs <= now);
  // If still open and not voted, hide on local-clock expiry (server will catch up).
  if (
    renderPoll.phase === "open" &&
    !renderPoll.my_choice &&
    closesAtMs != null &&
    closesAtMs <= now
  )
    return null;

  function vote(c: string) {
    const current = renderPoll;
    if (!current) return;
    start(async () => {
      // Apply optimistic update immediately — UI flips to "voted ✓" before
      // the round-trip completes. React reverts automatically if the
      // transition errors out without a matching setPoll.
      applyOptimisticVote(c);
      const r = await castVote({ poll_id: current.id, choice: c });
      if (r.ok) {
        toast.success("Voted");
        // Settle real state so the optimistic value sticks past the transition.
        setPoll((p) => (p && p.id === current.id ? { ...p, my_choice: c } : p));
      } else {
        toast.error(r.error);
      }
    });
  }

  const remaining = closesAtMs != null && !transitioned ? formatRemaining(closesAtMs - now) : null;
  const showVotingUI = renderPoll.phase === "open" && !renderPoll.my_choice;
  const showThanks =
    renderPoll.phase === "open" && renderPoll.my_choice != null && !transitioned;
  const showResults = transitioned && renderPoll.results;
  const isPulse = renderPoll.kind === "pulse";
  const eyebrow = showResults
    ? isPulse
      ? "Check-in closed — results"
      : "Poll closed — results"
    : isPulse
      ? "Quick check-in"
      : "Live poll";
  const questionText = isPulse
    ? renderPoll.question?.trim()
      ? renderPoll.question
      : "How are you following along?"
    : renderPoll.question;

  const canDismiss = showResults || transitioned || renderPoll.my_choice != null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/55 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={isPulse ? "Check-in" : "Active poll"}
    >
      <div
        className="
          relative w-full max-w-md
          bg-card border border-line rounded-lg
          shadow-[0_8px_24px_-8px_rgba(0,0,0,0.35),0_2px_6px_-2px_rgba(0,0,0,0.18)]
          p-5
        "
      >
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-accent text-[10px] font-semibold uppercase tracking-wider">
          {eyebrow}
        </span>
        {remaining != null && (
          <span className="text-muted tabular-nums text-xs">closes in {remaining}</span>
        )}
        {canDismiss && (
          <button
            type="button"
            aria-label="Close"
            onClick={() => setDismissedIds((s) => new Set(s).add(renderPoll.id))}
            className="text-muted hover:text-ink text-xs leading-none"
          >
            ✕
          </button>
        )}
      </div>
      <p className="text-ink mt-1 text-sm font-medium leading-snug">{questionText}</p>

      {showVotingUI && !isPulse && (
        <div className="mt-3 space-y-1.5">
          {renderPoll.options.map((opt) => (
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
          {renderPoll.options.map((opt) => (
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
          ✓ Your vote is in. Results will show when the poll closes.
        </p>
      )}

      {showResults && (
        <div className="mt-3">
          <ResultsBars results={renderPoll.results!} />
        </div>
      )}
      </div>
    </div>
  );
}
