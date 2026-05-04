import Link from "next/link";
import { Sparkles } from "lucide-react";
import { KpiGrid, StatCard } from "@/components/kpi/StatCard";
import { Card, CardSub, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DayCard } from "@/components/day-card/DayCard";
import { getMyCurrentCohort, listCohortDays, todayDayNumber } from "@/lib/queries/cohort";
import { getDashboardKpis } from "@/lib/queries/dashboard";
import { listMyHelpDeskTickets } from "@/lib/queries/student-help-desk";
import { getProfile } from "@/lib/auth/session";
import { fmtDate, relTime } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { StartGuideButton } from "@/components/tour/StartGuideButton";
import { DayFeedbackCard } from "@/components/day-feedback/DayFeedbackCard";
import { getPendingFeedbackDays } from "@/lib/queries/day-feedback";

export default async function DashboardPage() {
  const [cohort, profile] = await Promise.all([getMyCurrentCohort(), getProfile()]);
  if (!cohort) {
    return (
      <Card>
        <CardTitle>No active cohort</CardTitle>
        <CardSub className="mt-2">
          You don&apos;t have a confirmed registration yet. An admin will confirm your enrollment
          shortly.
        </CardSub>
      </Card>
    );
  }

  const today = todayDayNumber(cohort);
  const [kpis, days, helpDesk, pendingFeedback] = await Promise.all([
    getDashboardKpis(cohort.id),
    listCohortDays(cohort.id),
    listMyHelpDeskTickets(cohort.id),
    getPendingFeedbackDays(cohort.id, today, 3),
  ]);
  const showOnboardingBanner = !profile?.onboarded_at;

  const todayDay = days.find((d) => d.day_number === today);
  const upcoming = days.filter((d) => d.day_number > today && d.day_number <= today + 3);

  return (
    <div data-tour="learn-page" className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-accent font-mono text-xs tracking-widest uppercase">{cohort.name}</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">
            Welcome back · Day {today} of 30
          </h1>
          <p className="text-muted mt-1 text-sm">
            {fmtDate(cohort.starts_on)} → {fmtDate(cohort.ends_on)}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <StartGuideButton
            persona="student"
            variant="ghost"
            size="sm"
            label="Replay the tour"
          />
          {todayDay && (
            <Button asChild>
              <Link href={`/day/${today}`}>Open today&apos;s lesson →</Link>
            </Button>
          )}
        </div>
      </header>

      {showOnboardingBanner && (
        <Link
          href="/onboarding"
          className="
            border-accent/45 bg-accent/[0.06] hover:border-accent hover:bg-accent/10
            group flex flex-wrap items-center gap-3 rounded-lg border px-4 py-3
            transition-colors
          "
        >
          <span className="bg-accent/15 text-accent flex h-9 w-9 shrink-0 items-center justify-center rounded-full">
            <Sparkles size={15} strokeWidth={2.1} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-ink text-sm font-medium">Day 0 · Welcome — start here</p>
            <p className="text-muted text-xs">
              Five-minute tour of your pod, classmates, lessons, leaderboard, and where to get help.
            </p>
          </div>
          <span className="text-accent shrink-0 text-xs font-semibold uppercase tracking-[0.16em]">
            Open →
          </span>
        </Link>
      )}

      <KpiGrid>
        <StatCard
          label="Days complete"
          value={kpis.daysComplete}
          hint={`of ${days.length}`}
          tone="accent"
        />
        <StatCard label="Attendance" value={kpis.attendanceCount} hint="days present" />
        <StatCard
          label="Drafts in progress"
          value={kpis.pendingAssignments}
          tone={kpis.pendingAssignments > 0 ? "warn" : "default"}
        />
      </KpiGrid>

      <section className="border-line bg-card flex flex-wrap items-center justify-between gap-3 rounded-lg border p-4">
        <div className="min-w-0">
          <p className="text-ink text-sm font-medium">Need help with something?</p>
          <p className="text-muted text-xs leading-relaxed">
            Send a technical, content, or team request. Your faculty and pod see it first, and tech support
            takes over if it is escalated.
          </p>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href="/help-desk">Open help desk →</Link>
        </Button>
      </section>

      {helpDesk.length > 0 && (
        <section>
          <div className="mb-3 flex items-center justify-between gap-2">
            <h2 className="text-lg font-semibold tracking-tight">Help desk</h2>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/help-desk">View all</Link>
            </Button>
          </div>
          <div className="space-y-2">
            {helpDesk.slice(0, 3).map((t) => (
              <div
                key={t.id}
                className="border-line bg-card flex flex-wrap items-center justify-between gap-2 rounded-lg border p-3 text-sm"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge
                      variant={t.status === "open" ? "warn" : t.status === "helping" ? "accent" : "default"}
                    >
                      {t.status}
                    </Badge>
                    {t.status === "open" && t.queue_position != null && t.open_in_cohort > 0 && (
                      <span className="text-muted text-xs">Queue #{t.queue_position}</span>
                    )}
                    <span className="text-muted text-xs">{relTime(t.created_at)}</span>
                  </div>
                  {t.message && (
                    <p className="text-ink/85 mt-1 line-clamp-2">{t.message}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {pendingFeedback.length > 0 && (
        <section>
          <div className="mb-3 flex items-baseline justify-between gap-2">
            <h2 className="text-lg font-semibold tracking-tight">
              Tell us about yesterday
            </h2>
            <p className="text-muted text-xs">
              A quick rating helps faculty adjust the pace.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {pendingFeedback.map((d) => (
              <DayFeedbackCard
                key={d.day_number}
                cohortId={cohort.id}
                dayNumber={d.day_number}
                dayTitle={d.title}
              />
            ))}
          </div>
        </section>
      )}

      {todayDay && (
        <section>
          <h2 className="mb-3 text-lg font-semibold tracking-tight">Today</h2>
          <DayCard
            dayNumber={todayDay.day_number}
            title={todayDay.title}
            isUnlocked={todayDay.is_unlocked}
            liveSessionAt={todayDay.live_session_at}
            capstoneKind={todayDay.capstone_kind}
            href={`/day/${todayDay.day_number}`}
          />
        </section>
      )}

      {upcoming.length > 0 && (
        <section>
          <h2 className="mb-3 text-lg font-semibold tracking-tight">Coming up</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {upcoming.map((d) => (
              <DayCard
                key={d.day_number}
                dayNumber={d.day_number}
                title={d.title}
                isUnlocked={d.is_unlocked}
                liveSessionAt={d.live_session_at}
                capstoneKind={d.capstone_kind}
                href={`/day/${d.day_number}`}
              />
            ))}
          </div>
        </section>
      )}

    </div>
  );
}
