"use client";

import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  YAxis,
} from "recharts";
import { ChartTooltip } from "./ChartTooltip";
import { chartColor } from "./theme";

interface SparkPoint {
  label: string;
  value: number;
  /** Optional tooltip suffix, e.g. "%" or "★". */
  hint?: string;
}

/**
 * Tiny area-line spark used inside HeroStat and section headers. Hovering
 * surfaces the per-day value and label. Falls back to nothing for <2 points.
 */
export function Sparkline({
  points,
  /** "ok" | "warn" | "danger" | "accent" — picks the stroke color. */
  tone = "accent",
  width,
  height = 28,
  /** Inline a single number after the line (rendered by parent). */
}: {
  points: SparkPoint[];
  tone?: "ok" | "warn" | "danger" | "accent";
  width?: number;
  height?: number;
}) {
  if (points.length < 2) return null;
  const stroke =
    tone === "ok"
      ? chartColor.ok
      : tone === "warn"
        ? chartColor.warn
        : tone === "danger"
          ? chartColor.danger
          : chartColor.accent;

  return (
    <div style={{ width: width ?? "100%", height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={points}
          margin={{ top: 2, right: 2, bottom: 2, left: 2 }}
        >
          <defs>
            <linearGradient id={`spark-${tone}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={stroke} stopOpacity={0.35} />
              <stop offset="100%" stopColor={stroke} stopOpacity={0} />
            </linearGradient>
          </defs>
          <YAxis hide domain={["auto", "auto"]} />
          <Tooltip
            cursor={{ stroke, strokeWidth: 1, strokeDasharray: "2 2" }}
            content={
              <ChartTooltip
                rows={(payload) => {
                  const p = payload[0]?.payload as SparkPoint | undefined;
                  if (!p) return [];
                  return [
                    {
                      label: p.label,
                      value: `${p.value}${p.hint ?? ""}`,
                      color: stroke,
                    },
                  ];
                }}
              />
            }
            wrapperStyle={{ outline: "none" }}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke={stroke}
            strokeWidth={1.5}
            fill={`url(#spark-${tone})`}
            isAnimationActive={false}
            dot={false}
            activeDot={{ r: 3, fill: stroke }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
