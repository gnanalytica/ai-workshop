"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { setDayUnlocked, updateCohortDay } from "@/lib/actions/schedule";
import {
  createAssignment,
  createQuiz,
  deleteAssignment,
} from "@/lib/actions/content";
import type { AssignmentRow, QuizRow } from "@/lib/queries/content";
import { Badge } from "@/components/ui/badge";
import { fmtDate } from "@/lib/format";
import { cn } from "@/lib/utils";

interface DayRow {
  day_number: number;
  title: string;
  is_unlocked: boolean;
  slides_url: string | null;
}

type AKind = AssignmentRow["kind"];

export function LessonLockList({
  cohortId,
  days,
  assignments,
  quizzes,
}: {
  cohortId: string;
  days: DayRow[];
  assignments: AssignmentRow[];
  quizzes: QuizRow[];
}) {
  const groupedAssignments = useMemo(() => {
    const m = new Map<number, AssignmentRow[]>();
    for (const a of assignments) {
      const list = m.get(a.day_number) ?? [];
      list.push(a);
      m.set(a.day_number, list);
    }
    return m;
  }, [assignments]);

  const groupedQuizzes = useMemo(() => {
    const m = new Map<number, QuizRow[]>();
    for (const q of quizzes) {
      const list = m.get(q.day_number) ?? [];
      list.push(q);
      m.set(q.day_number, list);
    }
    return m;
  }, [quizzes]);

  return (
    <div className="border-line bg-card divide-line/60 divide-y rounded-lg border">
      {days.map((d) => (
        <LessonLockRow
          key={d.day_number}
          cohortId={cohortId}
          day={d}
          assignments={groupedAssignments.get(d.day_number) ?? []}
          quizzes={groupedQuizzes.get(d.day_number) ?? []}
        />
      ))}
    </div>
  );
}

function LessonLockRow({
  cohortId,
  day,
  assignments,
  quizzes,
}: {
  cohortId: string;
  day: DayRow;
  assignments: AssignmentRow[];
  quizzes: QuizRow[];
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [unlocked, setUnlocked] = useState(day.is_unlocked);
  const [slidesUrl, setSlidesUrl] = useState(day.slides_url ?? "");
  const [savedSlides, setSavedSlides] = useState(day.slides_url ?? "");
  const [slidesState, setSlidesState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [adding, setAdding] = useState<null | "lab" | "capstone" | "reflection" | "quiz">(null);

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
      if (!res.ok) setUnlocked(!next);
      else router.refresh();
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
          placeholder="Google Slides, Figma, Gamma or Canva share link"
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

      <div className="mt-2 space-y-1.5 pl-[3.75rem]">
        {assignments.length === 0 && quizzes.length === 0 && (
          <p className="text-muted text-xs">No assignments or quizzes for this day.</p>
        )}
        {assignments.map((a) => (
          <AssignmentRowItem key={a.id} cohortId={cohortId} row={a} />
        ))}
        {quizzes.map((q) => (
          <QuizRowItem key={q.id} cohortId={cohortId} row={q} />
        ))}

        {adding ? (
          <InlineCreate
            kind={adding}
            cohortId={cohortId}
            dayNumber={day.day_number}
            onClose={() => setAdding(null)}
          />
        ) : (
          <div className="flex flex-wrap gap-2 pt-1">
            <QuickAddButton onClick={() => setAdding("lab")}>+ Lab</QuickAddButton>
            <QuickAddButton onClick={() => setAdding("capstone")}>+ Capstone</QuickAddButton>
            <QuickAddButton onClick={() => setAdding("reflection")}>+ Reflection</QuickAddButton>
            <QuickAddButton onClick={() => setAdding("quiz")}>+ Quiz</QuickAddButton>
          </div>
        )}
      </div>
    </div>
  );
}

function QuickAddButton({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="border-line text-muted hover:border-accent/40 hover:text-accent rounded border px-2 py-0.5 text-[11px] font-medium transition-colors"
    >
      {children}
    </button>
  );
}

function AssignmentRowItem({
  cohortId,
  row,
}: {
  cohortId: string;
  row: AssignmentRow;
}) {
  const [pending, start] = useTransition();
  function remove(e: React.MouseEvent) {
    e.preventDefault();
    if (!window.confirm(`Delete "${row.title}"?`)) return;
    start(async () => {
      const r = await deleteAssignment({ id: row.id, cohort_id: cohortId });
      if (r.ok) toast.success("Deleted");
      else toast.error(r.error);
    });
  }
  return (
    <div className="flex items-center gap-2 text-xs">
      <Badge variant="default" className="shrink-0">{row.kind}</Badge>
      <Link
        href={`/admin/cohorts/${cohortId}/content/assignment/${row.id}`}
        className="text-ink hover:text-accent truncate"
      >
        {row.title}
      </Link>
      {row.kind !== "reflection" && (
        <Link
          href={`/admin/cohorts/${cohortId}/content/assignment/${row.id}#rubric`}
          className="shrink-0"
          title={
            row.rubric_id
              ? "Open assignment editor to view/edit the rubric"
              : "No rubric — open assignment editor to attach one"
          }
        >
          <Badge variant={row.rubric_id ? "ok" : "warn"}>
            {row.rubric_id ? "rubric" : "no rubric"}
          </Badge>
        </Link>
      )}
      {row.due_at && (
        <span className="text-muted shrink-0">· due {fmtDate(row.due_at)}</span>
      )}
      <span className="text-muted shrink-0 tabular-nums">· {row.submission_count} subs</span>
      <button
        type="button"
        onClick={remove}
        disabled={pending}
        className="text-muted hover:text-rose-500 ml-auto shrink-0 underline-offset-2 hover:underline disabled:opacity-50"
      >
        delete
      </button>
    </div>
  );
}

function QuizRowItem({ cohortId, row }: { cohortId: string; row: QuizRow }) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <Badge variant="default" className="shrink-0">quiz</Badge>
      <Link
        href={`/admin/cohorts/${cohortId}/content/quiz/${row.id}`}
        className="text-ink hover:text-accent truncate"
      >
        {row.title}
      </Link>
      <span className="text-muted shrink-0 tabular-nums">
        · {row.question_count} q · {row.attempt_count} attempts
      </span>
    </div>
  );
}

