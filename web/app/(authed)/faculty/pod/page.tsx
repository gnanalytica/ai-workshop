import Link from "next/link";
import { requireCapability } from "@/lib/auth/requireCapability";
import { getSession } from "@/lib/auth/session";
import { Card, CardSub, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkline } from "@/components/sparkline/Sparkline";
import { getFacultyCohort, getFacultyTodayKpis } from "@/lib/queries/faculty";
import { getFacultyPods } from "@/lib/queries/faculty-pod";
import { listAtRiskStudents } from "@/lib/queries/faculty-cohort";
import { listCohortDays, todayDayNumber } from "@/lib/queries/cohort";
import { getCohortTrend } from "@/lib/queries/cohort-trends";
import { fmtDateTime } from "@/lib/format";
import { FacultyTabs } from "@/components/faculty-tabs/FacultyTabs";
import { PodMembers } from "./PodMembers";

export default async function FacultyPodPage() {
  await requireCapability("roster.read");
  const f = await getFacultyCohort();
  const me = await getSession();
  if (!f || !me) return <Card><CardTitle>You aren&apos;t assigned to a cohort.</CardTitle></Card>;
  const [pods, kpis, days, atRiskAll] = await Promise.all([
    getFacultyPods(f.cohort.id),
    getFacultyTodayKpis(f.cohort.id, me.id),
    listCohortDays(f.cohort.id),
    listAtRiskStudents(f.cohort.id),
  ]);
  const today = todayDayNumber(f.cohort);
  const todayDay = days.find((d) => d.day_number === today);
  const podStudentIds = new Set(pods.flatMap((p) => p.members.map((m) => m.user_id)));
  const atRisk = atRiskAll.filter((s) => podStudentIds.has(s.user_id)).length;

  return (
    <div className="space-y-6">
      <header>
        <p className="text-accent font-mono text-xs tracking-widest uppercase">
          {f.cohort.name}
        </p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">Faculty</h1>
        <CardSub className="mt-1">
          {pods.length} {pods.length === 1 ? "pod" : "pods"} ·{" "}
          {pods.reduce((s, p) => s + p.members.length, 0)} students
        </CardSub>
      </header>
      <FacultyTabs active="pod" />
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
              href="/day/today"
              className="text-accent text-sm font-medium hover:underline"
            >
              Today&apos;s lesson
            </Link>
          </div>
        </div>
      </Card>
      {pods.length === 0 ? (
        <Card>
          <CardTitle className="mb-2">No pod assigned</CardTitle>
          <CardSub>
            You aren&apos;t assigned to a pod in this cohort yet. Ask an admin
            to add you, or visit the{" "}
            <Link href="/faculty/cohort" className="text-accent hover:underline">
              cohort overview
            </Link>{" "}
            to see all pods.
          </CardSub>
        </Card>
      ) : (
        await Promise.all(pods.map(async (p) => {
          const memberIds = p.members.map((m) => m.user_id);
          const trend = await getCohortTrend(f.cohort.id, memberIds);
          return (
            <section key={p.pod_id}>
              <div className="mb-3 flex items-center gap-2">
                <h2 className="text-lg font-semibold tracking-tight">{p.pod_name}</h2>
                <Badge>{p.members.length} members</Badge>
              </div>
              {p.shared_notes && (
                <Card className="mb-3 bg-bg-soft">
                  <CardSub>{p.shared_notes}</CardSub>
                </Card>
              )}
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
              <PodMembers members={p.members} totalDays={today} />
            </section>
          );
        }))
      )}
    </div>
  );
}
