"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ChartTooltip } from "./ChartTooltip";
import { chartColor, gridStyle, tickStyle } from "./theme";
import type { DayAttendanceBucket } from "@/lib/queries/analytics";

export function AttendanceStackedChart({
  rows,
  height = 200,
}: {
  rows: DayAttendanceBucket[];
  height?: number;
}) {
  const data = [...rows]
    .sort((a, b) => a.day_number - b.day_number)
    .map((r) => ({
      label: `D${String(r.day_number).padStart(2, "0")}`,
      day_number: r.day_number,
      present: r.present,
      late: r.late,
      excused: r.excused,
      absent: r.absent,
      total: r.present + r.late + r.excused + r.absent,
    }));

  if (data.length === 0) return null;

  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 8, right: 8, bottom: 4, left: 0 }}
          barCategoryGap={6}
        >
          <CartesianGrid {...gridStyle} vertical={false} />
          <XAxis
            dataKey="label"
            tick={tickStyle}
            tickLine={false}
            axisLine={{ stroke: chartColor.line }}
          />
          <YAxis
            tick={tickStyle}
            tickLine={false}
            axisLine={false}
            width={28}
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
                      label: "Present",
                      value: d.present,
                      color: chartColor.ok,
                      hint: pct(d.present),
                    },
                    {
                      label: "Late",
                      value: d.late,
                      color: chartColor.warn,
                      hint: pct(d.late),
                    },
                    {
                      label: "Excused",
                      value: d.excused,
                      color: chartColor.muted,
                      hint: pct(d.excused),
                    },
                    {
                      label: "Absent",
                      value: d.absent,
                      color: chartColor.danger,
                      hint: pct(d.absent),
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
          <Bar dataKey="present" stackId="a" name="Present" fill={chartColor.ok} />
          <Bar dataKey="late" stackId="a" name="Late" fill={chartColor.warn} />
          <Bar
            dataKey="excused"
            stackId="a"
            name="Excused"
            fill={chartColor.muted}
            fillOpacity={0.5}
          />
          <Bar
            dataKey="absent"
            stackId="a"
            name="Absent"
            fill={chartColor.danger}
            radius={[3, 3, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
