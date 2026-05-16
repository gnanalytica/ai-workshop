"use client";

import { useRouter } from "next/navigation";
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
import {
  chartColor,
  gridStyle,
  scoreBandColor,
  tickStyle,
} from "./theme";

interface ChartRow {
  day_number: number;
  /** Total items (graded) — used for the count axis. */
  total: number;
  under_60: number;
  band_60_69: number;
  band_70_79: number;
  band_80_89: number;
  band_90_100: number;
  /** Avg score for the day — rendered as an overlay line. */
  avg: number | null;
}

/**
 * Vertical stacked bar — one bar per day, segments for each score band, plus
 * a line overlay showing avg score per day. Optionally click-through to the
 * day detail page.
 */
export function ScoreDistributionChart({
  rows,
  dayHrefPattern,
  height = 240,
}: {
  rows: ChartRow[];
  dayHrefPattern?: string;
  height?: number;
  /** Currently unused — retained for forward compatibility when we differentiate per-section tooltip footers. */
  metricLabel?: string;
}) {
  const router = useRouter();
  const data = rows.map((r) => ({
    ...r,
    label: `D${String(r.day_number).padStart(2, "0")}`,
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
            yAxisId="score"
            orientation="right"
            tick={tickStyle}
            tickLine={false}
            axisLine={false}
            width={28}
            domain={[0, 100]}
          />
          <Tooltip
            cursor={{ fill: chartColor.bgSoft, opacity: 0.5 }}
            content={
              <ChartTooltip
                rows={(payload) => {
                  const d = payload[0]?.payload as (typeof data)[number];
                  if (!d) return [];
                  return [
                    { label: "Total", value: d.total, color: chartColor.muted },
                    {
                      label: "<60",
                      value: d.under_60,
                      color: scoreBandColor.under_60,
                    },
                    {
                      label: "60–69",
                      value: d.band_60_69,
                      color: scoreBandColor.band_60_69,
                    },
                    {
                      label: "70–79",
                      value: d.band_70_79,
                      color: scoreBandColor.band_70_79,
                    },
                    {
                      label: "80–89",
                      value: d.band_80_89,
                      color: scoreBandColor.band_80_89,
                    },
                    {
                      label: "90–100",
                      value: d.band_90_100,
                      color: scoreBandColor.band_90_100,
                    },
                    {
                      label: "Avg score",
                      value: d.avg === null ? "—" : Math.round(d.avg),
                      color: chartColor.accent,
                    },
                  ];
                }}
                footer={() =>
                  dayHrefPattern ? "click to open day detail" : null
                }
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
            dataKey="under_60"
            stackId="s"
            fill={scoreBandColor.under_60}
            name="<60"
            onClick={
              dayHrefPattern
                ? (e) => {
                    const day = (e as { day_number?: number })?.day_number;
                    if (typeof day === "number")
                      router.push(dayHrefPattern.replace("{n}", String(day)));
                  }
                : undefined
            }
            cursor={dayHrefPattern ? "pointer" : "default"}
          />
          <Bar
            yAxisId="count"
            dataKey="band_60_69"
            stackId="s"
            fill={scoreBandColor.band_60_69}
            name="60–69"
          />
          <Bar
            yAxisId="count"
            dataKey="band_70_79"
            stackId="s"
            fill={scoreBandColor.band_70_79}
            name="70–79"
          />
          <Bar
            yAxisId="count"
            dataKey="band_80_89"
            stackId="s"
            fill={scoreBandColor.band_80_89}
            name="80–89"
          />
          <Bar
            yAxisId="count"
            dataKey="band_90_100"
            stackId="s"
            fill={scoreBandColor.band_90_100}
            name="90–100"
            radius={[3, 3, 0, 0]}
          />
          <Line
            yAxisId="score"
            type="monotone"
            dataKey="avg"
            stroke={chartColor.accent}
            strokeWidth={2}
            dot={{ r: 3, fill: chartColor.accent }}
            activeDot={{ r: 5 }}
            name="avg score (right axis)"
            connectNulls
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
