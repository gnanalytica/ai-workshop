import { Card, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getMyCurrentCohort } from "@/lib/queries/cohort";
import { getFacultyPods } from "@/lib/queries/faculty-pod";
import { checkCapability } from "@/lib/auth/requireCapability";
import { getSession } from "@/lib/auth/session";
import {
  listStudentLeaderboard,
  listPodLeaderboard,
  listTeamLeaderboard,
} from "@/lib/queries/faculty-cohort";
import { StudentLeaderboardTable } from "@/app/(authed)/faculty/leaderboard/StudentLeaderboardTable";
import { PodLeaderboardTable } from "@/app/(authed)/faculty/leaderboard/PodLeaderboardTable";
import { TeamLeaderboardTable } from "@/app/(authed)/faculty/leaderboard/TeamLeaderboardTable";

export default async function LeaderboardPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const cohort = await getMyCurrentCohort();
  if (!cohort)
    return (
      <Card>
        <CardTitle>No active cohort.</CardTitle>
      </Card>
    );
  const cohortId = cohort.id;
  const tab = ((await searchParams).tab ?? "student") as
    | "student"
    | "pod"
    | "team";

  const isFaculty = await checkCapability("roster.read", cohortId);
  const me = await getSession();
  const [students, pods, teams, myPods] = await Promise.all([
    listStudentLeaderboard(cohortId),
    listPodLeaderboard(cohortId),
    listTeamLeaderboard(cohortId),
    isFaculty && me ? getFacultyPods(cohortId, me.id) : Promise.resolve([]),
  ]);

  const myPodName = myPods[0]?.pod_name ?? null;

  return (
    <div data-tour="leaderboard-page" className="space-y-6">
      <header>
        <p className="text-accent font-mono text-xs tracking-widest uppercase">
          {cohort.name} · Leaderboard
        </p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">Standings</h1>
        <p className="text-muted mt-1 text-sm">
          Cumulative score = quizzes + graded assignments + 5×posts + 2×comments
          + net upvotes received.
        </p>
      </header>

      <nav className="border-line/50 flex gap-1 border-b">
        <TabLink current={tab} value="student" label="Students" />
        <TabLink current={tab} value="pod" label="Pods" />
        <TabLink current={tab} value="team" label="Teams" />
      </nav>

      {tab === "student" && (
        <Card>
          <StudentLeaderboardTable rows={students} myPodName={myPodName} />
        </Card>
      )}
      {tab === "pod" && (
        <Card>
          <PodLeaderboardTable rows={pods} />
        </Card>
      )}
      {tab === "team" && (
        <Card>
          <TeamLeaderboardTable rows={teams} />
        </Card>
      )}
    </div>
  );
}

function TabLink({
  current,
  value,
  label,
}: {
  current: string;
  value: string;
  label: string;
}) {
  const active = current === value;
  return (
    <a
      href={`?tab=${value}`}
      className={`-mb-px border-b-2 px-4 py-2 text-sm font-medium ${
        active
          ? "border-accent text-ink"
          : "border-transparent text-muted hover:text-ink"
      }`}
    >
      {label}
      {active && (
        <Badge variant="accent" className="ml-2">
          Active
        </Badge>
      )}
    </a>
  );
}
