import { notFound } from "next/navigation";
import Link from "next/link";
import { Card, CardSub, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MarkdownView } from "@/components/markdown/MarkdownView";
import { DayRail } from "@/components/day-rail/DayRail";
import { CheckIn } from "@/components/day-interactive/CheckIn";
import { StuckButton } from "@/components/day-interactive/StuckButton";
import { AssignmentBlock } from "@/components/day-interactive/AssignmentBlock";
import { QuizBlock } from "@/components/day-interactive/QuizBlock";
import { PollBlock } from "@/components/day-interactive/PollBlock";
import { loadDay, listDays } from "@/lib/content/loader";
import { getMyCurrentCohort, listCohortDays, todayDayNumber } from "@/lib/queries/cohort";
import { getDayInteractive } from "@/lib/queries/day-interactive";
import { fmtDateTime } from "@/lib/format";

export default async function DayPage({ params }: { params: Promise<{ n: string }> }) {
  const { n } = await params;
  const cohort = await getMyCurrentCohort();
  if (!cohort) notFound();

  const today = todayDayNumber(cohort);
  const dayNumber = n === "today" ? today : Number(n);
  if (!Number.isFinite(dayNumber) || dayNumber < 1 || dayNumber > 30) notFound();

  const [content, allDays, cohortDays, interactive] = await Promise.all([
    loadDay(dayNumber),
    listDays(),
    listCohortDays(cohort.id),
    getDayInteractive(cohort.id, dayNumber),
  ]);
  if (!content) notFound();

  const cohortDay = cohortDays.find((d) => d.day_number === dayNumber);
  const railItems = allDays.map((d) => {
    const cd = cohortDays.find((c) => c.day_number === d.day);
    return {
      day: d.day,
      title: d.topic,
      unlocked: cd?.is_unlocked ?? false,
    };
  });

  const meta = content.meta;

  return (
    <div className="-m-6 flex md:-m-8">
      <DayRail items={railItems} activeDay={dayNumber} basePath="/day" />
      <article className="mx-auto max-w-3xl flex-1 px-6 py-8 md:px-10">
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
          <div className="mt-4 flex flex-wrap items-start gap-3">
            <CheckIn
              cohortId={cohort.id}
              dayNumber={dayNumber}
              initialStatus={interactive.attendance.status}
            />
            <StuckButton cohortId={cohort.id} />
          </div>
        </header>

        {meta.prompt_of_the_day && (
          <Card className="border-accent/40 bg-accent/5 mb-6">
            <CardTitle>Prompt of the day</CardTitle>
            <p className="text-ink/90 mt-2 text-sm leading-6 whitespace-pre-line">
              {meta.prompt_of_the_day}
            </p>
          </Card>
        )}

        <MarkdownView source={content.body} />

        {(interactive.assignment || interactive.quiz || interactive.poll) && (
          <section className="mt-10 space-y-4">
            <h2 className="text-xl font-semibold tracking-tight">Today&apos;s work</h2>
            {interactive.assignment && <AssignmentBlock assignment={interactive.assignment} />}
            {interactive.quiz && <QuizBlock quiz={interactive.quiz} dayNumber={dayNumber} />}
            {interactive.poll && <PollBlock poll={interactive.poll} />}
          </section>
        )}

        {(meta.tools_hands_on?.length ?? 0) > 0 && (
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
        )}

        {(meta.resources?.length ?? 0) > 0 && (
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
        )}

        {meta.objective?.end_goal && (
          <Card className="mt-10">
            <CardSub className="text-accent font-mono text-xs tracking-widest uppercase">
              End goal
            </CardSub>
            <p className="text-ink mt-2 text-sm leading-6">{meta.objective.end_goal}</p>
          </Card>
        )}
      </article>
    </div>
  );
}
