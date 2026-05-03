import { Card, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getMyCurrentCohort } from "@/lib/queries/cohort";
import { getFacultyPods } from "@/lib/queries/faculty-pod";
import { getMyPod } from "@/lib/queries/pod";
import {
  getCohortPodLeaderboard,
  getMyPodMembers,
} from "@/lib/queries/pod-leaderboard";
import { checkCapability } from "@/lib/auth/requireCapability";
import { getSession } from "@/lib/auth/session";
import {
  listStudentLeaderboard,
  listTeamLeaderboard,
} from "@/lib/queries/faculty-cohort";
import { StudentLeaderboardTable } from "@/app/(authed)/faculty/leaderboard/StudentLeaderboardTable";
import { TeamLeaderboardTable } from "@/app/(authed)/faculty/leaderboard/TeamLeaderboardTable";
import { StudentPodLeaderboardTable } from "./StudentPodLeaderboardTable";
import { MyPodMembersTable } from "./MyPodMembersTable";

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
  const [students, pods, teams, facultyPods, myPod] = await Promise.all([
    listStudentLeaderboard(cohortId),
    getCohortPodLeaderboard(cohortId),
    listTeamLeaderboard(cohortId),
    isFaculty && me ? getFacultyPods(cohortId, me.id) : Promise.resolve([]),
    getMyPod(cohortId),
  ]);

  // For faculty: highlight the pod they coach. For students: highlight their
  // own pod resolved via rpc_my_pod.
  const myPodName = facultyPods[0]?.pod_name ?? myPod?.pod_name ?? null;
  const myPodId = facultyPods[0]?.pod_id ?? myPod?.pod_id ?? null;
  const myPodMembers =
    tab === "pod" && myPod ? await getMyPodMembers(cohortId, myPod.pod_id) : [];

  return (
    <div data-tour="leaderboard-page" className="space-y-6">
      <header>
        <p className="text-accent font-mono text-xs tracking-widest uppercase">
          {cohort.name} · Leaderboard
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">Standings</h1>
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
        <div className="space-y-6">
          <Card>
            <div className="mb-3">
              <h2 className="text-ink text-lg font-semibold tracking-tight">
                Cohort pod ranking
              </h2>
              <p className="text-muted mt-0.5 text-sm">
                All pods in this cohort by total score.
              </p>
            </div>
            <StudentPodLeaderboardTable rows={pods} myPodId={myPodId} />
          </Card>
          {myPod && (
            <Card>
              <div className="mb-3">
                <h2 className="text-ink text-lg font-semibold tracking-tight">
                  My pod · {myPod.pod_name}
                </h2>
                <p className="text-muted mt-0.5 text-sm">
                  Internal ranking inside your pod.
                </p>
              </div>
              <MyPodMembersTable rows={myPodMembers} myUserId={me?.id ?? null} />
            </Card>
          )}
        </div>
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
