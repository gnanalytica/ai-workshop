import { requireCapability } from "@/lib/auth/requireCapability";
import { Card, CardSub, CardTitle } from "@/components/ui/card";
import { getAdminCohort } from "@/lib/queries/admin-context";
import { listCohortDays, todayDayNumber } from "@/lib/queries/cohort";
import { getAttendanceGrid } from "@/lib/queries/attendance";
import { AttendanceGrid } from "./AttendanceGrid";

export default async function AdminAttendancePage() {
  await requireCapability("attendance.mark:cohort");
  const cohort = await getAdminCohort();
  if (!cohort) return <Card><CardTitle>No cohort</CardTitle></Card>;
  const [rows, days] = await Promise.all([
    getAttendanceGrid(cohort.id),
    listCohortDays(cohort.id),
  ]);
  const today = todayDayNumber(
    { ...cohort, status: cohort.status as "draft" | "live" | "archived" },
  );
  const unlocked = days.filter((d) => d.is_unlocked).map((d) => d.day_number);

  return (
    <div className="space-y-6">
      <header>
        <p className="text-accent font-mono text-xs tracking-widest uppercase">Attendance</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">{cohort.name}</h1>
        <CardSub className="mt-1">
          {rows.length} students · {unlocked.length} days unlocked · today is Day {today}
        </CardSub>
      </header>
      <AttendanceGrid
        cohortId={cohort.id}
        rows={rows}
        unlockedDays={unlocked}
        focusDay={today}
      />
    </div>
  );
}
