import { Card, CardSub } from "@/components/ui/card";
import { EngagementChart } from "@/components/charts/EngagementChart";
import { ActivityHeatmap } from "@/components/charts/ActivityHeatmap";
import { StackedBarChart, type BarRow } from "@/components/charts/BarChart";
import type { DayEngagementBucket } from "@/lib/queries/analytics";
import type { ActivityMatrixStudent } from "@/lib/queries/analytics";

export function EngagementSection({
  engagement,
  activityMatrix,
  heatmapDays,
  chartRows,
  hasMarkedAttendance,
  studentHref,
}: {
  engagement: DayEngagementBucket[];
  activityMatrix: ActivityMatrixStudent[];
  heatmapDays: number[];
  chartRows: BarRow[];
  hasMarkedAttendance: boolean;
  studentHref: (uid: string) => string;
}) {
  return (
    <section className="space-y-3">
      <header className="border-line/40 flex flex-wrap items-baseline justify-between gap-2 border-b-2 pb-2">
        <h2 className="text-base font-semibold tracking-tight">Engagement</h2>
        <p className="text-muted text-xs">
          Activity = student submitted, took a quiz, gave feedback, voted, or
          ticked a lab on that day (any one source → counted once).
        </p>
      </header>

      <Card>
        <div className="space-y-2">
          <h3 className="text-sm font-semibold">Active students by day</h3>
          {engagement.length === 0 ? (
            <CardSub>No student activity recorded yet for this cohort.</CardSub>
          ) : (
            <EngagementChart rows={engagement} />
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

      {hasMarkedAttendance && chartRows.length > 0 && (
        <details className="border-line bg-card/60 group rounded-lg border">
          <summary className="text-muted hover:text-ink cursor-pointer px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em]">
            Manually marked attendance ({chartRows.length} day
            {chartRows.length === 1 ? "" : "s"})
          </summary>
          <div className="px-4 pb-4">
            <StackedBarChart rows={chartRows} />
            <div className="text-muted mt-4 flex flex-wrap gap-3 text-xs">
              <span>
                <span className="bg-ok/70 mr-1 inline-block h-2 w-2 rounded" />{" "}
                Present
              </span>
              <span>
                <span className="bg-warn/70 mr-1 inline-block h-2 w-2 rounded" />{" "}
                Late
              </span>
              <span>
                <span className="bg-bg-soft mr-1 inline-block h-2 w-2 rounded" />{" "}
                Excused
              </span>
              <span>
                <span className="bg-danger/70 mr-1 inline-block h-2 w-2 rounded" />{" "}
                Absent
              </span>
            </div>
          </div>
        </details>
      )}
    </section>
  );
}
