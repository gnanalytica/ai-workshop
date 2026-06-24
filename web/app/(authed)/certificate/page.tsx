import { Card, CardSub, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getMyCurrentCohort, todayDayNumber } from "@/lib/queries/cohort";
import { getDashboardKpis } from "@/lib/queries/dashboard";
import { getAssignmentCompletion } from "@/lib/queries/certificate";
import { getEffectiveUserId } from "@/lib/auth/persona";
import { getSupabaseServer } from "@/lib/supabase/server";
import { fmtDate } from "@/lib/format";

const REQUIRED_DAYS = 22;

export default async function CertificatePage() {
  const [userId, cohort] = await Promise.all([getEffectiveUserId(), getMyCurrentCohort()]);
  if (!cohort || !userId) return <Card><CardTitle>No active cohort</CardTitle></Card>;

  const sb = await getSupabaseServer();
  const [kpis, completion, { data: profile }] = await Promise.all([
    getDashboardKpis(cohort.id),
    getAssignmentCompletion(cohort.id),
    sb.from("profiles").select("full_name").eq("id", userId).maybeSingle(),
  ]);

  const today = todayDayNumber(cohort);
  const cohortEnded = today >= 30;
  const eligible =
    cohortEnded &&
    kpis.daysComplete >= REQUIRED_DAYS &&
    completion.meetsFiftyPercent;

  return (
    <div className="space-y-6">
      <header>
        <p className="text-accent font-mono text-xs tracking-widest uppercase">Certificate</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">Your completion certificate</h1>
      </header>

      <Card className="p-5 sm:p-8">
        <div className="text-center">
          <p className="text-muted font-mono text-xs tracking-widest uppercase">
            Gnanalytica · 30-Day AI Workshop
          </p>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight break-words sm:text-3xl">
            {profile?.full_name ?? "—"}
          </h2>
          <p className="text-muted mt-2 text-sm">{cohort.name}</p>
          <p className="text-muted mt-1 text-xs">
            {fmtDate(cohort.starts_on)} → {fmtDate(cohort.ends_on)}
          </p>

          <div className="mx-auto mt-6 max-w-md">
            <div className="flex flex-wrap justify-center gap-2 text-xs">
              <Badge variant={kpis.daysComplete >= REQUIRED_DAYS ? "ok" : "danger"}>
                Days completed {kpis.daysComplete}/30
              </Badge>
              <Badge variant={completion.meetsFiftyPercent ? "ok" : "danger"}>
                Assignments {completion.submittedCount}/{completion.totalAssignments}
              </Badge>
              <Badge variant={cohortEnded ? "ok" : "danger"}>
                {cohortEnded ? "Cohort ended" : "Cohort in progress"}
              </Badge>
            </div>
          </div>

          {eligible ? (
            <div className="mt-6 space-y-2">
              <p className="text-ok">You&apos;ve graduated. 🎉</p>
              <p className="text-muted text-xs">
                Your certificate will be available for download here soon.
              </p>
            </div>
          ) : (
            <CardSub className="mt-6">
              Complete the workshop to unlock your certificate.
            </CardSub>
          )}
        </div>
      </Card>
    </div>
  );
}
