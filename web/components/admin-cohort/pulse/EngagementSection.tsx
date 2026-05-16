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

      <CollapsibleSection variant="card" title="Active students by day">
        {engagement.length === 0 ? (
          <CardSub>No student activity recorded yet for this cohort.</CardSub>
        ) : (
          <EngagementBarChart
            rows={engagement}
            cohortSize={cohortSize}
            dayHrefPattern={dayHrefPattern}
          />
        )}
      </CollapsibleSection>

      {activityMatrix.length > 0 && heatmapDays.length > 0 && (
        <CollapsibleSection
          variant="card"
          title="Who's drifting?"
          sub={`${activityMatrix.length} students × ${heatmapDays.length} day${heatmapDays.length === 1 ? "" : "s"} · least active first`}
        >
          <ActivityHeatmap
            rows={activityMatrix}
            days={heatmapDays}
            studentHref={studentHref}
          />
        </CollapsibleSection>
      )}

      {hasMarkedAttendance && attendance.length > 0 && (
        <CollapsibleSection
          variant="card"
          title={`Manually marked attendance (${attendance.length} day${attendance.length === 1 ? "" : "s"})`}
          defaultOpen={false}
        >
          <AttendanceStackedChart rows={attendance} />
        </CollapsibleSection>
      )}
    </CollapsibleSection>
  );
}
