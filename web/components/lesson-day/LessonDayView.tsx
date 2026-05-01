import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, CardSub, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MarkdownView } from "@/components/markdown/MarkdownView";
import { DayRail } from "@/components/day-rail/DayRail";
import { AssignmentBlock } from "@/components/day-interactive/AssignmentBlock";
import { QuizBlock } from "@/components/day-interactive/QuizBlock";
import { PollBlock } from "@/components/day-interactive/PollBlock";
import { PhaseTabs } from "@/components/lesson-day/PhaseTabs";
import { DayTasksPanel, type TaskItem } from "@/components/lesson-day/DayTasksPanel";
import { loadDay, listDays } from "@/lib/content/loader";
import type { ActiveCohort } from "@/lib/queries/cohort";
import { listCohortDays, todayDayNumber } from "@/lib/queries/cohort";
import { getDayInteractive, type DayInteractive } from "@/lib/queries/day-interactive";
import { fmtDateTime } from "@/lib/format";
import { defaultPhase, splitDayPhases, type Phase } from "@/lib/content/phases";

const readOnlyInteractive: DayInteractive = {
  assignment: null,
  quiz: null,
  poll: null,
  attendance: { status: null },
};

type RailBase = "/day" | "/faculty/day";

export async function LessonDayView({
  cohort,
  readOnly,
  dayParam,
  railBasePath,
  phaseParam,
}: {
  cohort: ActiveCohort;
  readOnly: boolean;
  dayParam: string;
  railBasePath: RailBase;
  phaseParam?: Phase;
}) {
  const today = todayDayNumber(cohort);
  const dayNumber = dayParam === "today" ? today : Number(dayParam);
  if (!Number.isFinite(dayNumber) || dayNumber < 1 || dayNumber > 30) notFound();

  const [content, allDays, cohortDays, interactive] = await Promise.all([
    loadDay(dayNumber),
    listDays(),
    listCohortDays(cohort.id),
    readOnly ? Promise.resolve(readOnlyInteractive) : getDayInteractive(cohort.id, dayNumber),
  ]);
  if (!content) notFound();

  const cohortDay = cohortDays.find((d) => d.day_number === dayNumber);
  const railItems = [
    // Day 0 · Welcome — special-cased entry that points at /onboarding
    // instead of /day/0 (cohort_days schema only allows day_number 1-60).
    { day: 0, title: "Welcome", unlocked: true, href: "/onboarding" },
    ...allDays.map((d) => {
      const cd = cohortDays.find((c) => c.day_number === d.day);
      return {
        day: d.day,
        title: d.topic,
        unlocked: cd?.is_unlocked ?? false,
      };
    }),
  ];

  const meta = content.meta;
  const phases = splitDayPhases(content.body);
  const initialPhase: Phase = phaseParam ?? defaultPhase(cohortDay?.live_session_at);

  const livePending = interactive.poll && !interactive.poll.my_choice ? 1 : 0;
  const assignmentPending =
    interactive.assignment &&
    (interactive.assignment.submission?.status ?? "draft") !== "submitted" &&
    (interactive.assignment.submission?.status ?? "draft") !== "graded"
      ? 1
      : 0;
  const quizPending = interactive.quiz && !interactive.quiz.attempt?.completed_at ? 1 : 0;
  const postPending = assignmentPending + quizPending;

  const tasks: TaskItem[] = [];
  if (!readOnly) {
    if (interactive.poll) {
      tasks.push({
        id: "poll",
        label: "Vote in the poll",
        hint: "Quick pulse during the live session",
        done: !!interactive.poll.my_choice,
        phase: "live",
      });
    }
    if (interactive.assignment) {
      const status = interactive.assignment.submission?.status ?? "draft";
      tasks.push({
        id: "assignment",
        label: "Submit assignment",
        hint: "Post-class — write up and submit",
        done: status === "submitted" || status === "graded",
        phase: "post",
      });
    }
    if (interactive.quiz) {
      tasks.push({
        id: "quiz",
        label: "Take quiz",
        hint: "Post-class — locks in your score",
        done: !!interactive.quiz.attempt?.completed_at,
        phase: "post",
      });
    }
  }

  const promptCard = meta.prompt_of_the_day ? (
    <Card className="border-accent/40 bg-accent/5 mb-6">
      <CardTitle>Prompt of the day</CardTitle>
      <p className="text-ink/90 mt-2 text-sm leading-6 whitespace-pre-line">
        {meta.prompt_of_the_day}
      </p>
    </Card>
  ) : null;

  const toolsList =
    (meta.tools_hands_on?.length ?? 0) > 0 ? (
      <section className="mt-10">
        <h2 className="mb-3 text-xl font-semibold tracking-tight">Hands-on tools</h2>
        <ul className="grid gap-2 sm:grid-cols-2">
          {meta.tools_hands_on?.map((t) => (
            <li key={`${t.name ?? t.title}-${t.url}`}>
              <Link
                href={t.url}
                target="_blank"
                rel="noreferrer"
                className="border-line bg-card hover:border-accent/40 flex items-center justify-between rounded-md border px-3 py-2 text-sm"
              >
                <span>{t.name ?? t.title}</span>
                <span className="text-muted">↗</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    ) : null;

  const resourcesList =
    (meta.resources?.length ?? 0) > 0 ? (
      <section className="mt-8">
        <h2 className="mb-3 text-xl font-semibold tracking-tight">Resources</h2>
        <ul className="space-y-1.5 text-sm">
          {meta.resources?.map((r) => (
            <li key={`${r.title ?? r.name}-${r.url}`}>
              <Link
                href={r.url}
                target="_blank"
                rel="noreferrer"
                className="text-accent underline-offset-2 hover:underline"
              >
                {r.title ?? r.name}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    ) : null;

  const endGoalCard = meta.objective?.end_goal ? (
    <Card className="mt-10">
      <CardSub className="text-accent font-mono text-xs tracking-widest uppercase">
        End goal
      </CardSub>
      <p className="text-ink mt-2 text-sm leading-6">{meta.objective.end_goal}</p>
    </Card>
  ) : null;

  const emptyState = (label: string) => (
    <p className="text-muted py-12 text-center text-sm">No {label} content for this day yet.</p>
  );

  const prePanel = (
    <>
      {phases.pre ? <MarkdownView source={phases.pre} /> : emptyState("pre-class")}
    </>
  );

  const livePanel = (
    <>
      {promptCard}
      {phases.live ? <MarkdownView source={phases.live} /> : emptyState("in-class")}
      {!readOnly && interactive.poll && (
        <div className="mt-8">
          <PollBlock poll={interactive.poll} />
        </div>
      )}
      {toolsList}
    </>
  );

  const postPanel = (
    <>
      {phases.post ? <MarkdownView source={phases.post} /> : emptyState("post-class")}
      {!readOnly && (interactive.assignment || interactive.quiz) && (
        <div className="mt-8 space-y-4">
          {interactive.assignment && <AssignmentBlock assignment={interactive.assignment} />}
          {interactive.quiz && <QuizBlock quiz={interactive.quiz} dayNumber={dayNumber} />}
        </div>
      )}
      {endGoalCard}
    </>
  );

  const extraPanel = (
    <>
      {phases.extra ? <MarkdownView source={phases.extra} /> : null}
      {resourcesList}
      {!phases.extra && !resourcesList && emptyState("additional")}
    </>
  );

  return (
    <div className="-m-6 flex md:-m-8">
      <DayRail items={railItems} activeDay={dayNumber} basePath={railBasePath} />
      <article className="min-w-0 flex-1 px-6 py-8 md:px-10 mx-auto max-w-3xl">
        <header className="mb-6">
          <p className="text-accent font-mono text-xs tracking-widest uppercase">
            Day {dayNumber} · Week {meta.week ?? "?"}
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">{meta.topic}</h1>
          {meta.tldr && <p className="text-muted mt-3 text-base leading-7">{meta.tldr}</p>}
          <div className="text-muted mt-4 flex flex-wrap items-center gap-3 text-xs">
            {cohortDay?.live_session_at && (
              <span className="text-ink">Live · {fmtDateTime(cohortDay.live_session_at)}</span>
            )}
            {meta.faculty?.main && <span>Lead: {meta.faculty.main}</span>}
            {meta.faculty?.support && <span>Support: {meta.faculty.support}</span>}
            {meta.tags?.map((t) => (
              <Badge key={t}>{t}</Badge>
            ))}
          </div>
          {readOnly && (
            <p className="text-muted mt-4 text-sm">
              You&apos;re viewing the cohort curriculum in read-only mode (no assignments).
            </p>
          )}
        </header>

        {phases.intro && (
          <div className="mb-2">
            <MarkdownView source={phases.intro} />
          </div>
        )}

        <PhaseTabs
          initial={initialPhase}
          tabs={[
            { id: "pre", label: "Pre-class", hint: "before session" },
            {
              id: "live",
              label: "In-class",
              hint: "live session",
              badge: livePending || undefined,
            },
            {
              id: "post",
              label: "Post-class",
              hint: "homework",
              badge: postPending || undefined,
            },
            { id: "extra", label: "References" },
          ]}
          panels={{
            pre: prePanel,
            live: livePanel,
            post: postPanel,
            extra: extraPanel,
          }}
        />
      </article>
      {!readOnly && tasks.length > 0 && (
        <div className="hidden lg:block px-6 py-8 md:px-8">
          <DayTasksPanel tasks={tasks} dayNumber={dayNumber} />
        </div>
      )}
    </div>
  );
}