function InlineCreate({
  kind,
  cohortId,
  dayNumber,
  onClose,
}: {
  kind: AKind | "quiz";
  cohortId: string;
  dayNumber: number;
  onClose: () => void;
}) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [due, setDue] = useState("");
  const [pending, start] = useTransition();

  function submit() {
    const t = title.trim();
    if (!t) {
      toast.error("Title required");
      return;
    }
    start(async () => {
      const r =
        kind === "quiz"
          ? await createQuiz({ cohort_id: cohortId, day_number: dayNumber, title: t })
          : await createAssignment({
              cohort_id: cohortId,
              day_number: dayNumber,
              kind,
              title: t,
              due_at: due ? new Date(due).toISOString() : null,
            });
      if (r.ok) {
        toast.success(`${kind === "quiz" ? "Quiz" : kind} created`);
        setTitle("");
        setDue("");
        onClose();
        router.refresh();
      } else toast.error(r.error);
    });
  }

  const label =
    kind === "quiz" ? "Quiz" : kind.charAt(0).toUpperCase() + kind.slice(1);

  return (
    <div className="border-line bg-bg-soft mt-1 flex flex-wrap items-center gap-2 rounded border p-2 text-xs">
      <span className="text-muted font-mono uppercase">+ {label}</span>
      <input
        autoFocus
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") submit();
          if (e.key === "Escape") onClose();
        }}
        placeholder="Title"
        className="border-line bg-input-bg text-ink min-w-[180px] flex-1 rounded border px-2 py-1"
      />
      {kind !== "quiz" && (
        <input
          type="date"
          value={due}
          onChange={(e) => setDue(e.target.value)}
          className="border-line bg-input-bg text-ink rounded border px-2 py-1"
        />
      )}
      <button
        type="button"
        onClick={submit}
        disabled={pending || !title.trim()}
        className="bg-accent text-cta-ink rounded px-2 py-1 font-medium disabled:opacity-50"
      >
        {pending ? "…" : "Add"}
      </button>
      <button
        type="button"
        onClick={onClose}
        className="text-muted hover:text-ink underline-offset-2 hover:underline"
      >
        cancel
      </button>
    </div>
  );
}
