"use client";

import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { setDayUnlocked, updateCohortDay } from "@/lib/actions/schedule";
import { cn } from "@/lib/utils";

interface DayRow {
  day_number: number;
  title: string;
  is_unlocked: boolean;
  slides_url: string | null;
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
  const [slidesUrl, setSlidesUrl] = useState(day.slides_url ?? "");
  const [savedSlides, setSavedSlides] = useState(day.slides_url ?? "");
  const [slidesState, setSlidesState] = useState<"idle" | "saving" | "saved" | "error">("idle");

  // Resync local state if the prop changes (e.g. after revalidatePath
  // refreshes the day list with a server-authoritative value).
  useEffect(() => {
    setUnlocked(day.is_unlocked);
    setSlidesUrl(day.slides_url ?? "");
    setSavedSlides(day.slides_url ?? "");
  }, [day.is_unlocked, day.slides_url]);

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

  function saveSlides() {
    const trimmed = slidesUrl.trim();
    if (trimmed === savedSlides) return;
    setSlidesState("saving");
    start(async () => {
      const res = await updateCohortDay({
        cohort_id: cohortId,
        day_number: day.day_number,
        slides_url: trimmed === "" ? null : trimmed,
      });
      if (!res.ok) {
        setSlidesState("error");
        return;
      }
      setSavedSlides(trimmed);
      setSlidesState("saved");
      router.refresh();
      setTimeout(() => setSlidesState("idle"), 1500);
    });
  }

  return (
    <div className="px-4 py-3 text-sm">
      <div className="flex items-center justify-between gap-3">
        <Link
          href={`/admin/cohorts/${cohortId}/day/${day.day_number}`}
          className="group flex min-w-0 flex-1 items-center gap-3"
        >
          <span className="text-muted bg-line/40 inline-flex h-6 w-12 shrink-0 items-center justify-center rounded font-mono text-[11px] tabular-nums">
            Day {day.day_number}
          </span>
          <span className="text-ink group-hover:text-accent truncate transition-colors">
            {day.title}
          </span>
        </Link>
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
      <div className="mt-2 flex items-center gap-2 pl-[3.75rem]">
        <span className="text-muted shrink-0 text-xs">Slides</span>
        <input
          type="url"
          inputMode="url"
          placeholder="https://docs.google.com/presentation/…"
          value={slidesUrl}
          onChange={(e) => {
            setSlidesUrl(e.target.value);
            if (slidesState !== "idle") setSlidesState("idle");
          }}
          onBlur={saveSlides}
          onKeyDown={(e) => {
            if (e.key === "Enter") (e.target as HTMLInputElement).blur();
          }}
          className="border-line bg-input-bg text-ink min-w-0 flex-1 rounded border px-2 py-1 text-xs"
        />
        <span
          className={cn(
            "shrink-0 text-[11px] tabular-nums",
            slidesState === "saving" && "text-muted",
            slidesState === "saved" && "text-accent",
            slidesState === "error" && "text-rose-500",
            slidesState === "idle" && "text-transparent",
          )}
          aria-live="polite"
        >
          {slidesState === "saving"
            ? "Saving…"
            : slidesState === "saved"
              ? "Saved"
              : slidesState === "error"
                ? "Failed"
                : "·"}
        </span>
      </div>
    </div>
  );
}
