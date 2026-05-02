"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { setDayUnlocked } from "@/lib/actions/schedule";
import { cn } from "@/lib/utils";

interface DayRow {
  day_number: number;
  title: string;
  is_unlocked: boolean;
}

export function LessonLockList({
  cohortId,
  days,
}: {
  cohortId: string;
  days: DayRow[];
}) {
  return (
    <div className="border-line bg-card divide-line/60 divide-y rounded-lg border">
      {days.map((d) => (
        <LessonLockRow key={d.day_number} cohortId={cohortId} day={d} />
      ))}
    </div>
  );
}

function LessonLockRow({
  cohortId,
  day,
}: {
  cohortId: string;
  day: DayRow;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [unlocked, setUnlocked] = useState(day.is_unlocked);

  // Resync local state if the prop changes (e.g. after revalidatePath
  // refreshes the day list with a server-authoritative value).
  useEffect(() => {
    setUnlocked(day.is_unlocked);
  }, [day.is_unlocked]);

  function toggle() {
    const next = !unlocked;
    setUnlocked(next);
    start(async () => {
      const res = await setDayUnlocked({
        cohort_id: cohortId,
        day_number: day.day_number,
        is_unlocked: next,
      });
      if (!res.ok) {
        setUnlocked(!next);
      } else {
        router.refresh();
      }
    });
  }

  return (
    <div className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
      <div className="flex min-w-0 items-center gap-3">
        <span className="text-muted bg-line/40 inline-flex h-6 w-12 shrink-0 items-center justify-center rounded font-mono text-[11px] tabular-nums">
          Day {day.day_number}
        </span>
        <span className="text-ink truncate">{day.title}</span>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={unlocked}
        aria-label={`${unlocked ? "Lock" : "Unlock"} day ${day.day_number}`}
        onClick={toggle}
        disabled={pending}
        className={cn(
          "relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors",
          unlocked ? "bg-accent" : "bg-line",
          pending && "opacity-50",
        )}
      >
        <span
          className={cn(
            "bg-bg inline-block h-4 w-4 rounded-full shadow transition-transform",
            unlocked ? "translate-x-6" : "translate-x-1",
          )}
        />
      </button>
    </div>
  );
}
