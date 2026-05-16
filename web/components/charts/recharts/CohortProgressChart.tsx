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
import type { CohortDayProgress } from "@/lib/queries/analytics";

/**
 * Grouped bar — three bars per day for quiz-attempt rate, quiz-pass rate,
 * and submission rate. Days without a quiz/assignment simply render with
 * empty buckets for those keys (no zero penalty visualization needed since
 * the upstream rollup already nulls them).
 */
export function CohortProgressChart({
  rows,
  height = 220,
}: {
  rows: CohortDayProgress[];
  height?: number;
}) {
  const data = rows.map((r) => {
    const cohort = r.cohort_size || 0;
    const expected = (r.submittable_assignments ?? 0) * cohort;
    return {
      day_number: r.day_number,
      label: `D${String(r.day_number).padStart(2, "0")}`,
      quizAttemptPct:
        r.quiz_attempts === null || cohort === 0
          ? null
          : Math.round((r.quiz_attempts / cohort) * 100),
      quizPassPct:
        r.quiz_passed === null || r.quiz_attempts === null || r.quiz_attempts === 0
          ? null
          : Math.round((r.quiz_passed / r.quiz_attempts) * 100),
      submitPct:
        r.submitted === null || expected === 0
          ? null
          : Math.round((r.submitted / expected) * 100),
      quiz_attempts: r.quiz_attempts,
      quiz_passed: r.quiz_passed,
      submitted: r.submitted,
      cohort,
      expected,
    };
  });

  if (data.length === 0) return null;

  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 8, right: 8, bottom: 4, left: 0 }}
          barCategoryGap={10}
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
            domain={[0, 100]}
            tickFormatter={(v) => `${v}%`}
          />
          <Tooltip
            cursor={{ fill: chartColor.bgSoft, opacity: 0.5 }}
            content={
              <ChartTooltip
                rows={(payload) => {
                  const d = payload[0]?.payload as (typeof data)[number];
                  if (!d) return [];
                  return [
                    {
                      label: "Quiz attempt",
                      value:
                        d.quizAttemptPct === null
                          ? "no quiz"
                          : `${d.quizAttemptPct}%`,
                      color: chartColor.accent2,
                      hint:
                        d.quiz_attempts === null
                          ? undefined
                          : `${d.quiz_attempts}/${d.cohort}`,
                    },
                    {
                      label: "Quiz pass",
                      value:
                        d.quizPassPct === null
                          ? "—"
                          : `${d.quizPassPct}%`,
                      color: chartColor.ok,
                      hint:
                        d.quiz_passed === null
                          ? undefined
                          : `${d.quiz_passed}/${d.quiz_attempts}`,
                    },
                    {
                      label: "Submission",
                      value:
                        d.submitPct === null ? "no asg" : `${d.submitPct}%`,
                      color: chartColor.accent,
                      hint:
                        d.submitted === null
                          ? undefined
                          : `${d.submitted}/${d.expected}`,
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
            dataKey="quizAttemptPct"
            name="Quiz attempt %"
            fill={chartColor.accent2}
            radius={[3, 3, 0, 0]}
          />
          <Bar
            dataKey="quizPassPct"
            name="Quiz pass %"
            fill={chartColor.ok}
            radius={[3, 3, 0, 0]}
          />
          <Bar
            dataKey="submitPct"
            name="Submission %"
            fill={chartColor.accent}
            radius={[3, 3, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
