"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

interface ActiveQuizPayload {
  id: string;
  title: string;
  day_number: number | null;
  closes_at: string;
  question_count: number;
  attempted: boolean;
}

function formatRemaining(ms: number): string {
  if (ms <= 0) return "0:00";
  const total = Math.floor(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function QuizPopup({ cohortId }: { cohortId: string }) {
  const [quiz, setQuiz] = useState<ActiveQuizPayload | null>(null);
  const [now, setNow] = useState<number>(() => Date.now());
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function fetchQuiz() {
      abortRef.current?.abort();
      const ac = new AbortController();
      abortRef.current = ac;
      try {
        const res = await fetch(`/api/active-quiz?cohortId=${encodeURIComponent(cohortId)}`, {
          signal: ac.signal,
          cache: "no-store",
        });
        if (!res.ok) return;
        const json = (await res.json()) as { quiz: ActiveQuizPayload | null };
        if (!cancelled) setQuiz(json.quiz);
      } catch {
      }
    }
    fetchQuiz();
    const id = setInterval(fetchQuiz, 15_000);
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

  if (!quiz) return null;
  if (quiz.attempted) return null;
  const closesAtMs = new Date(quiz.closes_at).getTime();
  if (closesAtMs <= now) return null;

  const href = quiz.day_number != null ? `/day/${quiz.day_number}#quiz` : "#";
  const remaining = formatRemaining(closesAtMs - now);

  return (
    <div
      className="
        fixed z-30
        bottom-[max(7.5rem,calc(env(safe-area-inset-bottom)+5rem))]
        left-4 right-4 sm:left-5 sm:right-auto
        sm:w-[22rem]
        bg-card border border-line rounded-lg
        shadow-[0_8px_24px_-8px_rgba(0,0,0,0.35),0_2px_6px_-2px_rgba(0,0,0,0.18)]
        p-4
      "
      role="dialog"
      aria-label="Active quiz"
    >
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-accent text-[10px] font-semibold uppercase tracking-wider">
          Live quiz
        </span>
        <span className="text-muted tabular-nums text-xs">closes in {remaining}</span>
      </div>
      <p className="text-ink mt-1 text-sm font-medium leading-snug">{quiz.title}</p>
      <div className="text-muted mt-1 flex items-center gap-2 text-xs">
        <span>
          {quiz.question_count} {quiz.question_count === 1 ? "question" : "questions"}
        </span>
        {quiz.day_number != null && (
          <>
            <span aria-hidden>·</span>
            <span>Day {quiz.day_number}</span>
          </>
        )}
      </div>
      <div className="mt-3">
        <Link
          href={href}
          className="
            border-line text-ink hover:border-accent/55 hover:bg-accent/5
            inline-block rounded-md border px-3 py-2 text-sm
            transition-colors
          "
        >
          Start quiz
        </Link>
      </div>
    </div>
  );
}
