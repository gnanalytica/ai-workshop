import Link from "next/link";
import { checkCapability, requireCapability } from "@/lib/auth/requireCapability";
import { getSession } from "@/lib/auth/session";
import { Card, CardSub, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { KpiGrid, StatCard } from "@/components/kpi/StatCard";
import { Sparkline } from "@/components/sparkline/Sparkline";
import { FacultyTabs } from "@/components/faculty-tabs/FacultyTabs";
import { getFacultyCohort } from "@/lib/queries/faculty";
import {
  getCohortKpis,
  listAtRiskStudents,
  type AtRiskSignal,
} from "@/lib/queries/faculty-cohort";
import { getCohortPodRoster } from "@/lib/queries/cohort-roster";
import { getCohortTrend } from "@/lib/queries/cohort-trends";
import { CreatePodForm } from "@/app/(authed)/pods/CreatePodForm";
import { PodBoard } from "./PodBoard";

const SIGNAL_LABEL: Record<AtRiskSignal, string> = {
  no_activity: "Inactive 3d+",
  no_submissions: "No submissions",
  low_labs: "Low labs",
  open_help: "Open help",
};

const SIGNAL_TONE: Record<AtRiskSignal, "warn" | "danger" | "default"> = {
  no_activity: "warn",
  no_submissions: "danger",
  low_labs: "warn",
  open_help: "danger",
};

export default async function FacultyCohortPage() {
  await requireCapability("roster.read");
  const f = await getFacultyCohort();
  const me = await getSession();
  if (!f || !me)
    return (
      <Card>
        <CardTitle>You aren&apos;t assigned to a cohort.</CardTitle>
      </Card>
    );
  const cohortId = f.cohort.id;

  const [kpis, atRisk, roster, trend, canManagePods] = await Promise.all([
    getCohortKpis(cohortId),
    listAtRiskStudents(cohortId),
    getCohortPodRoster(cohortId, me.id),
    getCohortTrend(cohortId),
    checkCapability("pods.write", cohortId),
  ]);

  return (
    <div className="space-y-6">
      <header>
        <p className="text-accent font-mono text-xs tracking-widest uppercase">
          {f.cohort.name}
        </p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">Faculty</h1>
      </header>

      <FacultyTabs active="cohort" />

      <KpiGrid>
        <StatCard label="Students" value={kpis.students} />
        <StatCard label="Pods" value={kpis.pods} />
        <StatCard
          label="Unassigned"
          value={kpis.unassignedStudents}
          tone={kpis.unassignedStudents > 0 ? "warn" : "ok"}
          href="#pods"
        />
        <StatCard
          label="Pending review"
          value={kpis.pendingReview}
          tone={kpis.pendingReview > 0 ? "warn" : "default"}
        />
        <StatCard
          label="Help desk (open)"
          value={kpis.helpDeskOpen}
          tone={kpis.helpDeskOpen > 0 ? "danger" : "default"}
          href="/faculty/help-desk"
        />
        <StatCard
          label="At risk"
          value={atRisk.length}
          tone={atRisk.length > 0 ? "danger" : "ok"}
          hint=">3d inactive or low completion"
          href="#at-risk"
        />
      </KpiGrid>

      <section>
        <h2 className="mb-3 text-lg font-semibold tracking-tight">
          Last 14 days
        </h2>
        <Card>
          <div className="grid gap-6 sm:grid-cols-3">
            <Sparkline
              label="Labs done"
              data={trend.labsDone}
              total={trend.totalLabs}
            />
            <Sparkline
              label="Submissions"
              data={trend.submissions}
              total={trend.totalSubmissions}
            />
            <Sparkline
              label="Board posts"
              data={trend.posts}
              total={trend.totalPosts}
            />
          </div>
        </Card>
      </section>

      <section id="pods" className="scroll-mt-20">
        <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold tracking-tight">Pods</h2>
            <CardSub className="text-xs">
              Search, multi-select, or drag to assign students. Create pods below or open pod settings
              to add/remove faculty on a pod.
            </CardSub>
          </div>
          {canManagePods && (
            <Link
              href={`/pods?cohort=${cohortId}`}
              className="text-accent text-sm font-medium hover:underline"
            >
              Pod settings &amp; faculty roster →
            </Link>
          )}
        </div>
        {canManagePods && (
          <Card id="create-pod" className="mb-4 scroll-mt-24 border-accent/20">
            <CardTitle className="mb-1">
              {roster.pods.length === 0 ? "Create first pod" : "Create a pod"}
            </CardTitle>
            <CardSub className="mb-3 text-xs leading-relaxed">
              Name it, then drag students from Unassigned below—or use{" "}
              <Link
                href={`/pods?cohort=${cohortId}#create-pod`}
                className="text-accent font-medium hover:underline"
              >
                all pods
              </Link>{" "}
              for faculty roster. Add yourself under Pod settings → Faculty on each pod.
            </CardSub>
            <CreatePodForm cohortId={cohortId} afterCreateScrollToId="pods-board" />
          </Card>
        )}
        <div id="pods-board" className="scroll-mt-24">
          <PodBoard
            pods={roster.pods}
            unassigned={roster.unassigned}
            canManagePods={canManagePods}
          />
        </div>
      </section>

      <section id="at-risk" className="scroll-mt-20">
        <h2 className="mb-3 text-lg font-semibold tracking-tight">
          At-risk students
        </h2>
        {atRisk.length === 0 ? (
          <Card>
            <CardSub>
              Everyone has been active and is making progress.
            </CardSub>
          </Card>
        ) : (
          <Card className="p-0">
            <ul className="divide-line/50 max-h-[480px] divide-y overflow-auto">
              {atRisk.map((s) => (
                <li
                  key={s.user_id}
                  className="hover:bg-bg-soft flex items-center justify-between gap-3 px-5 py-3 text-sm transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/faculty/student/${s.user_id}`}
                      className="hover:text-accent text-ink truncate font-medium"
                    >
                      {s.full_name ?? "—"}
                    </Link>
                    {s.pod_name && (
                      <span className="text-muted ml-2">· {s.pod_name}</span>
                    )}
                    <div className="mt-1 flex flex-wrap items-center gap-1.5">
                      {s.signals.map((sig) => (
                        <Badge key={sig} variant={SIGNAL_TONE[sig]}>
                          {SIGNAL_LABEL[sig]}
                        </Badge>
                      ))}
                      <span className="text-muted text-[11px]">
                        {s.details.submissions} subs · {s.details.labs_done}{" "}
                        labs
                        {s.details.open_help_desk > 0 &&
                          ` · ${s.details.open_help_desk} help`}
                      </span>
                    </div>
                  </div>
                  {s.days_since_active !== null && (
                    <Badge variant="warn">{s.days_since_active}d idle</Badge>
                  )}
                </li>
              ))}
            </ul>
          </Card>
        )}
      </section>
    </div>
  );
}
