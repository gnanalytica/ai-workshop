"use client";

import { useRouter } from "next/navigation";
import {
  Bar,
  BarChart,
  Brush,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ChartTooltip } from "./ChartTooltip";
import { chartColor, gridStyle, tickStyle } from "./theme";
import type { DayEngagementBucket } from "@/lib/queries/analytics";

export function EngagementBarChart({
  rows,
  cohortSize,
  /** When provided, clicking a bar pushes to this URL pattern with `{n}` replaced by day_number. */
  dayHrefPattern,
  height = 240,
}: {
  rows: DayEngagementBucket[];
  cohortSize: number;
  dayHrefPattern?: string;
  height?: number;
}) {
  const router = useRouter();
  const data = [...rows]
    .sort((a, b) => a.day_number - b.day_number)
    .map((r, i, all) => {
      const prev = i > 0 ? all[i - 1] : null;
      const delta = prev ? r.active - prev.active : null;
      return {
        day_number: r.day_number,
        label: `D${String(r.day_number).padStart(2, "0")}`,
        active: r.active,
        inactive: Math.max(0, (r.total || cohortSize) - r.active),
        rate: r.rate,
        delta,
      };
    });

  if (data.length === 0) return null;

  const showBrush = data.length > 14;

  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 8, right: 12, bottom: showBrush ? 28 : 4, left: 0 }}
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
            width={32}
            domain={[0, cohortSize || "auto"]}
          />
          <ReferenceLine
            y={cohortSize}
            stroke={chartColor.muted}
            strokeDasharray="3 3"
            label={{
              value: `cohort = ${cohortSize}`,
              position: "insideTopRight",
              fill: chartColor.muted,
              fontSize: 10,
            }}
          />
          <Tooltip
            cursor={{ fill: chartColor.bgSoft, opacity: 0.6 }}
            content={
              <ChartTooltip
                rows={(payload) => {
                  const d = payload[0]?.payload as (typeof data)[number];
                  if (!d) return [];
                  const rate = Math.round((d.rate ?? 0) * 100);
                  const out: Array<{
                    label: string;
                    value: string | number;
                    color: string;
                    hint?: string;
                  }> = [
                    {
                      label: "Active",
                      value: `${d.active} / ${cohortSize}`,
                      color: chartColor.accent,
                      hint: `(${rate}%)`,
                    },
                    {
                      label: "Inactive",
                      value: d.inactive,
                      color: chartColor.line,
                    },
                  ];
                  if (d.delta !== null) {
                    out.push({
                      label: "Δ vs prev day",
                      value: `${d.delta > 0 ? "+" : ""}${d.delta}`,
                      color:
                        d.delta > 0
                          ? chartColor.ok
                          : d.delta < 0
                            ? chartColor.danger
                            : chartColor.muted,
                    });
                  }
                  return out;
                }}
                footer={() => (dayHrefPattern ? "click to open day detail" : null)}
              />
            }
          />
          <Bar
            dataKey="active"
            stackId="a"
            fill={chartColor.accent}
            radius={[3, 3, 0, 0]}
            onClick={
              dayHrefPattern
                ? (entry) => {
                    const day = (entry as { day_number?: number })?.day_number;
                    if (typeof day === "number") {
                      router.push(dayHrefPattern.replace("{n}", String(day)));
                    }
                  }
                : undefined
            }
            cursor={dayHrefPattern ? "pointer" : "default"}
          />
          <Bar
            dataKey="inactive"
            stackId="a"
            fill={chartColor.line}
            fillOpacity={0.5}
            radius={[3, 3, 0, 0]}
          />
          {showBrush && (
            <Brush
              dataKey="label"
              height={18}
              stroke={chartColor.accent}
              fill={chartColor.bgSoft}
              travellerWidth={8}
              y={height - 28}
            />
          )}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
