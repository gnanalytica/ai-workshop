import { Card, CardSub, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getProfile } from "@/lib/auth/session";
import { getMyCurrentCohort, todayDayNumber } from "@/lib/queries/cohort";
import { getDashboardKpis } from "@/lib/queries/dashboard";
import { fmtDate } from "@/lib/format";

const REQUIRED_DAYS = 22;
const REQUIRED_ATTENDANCE = 18;

export default async function CertificatePage() {
  const [profile, cohort] = await Promise.all([getProfile(), getMyCurrentCohort()]);
  if (!cohort) return <Card><CardTitle>No active cohort</CardTitle></Card>;
  const kpis = await getDashboardKpis(cohort.id);
  const today = todayDayNumber(cohort);
  const cohortEnded = today >= 30;
  const eligible =
    cohortEnded &&
    kpis.daysComplete >= REQUIRED_DAYS &&
    kpis.attendanceCount >= REQUIRED_ATTENDANCE;

  return (
    <div className="space-y-6">
      <header>
        <p className="text-accent font-mono text-xs tracking-widest uppercase">Certificate</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">Your completion certificate</h1>
      </header>

      <Card className="p-8">
        <div className="text-center">
          <p className="text-muted font-mono text-xs tracking-widest uppercase">
            Gnanalytica · 30-Day AI Workshop
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight">
            {profile?.full_name ?? "—"}
          </h2>
          <p className="text-muted mt-2 text-sm">{cohort.name}</p>
          <p className="text-muted mt-1 text-xs">
            {fmtDate(cohort.starts_on)} → {fmtDate(cohort.ends_on)}
          </p>

          <div className="mx-auto mt-6 max-w-md">
            <div className="grid grid-cols-3 gap-2 text-xs">
              <Badge variant={kpis.daysComplete >= REQUIRED_DAYS ? "ok" : "default"}>
                Days {kpis.daysComplete}/{REQUIRED_DAYS}
              </Badge>
              <Badge variant={kpis.attendanceCount >= REQUIRED_ATTENDANCE ? "ok" : "default"}>
                Attendance {kpis.attendanceCount}/{REQUIRED_ATTENDANCE}
              </Badge>
              <Badge variant={cohortEnded ? "ok" : "default"}>
                {cohortEnded ? "Cohort ended" : "Cohort live"}
              </Badge>
            </div>
          </div>

          {eligible ? (
            <div className="mt-6 space-y-2">
              <p className="text-ok">You&apos;ve graduated. 🎉</p>
              <Button>Download PDF</Button>
            </div>
          ) : (
            <CardSub className="mt-6">
              Certificate unlocks once the cohort ends and you&apos;ve hit the milestone thresholds above.
            </CardSub>
          )}
        </div>
      </Card>
    </div>
  );
}
