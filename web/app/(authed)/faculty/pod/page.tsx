import Link from "next/link";
import { Sparkles } from "lucide-react";
import { checkCapability, requireCapability } from "@/lib/auth/requireCapability";
import { getProfile, getSession } from "@/lib/auth/session";
import { Card, CardSub, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkline } from "@/components/sparkline/Sparkline";
import { getFacultyCohort, getFacultyTodayKpis } from "@/lib/queries/faculty";
import { getFacultyPods } from "@/lib/queries/faculty-pod";
import { listAtRiskStudents } from "@/lib/queries/faculty-cohort";
import { listCohortDays, todayDayNumber } from "@/lib/queries/cohort";
import { getCohortTrend } from "@/lib/queries/cohort-trends";
import { fmtDateTime } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { PodMembers } from "./PodMembers";

export default async function FacultyPodPage() {
  await requireCapability("roster.read");
  const f = await getFacultyCohort();
  const me = await getSession();
  if (!f || !me) return <Card><CardTitle>You aren&apos;t assigned to a cohort.</CardTitle></Card>;
  const [podRows, kpis, days, atRiskAll, canManagePods, profile] = await Promise.all([
    getFacultyPods(f.cohort.id, me.id),
    getFacultyTodayKpis(f.cohort.id, me.id),
    listCohortDays(f.cohort.id),
    listAtRiskStudents(f.cohort.id),
    checkCapability("pods.write", f.cohort.id),
    getProfile(),
  ]);
  const showOnboardingBanner = !profile?.onboarded_at;
  const myPod = podRows[0] ?? null;
  const today = todayDayNumber(f.cohort);
  const todayDay = days.find((d) => d.day_number === today);
  const podStudentIds = new Set((myPod?.members ?? []).map((m) => m.user_id));
  const atRisk = atRiskAll.filter((s) => podStudentIds.has(s.user_id)).length;

  return (
    <div data-tour="faculty-pod-page" className="space-y-6">
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
              Quick tour of pods, the cohort roster, the live link, grading, and the help-desk queue.
            </p>
          </div>
          <span className="text-accent shrink-0 text-xs font-semibold uppercase tracking-[0.16em]">
            Open →
          </span>
        </Link>
      )}

      <header>
        <p className="text-accent font-mono text-xs tracking-widest uppercase">
          {f.cohort.name}
        </p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">My pod</h1>
        <CardSub className="mt-1">
          {myPod
            ? `${myPod.pod_name} · ${myPod.members.length} student${myPod.members.length === 1 ? "" : "s"}`
            : "No pod assigned yet"}
        </CardSub>
      </header>

      <Card className="bg-bg-soft">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-ink text-sm font-medium">
              Day {today}
              {todayDay?.title ? ` · ${todayDay.title}` : ""}
            </p>
            {todayDay?.live_session_at && (
              <p className="text-muted text-xs">
                Live session at {fmtDateTime(todayDay.live_session_at)}
              </p>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link href="/faculty/help-desk" className="hover:opacity-80">
              <Badge variant={kpis.helpDeskOpen > 0 ? "danger" : "default"}>
                {kpis.helpDeskOpen} help desk open
              </Badge>
            </Link>
            <Badge variant={kpis.pendingReview > 0 ? "warn" : "default"}>
              {kpis.pendingReview} to review
            </Badge>
            <Link href="/faculty/cohort#at-risk" className="hover:opacity-80">
              <Badge variant={atRisk > 0 ? "warn" : "ok"}>
                {atRisk} at risk
              </Badge>
            </Link>
            <Link
              href="/faculty/day/today"
              className="text-accent text-sm font-medium hover:underline"
            >
              Today&apos;s lesson
            </Link>
          </div>
        </div>
      </Card>
      {!myPod ? (
        <Card>
          <CardTitle className="mb-2">No pod assigned yet</CardTitle>
          <CardSub className="space-y-3">
            <p>
              All pod assignments happen in the{" "}
              <Link href="/faculty/cohort#pods" className="text-accent hover:underline">
                cohort kanban
              </Link>
              . {canManagePods
                ? "Drag your name from the “Cohort faculty” column onto a pod, or ask another lead to assign you."
                : "Ask your cohort lead to drag your name onto a pod."}
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              <Button asChild size="sm">
                <Link href="/faculty/cohort#pods">Open cohort kanban</Link>
              </Button>
            </div>
          </CardSub>
        </Card>
      ) : (
        <section>
          <div className="mb-3 flex items-center gap-2">
            <h2 className="text-lg font-semibold tracking-tight">{myPod.pod_name}</h2>
            <Badge>{myPod.members.length} members</Badge>
          </div>
          {myPod.shared_notes && (
            <Card className="mb-3 bg-bg-soft">
              <CardSub>{myPod.shared_notes}</CardSub>
            </Card>
          )}
          <PodTrend
            cohortId={f.cohort.id}
            memberIds={myPod.members.map((m) => m.user_id)}
          />
          <PodMembers members={myPod.members} totalDays={today} cohortId={f.cohort.id} />
        </section>
      )}
    </div>
  );
}

async function PodTrend({
  cohortId,
  memberIds,
}: {
  cohortId: string;
  memberIds: string[];
}) {
  const trend = await getCohortTrend(cohortId, memberIds);
  return (
    <Card className="mb-3">
      <p className="text-muted mb-2 text-xs uppercase tracking-wider">
        Last 14 days · this pod
      </p>
      <div className="grid gap-6 sm:grid-cols-3">
        <Sparkline label="Labs" data={trend.labsDone} total={trend.totalLabs} />
        <Sparkline label="Submissions" data={trend.submissions} total={trend.totalSubmissions} />
        <Sparkline label="Posts" data={trend.posts} total={trend.totalPosts} />
      </div>
    </Card>
  );
}
