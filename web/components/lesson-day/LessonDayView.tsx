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
import { LessonReader } from "@/components/lesson-day/LessonReader";
import { SlidesEmbed } from "@/components/lesson-day/SlidesEmbed";
import { splitByH2 } from "@/lib/content/splitSections";
import { loadDay, listDays } from "@/lib/content/loader";
import type { ActiveCohort } from "@/lib/queries/cohort";
import { listCohortDays, todayDayNumber } from "@/lib/queries/cohort";
import { getDayInteractive, type DayInteractive } from "@/lib/queries/day-interactive";
import { getDayProgress } from "@/lib/queries/lesson-progress";
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

  const [content, allDays, cohortDays, interactive, progress] = await Promise.all([
    loadDay(dayNumber),
    listDays(),
    listCohortDays(cohort.id),
    readOnly ? Promise.resolve(readOnlyInteractive) : getDayInteractive(cohort.id, dayNumber),
    readOnly
      ? Promise.resolve({ dayFeedbackSubmitted: false })
      : getDayProgress(cohort.id, dayNumber),
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
        hint: "Quick check-in during the live session",
        done: !!interactive.poll.my_choice,
        phase: "live",
      });
    }
    if (interactive.assignment) {
      const status = interactive.assignment.submission?.status ?? "draft";
      tasks.push({
        id: "assignment",
        label: "Submit assignment",
        hint: "Post-class — write your answer and submit it",
        done: status === "submitted" || status === "graded",
        phase: "post",
      });
    }
    if (interactive.quiz) {
      tasks.push({
        id: "quiz",
        label: "Take quiz",
        hint: "Post-class — saves your final score",
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

  // Split each phase's markdown into one-section-at-a-time chunks. The
  // LessonReader client component receives the rendered <MarkdownView>
  // children + their titles and shows a single section at a time with
  // Prev / Next controls, dot progress, and keyboard arrow nav.
  const preSections = splitByH2(phases.pre ?? "");
  const liveSections = splitByH2(phases.live ?? "");
  const postSections = splitByH2(phases.post ?? "");
  const extraSections = splitByH2(phases.extra ?? "");

  // Pass cohort/day only for real students; faculty preview stays read-only
  // and never sees the day-feedback button.
  const persistProps = readOnly
    ? {}
    : { cohortId: cohort.id, dayNumber, dayFeedbackSubmitted: progress.dayFeedbackSubmitted };

  const prePanel = phases.pre ? (
    <LessonReader titles={preSections.map((s) => s.title)} {...persistProps}>
      {preSections.map((s, i) => (
        <MarkdownView key={i} source={s.body} />
      ))}
    </LessonReader>
  ) : (
    emptyState("pre-class")
  );

  const slidesPanel = cohortDay?.slides_url ? (
    <div className="mb-6">
      <SlidesEmbed
        url={cohortDay.slides_url}
        unlocked={(cohortDay.is_unlocked ?? false) || readOnly}
      />
    </div>
  ) : null;

  const liveTrailing = (
    <>
      {!readOnly && interactive.poll && (
        <div className="mt-8">
          <PollBlock poll={interactive.poll} />
        </div>
      )}
      {toolsList}
    </>
  );
  const livePanel = (
    <>
      {promptCard}
      {phases.live ? (
        <LessonReader
          titles={liveSections.map((s) => s.title)}
          trailing={liveTrailing}
          {...persistProps}
        >
          {liveSections.map((s, i) => (
            <MarkdownView key={i} source={s.body} />
          ))}
        </LessonReader>
      ) : (
        <>
          {emptyState("in-class")}
          {liveTrailing}
        </>
      )}
    </>
  );

  // Inline interactive blocks at the section whose H2 title mentions them, so
  // students see the submit form on the same page as the narrative. Anything
  // that doesn't match a section falls back to trailing (rendered after the
  // last section) — keeps backward compatibility for days with no matching H2.
  // Find the LAST "## Assignment" section so the AssignmentBlock submit
  // form attaches to the final assignment narrative (e.g. Day 1 has two:
  // "Day-0 baseline reflection" then "Score-your-own prompt" — students
  // should see submit at the end of the assignments, not buried in the
  // middle). Manual reverse loop because findLastIndex needs ES2023.
  let assignmentSectionIdx = -1;
  for (let i = postSections.length - 1; i >= 0; i--) {
    if (/assignment/i.test(postSections[i]?.title ?? "")) {
      assignmentSectionIdx = i;
      break;
    }
  }
  const quizSectionIdx = postSections.findIndex((s) => /quiz/i.test(s.title ?? ""));

  const postSectionAddons: Record<number, React.ReactNode> = {};
  if (!readOnly && interactive.assignment && assignmentSectionIdx >= 0) {
    postSectionAddons[assignmentSectionIdx] = (
      <AssignmentBlock assignment={interactive.assignment} />
    );
  }
  if (!readOnly && interactive.quiz && quizSectionIdx >= 0) {
    postSectionAddons[quizSectionIdx] = (
      <QuizBlock quiz={interactive.quiz} dayNumber={dayNumber} />
    );
  }

  const trailingAssignment =
    !readOnly && interactive.assignment && assignmentSectionIdx < 0 ? (
      <AssignmentBlock assignment={interactive.assignment} />
    ) : null;
  const trailingQuiz =
    !readOnly && interactive.quiz && quizSectionIdx < 0 ? (
      <QuizBlock quiz={interactive.quiz} dayNumber={dayNumber} />
    ) : null;

  const postTrailing = (
    <>
      {(trailingAssignment || trailingQuiz) && (
        <div className="mt-8 space-y-4">
          {trailingAssignment}
          {trailingQuiz}
        </div>
      )}
      {endGoalCard}
    </>
  );
  const postPanel = phases.post ? (
    <LessonReader
      titles={postSections.map((s) => s.title)}
      trailing={postTrailing}
      sectionAddons={postSectionAddons}
      {...persistProps}
      triggerFeedbackOnLast={!readOnly}
    >
      {postSections.map((s, i) => (
        <MarkdownView key={i} source={s.body} />
      ))}
    </LessonReader>
  ) : (
    <>
      {emptyState("post-class")}
      {postTrailing}
    </>
  );

  const extraTrailing = <>{resourcesList}</>;
  const extraPanel = phases.extra ? (
    <LessonReader
      titles={extraSections.map((s) => s.title)}
      trailing={extraTrailing}
      {...persistProps}
    >
      {extraSections.map((s, i) => (
        <MarkdownView key={i} source={s.body} />
      ))}
    </LessonReader>
  ) : resourcesList ? (
    extraTrailing
  ) : (
    emptyState("additional")
  );

  return (
    <div className="-mx-4 -mt-4 flex md:-m-8">
      <DayRail items={railItems} activeDay={dayNumber} basePath={railBasePath} />
      <article className="min-w-0 flex-1 px-4 py-6 sm:px-6 sm:py-8 md:px-10 mx-auto max-w-3xl">
        <header className="mb-6">
          <p className="text-accent font-mono text-xs tracking-widest uppercase">
            Day {dayNumber} · Week {meta.week ?? "?"}
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight break-words sm:text-3xl md:text-4xl">{meta.topic}</h1>
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
              You are viewing the cohort curriculum in read-only mode (no assignments).
            </p>
          )}
        </header>

        <PhaseTabs
          initial={initialPhase}
          tabs={[
            { id: "intro", label: "Intro", hint: "slides + overview" },
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
            intro: (
              <>
                {slidesPanel}
                {phases.intro && <MarkdownView source={phases.intro} />}
              </>
            ),
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
