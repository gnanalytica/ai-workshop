import { requireCapability } from "@/lib/auth/requireCapability";
import { Card, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getFacultyCohort } from "@/lib/queries/faculty";
import { getFacultyPods } from "@/lib/queries/faculty-pod";
import {
  listStudentLeaderboard,
  listPodLeaderboard,
  listTeamLeaderboard,
} from "@/lib/queries/faculty-cohort";
import { StudentLeaderboardTable } from "./StudentLeaderboardTable";
import { PodLeaderboardTable } from "./PodLeaderboardTable";
import { TeamLeaderboardTable } from "./TeamLeaderboardTable";

export default async function LeaderboardPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  await requireCapability("roster.read");
  const f = await getFacultyCohort();
  if (!f) return <Card><CardTitle>You aren&apos;t assigned to a cohort.</CardTitle></Card>;
  const cohortId = f.cohort.id;
  const tab = ((await searchParams).tab ?? "student") as "student" | "pod" | "team";

  const [students, pods, teams, myPods] = await Promise.all([
    listStudentLeaderboard(cohortId),
    listPodLeaderboard(cohortId),
    listTeamLeaderboard(cohortId),
    getFacultyPods(cohortId),
  ]);

  const myPodName = myPods[0]?.pod_name ?? null;

  return (
    <div className="space-y-6">
      <header>
        <p className="text-accent font-mono text-xs tracking-widest uppercase">{f.cohort.name} · Leaderboard</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">Standings</h1>
        <p className="text-muted mt-1 text-sm">
          Cumulative score = quizzes + graded assignments + 5×posts + 2×comments + net upvotes received.
        </p>
      </header>

      <nav className="flex gap-1 border-b border-line/50">
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

function TabLink({ current, value, label }: { current: string; value: string; label: string }) {
  const active = current === value;
  return (
    <a
      href={`?tab=${value}`}
      className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${
        active ? "border-accent text-ink" : "border-transparent text-muted hover:text-ink"
      }`}
    >
      {label}
      {active && <Badge variant="accent" className="ml-2">Active</Badge>}
    </a>
  );
}
