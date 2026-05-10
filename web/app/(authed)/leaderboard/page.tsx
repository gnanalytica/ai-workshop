import { Card, CardSub, CardTitle } from "@/components/ui/card";
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
          Total = <span className="text-ink">35%</span> quizzes ·{" "}
          <span className="text-ink">35%</span> graded submissions ·{" "}
          <span className="text-ink">30%</span> activity. Activity is
          measured against days that had something to do — buffer days
          can&apos;t pull you down.
        </p>
      </header>

      <nav className="border-line/50 flex gap-1 border-b">
        <TabLink current={tab} value="student" label="Students" />
        <TabLink current={tab} value="pod" label="Pods" />
        <TabLink current={tab} value="team" label="Teams" />
      </nav>

      {tab === "student" && (
        <div className="space-y-4">
          {me && <YourScorecard rows={students} viewerUserId={me.id} />}
          <Card>
            <StudentLeaderboardTable
              rows={students}
              myPodName={myPodName}
              viewerUserId={me?.id ?? null}
              canDrillIntoStudents={isFaculty}
            />
          </Card>
        </div>
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

function YourScorecard({
  rows,
  viewerUserId,
}: {
  rows: readonly Awaited<ReturnType<typeof listStudentLeaderboard>>[number][];
  viewerUserId: string;
}) {
  const sorted = [...rows].sort((a, b) => b.total_score - a.total_score);
  const idx = sorted.findIndex((r) => r.user_id === viewerUserId);
  if (idx === -1) {
    return (
      <Card className="bg-bg-soft">
        <CardTitle className="text-base">Your scorecard</CardTitle>
        <CardSub className="mt-1">
          You don&apos;t have any scoreable activity yet. Quizzes, graded
          submissions, and daily activity will start filling this in once the
          first deliverables drop.
        </CardSub>
      </Card>
    );
  }
  const me = sorted[idx]!;
  const rank = idx + 1;
  const total = sorted.length;
  return (
    <Card className="border-accent/30 bg-accent/[0.04] p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <p className="text-accent font-mono text-xs tracking-widest uppercase">
            Your scorecard
          </p>
          <h2 className="text-ink mt-1 text-xl font-semibold tracking-tight">
            Rank #{rank}{" "}
            <span className="text-muted text-sm font-normal">of {total}</span>
          </h2>
          {me.pod_name && (
            <p className="text-muted mt-0.5 text-xs">{me.pod_name}</p>
          )}
        </div>
        <div className="text-right">
          <p className="text-muted text-xs uppercase tracking-wider">Total</p>
          <p className="text-accent text-3xl font-semibold">{me.total_score}</p>
        </div>
      </div>
      <div className="border-line/50 mt-4 grid grid-cols-3 gap-4 border-t pt-4">
        <ScoreSlice label="Quiz" value={me.quiz_score} total={me.total_score} />
        <ScoreSlice
          label="Submissions"
          value={me.submission_score}
          total={me.total_score}
        />
        <ScoreSlice
          label="Activity"
          value={me.activity_score}
          total={me.total_score}
        />
      </div>
    </Card>
  );
}

function ScoreSlice({
  label,
  value,
  total,
}: {
  label: string;
  value: number;
  total: number;
}) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div>
      <p className="text-muted text-xs uppercase tracking-wider">{label}</p>
      <p className="text-ink mt-1 font-mono text-lg">{value}</p>
      <div className="bg-line/40 mt-1.5 h-1 overflow-hidden rounded-full">
        <div
          className="bg-accent h-full rounded-full transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="text-muted mt-1 text-[10px]">{pct}% of total</p>
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
