"use client";

import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ChartTooltip } from "./ChartTooltip";
import { chartColor, gridStyle, ratingColor, tickStyle } from "./theme";
import type { DayFeedbackSummary } from "@/lib/queries/faculty-cohort";

/**
 * Per-day feedback distribution. Stacked bar shows count of ratings per star
 * band (1–5★ colored from red → green). Avg-rating overlay line on the right
 * axis (1–5 scale). Hover reveals exact counts per star.
 */
export function FeedbackDistributionChart({
  rows,
  cohortSize,
  height = 240,
}: {
  rows: DayFeedbackSummary[];
  cohortSize: number;
  height?: number;
}) {
  const data = [...rows]
    .sort((a, b) => a.day_number - b.day_number)
    .map((r) => ({
      day_number: r.day_number,
      label: `D${String(r.day_number).padStart(2, "0")}`,
      total: r.total_responses,
      r1: r.rating_1,
      r2: r.rating_2,
      r3: r.rating_3,
      r4: r.rating_4,
      r5: r.rating_5,
      avg: r.avg_rating,
    }));

  if (data.length === 0) return null;

  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={data}
          margin={{ top: 8, right: 8, bottom: 4, left: 0 }}
          barCategoryGap={8}
        >
          <CartesianGrid {...gridStyle} vertical={false} />
          <XAxis
            dataKey="label"
            tick={tickStyle}
            tickLine={false}
            axisLine={{ stroke: chartColor.line }}
          />
          <YAxis
            yAxisId="count"
            tick={tickStyle}
            tickLine={false}
            axisLine={false}
            width={28}
          />
          <YAxis
            yAxisId="avg"
            orientation="right"
            tick={tickStyle}
            tickLine={false}
            axisLine={false}
            width={28}
            domain={[1, 5]}
            ticks={[1, 2, 3, 4, 5]}
          />
          <Tooltip
            cursor={{ fill: chartColor.bgSoft, opacity: 0.5 }}
            content={
              <ChartTooltip
                rows={(payload) => {
                  const d = payload[0]?.payload as (typeof data)[number];
                  if (!d) return [];
                  const pct = (n: number) =>
                    d.total === 0 ? "0%" : `${Math.round((n / d.total) * 100)}%`;
                  return [
                    {
                      label: "Responses",
                      value: `${d.total}/${cohortSize}`,
                      color: chartColor.muted,
                    },
                    {
                      label: "★1",
                      value: d.r1,
                      color: ratingColor.r1,
                      hint: pct(d.r1),
                    },
                    {
                      label: "★2",
                      value: d.r2,
                      color: ratingColor.r2,
                      hint: pct(d.r2),
                    },
                    {
                      label: "★3",
                      value: d.r3,
                      color: ratingColor.r3,
                      hint: pct(d.r3),
                    },
                    {
                      label: "★4",
                      value: d.r4,
                      color: ratingColor.r4,
                      hint: pct(d.r4),
                    },
                    {
                      label: "★5",
                      value: d.r5,
                      color: ratingColor.r5,
                      hint: pct(d.r5),
                    },
                    {
                      label: "Avg",
                      value: d.avg === null ? "—" : d.avg.toFixed(2),
                      color: chartColor.accent,
                    },
                  ];
                }}
              />
            }
          />
          <Legend
            verticalAlign="top"
            height={20}
            iconType="square"
            iconSize={8}
            wrapperStyle={{ fontSize: 11, paddingBottom: 4 }}
            formatter={(value) => <span className="text-muted">{value}</span>}
          />
          <Bar
            yAxisId="count"
            dataKey="r1"
            stackId="s"
            name="★1"
            fill={ratingColor.r1}
          />
          <Bar
            yAxisId="count"
            dataKey="r2"
            stackId="s"
            name="★2"
            fill={ratingColor.r2}
          />
          <Bar
            yAxisId="count"
            dataKey="r3"
            stackId="s"
            name="★3"
            fill={ratingColor.r3}
          />
          <Bar
            yAxisId="count"
            dataKey="r4"
            stackId="s"
            name="★4"
            fill={ratingColor.r4}
          />
          <Bar
            yAxisId="count"
            dataKey="r5"
            stackId="s"
            name="★5"
            fill={ratingColor.r5}
            radius={[3, 3, 0, 0]}
          />
          <Line
            yAxisId="avg"
            type="monotone"
            dataKey="avg"
            stroke={chartColor.accent}
            strokeWidth={2}
            dot={{ r: 3, fill: chartColor.accent }}
            activeDot={{ r: 5 }}
            name="avg ★ (right axis)"
            connectNulls
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
