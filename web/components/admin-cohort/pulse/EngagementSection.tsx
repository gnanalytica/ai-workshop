import { Card, CardSub } from "@/components/ui/card";
import { EngagementBarChart } from "@/components/charts/recharts/EngagementBarChart";
import { ActivityHeatmap } from "@/components/charts/ActivityHeatmap";
import { AttendanceStackedChart } from "@/components/charts/recharts/AttendanceStackedChart";
import { CollapsibleSection } from "./CollapsibleSection";
import type {
  DayAttendanceBucket,
  DayEngagementBucket,
  ActivityMatrixStudent,
} from "@/lib/queries/analytics";

export function EngagementSection({
  engagement,
  activityMatrix,
  heatmapDays,
  attendance,
  hasMarkedAttendance,
  cohortSize,
  dayHrefPattern,
  studentHref,
}: {
  engagement: DayEngagementBucket[];
  activityMatrix: ActivityMatrixStudent[];
  heatmapDays: number[];
  attendance: DayAttendanceBucket[];
  hasMarkedAttendance: boolean;
  cohortSize: number;
  /** URL template for click-to-day navigation. `{n}` is replaced by day_number. */
  dayHrefPattern?: string;
  studentHref: (uid: string) => string;
}) {
  return (
    <CollapsibleSection
      title="Engagement"
      sub="Activity = student submitted, took a quiz, gave feedback, voted, or ticked a lab on that day (any one source → counted once)."
    >

      <Card>
        <div className="space-y-2">
          <h3 className="text-sm font-semibold">Active students by day</h3>
          {engagement.length === 0 ? (
            <CardSub>No student activity recorded yet for this cohort.</CardSub>
          ) : (
            <EngagementBarChart
              rows={engagement}
              cohortSize={cohortSize}
              dayHrefPattern={dayHrefPattern}
            />
          )}
        </div>
      </Card>

      {activityMatrix.length > 0 && heatmapDays.length > 0 && (
        <Card>
          <div className="space-y-2">
            <div className="flex items-baseline justify-between gap-2">
              <h3 className="text-sm font-semibold">Who&apos;s drifting?</h3>
              <p className="text-muted text-xs">
                {activityMatrix.length} students × {heatmapDays.length} day
                {heatmapDays.length === 1 ? "" : "s"} · least active first
              </p>
            </div>
            <ActivityHeatmap
              rows={activityMatrix}
              days={heatmapDays}
              studentHref={studentHref}
            />
          </div>
        </Card>
      )}

      {hasMarkedAttendance && attendance.length > 0 && (
        <details className="border-line bg-card/60 group rounded-lg border">
          <summary className="text-muted hover:text-ink cursor-pointer px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em]">
            Manually marked attendance ({attendance.length} day
            {attendance.length === 1 ? "" : "s"})
          </summary>
          <div className="px-4 pb-4">
            <AttendanceStackedChart rows={attendance} />
          </div>
        </details>
      )}
    </CollapsibleSection>
  );
}
