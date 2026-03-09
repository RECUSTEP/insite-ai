"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { css } from "styled-system/css";

type DailyUsageItem = { date: string; count: number };

type DashboardChartProps = {
  data: DailyUsageItem[];
};

export function DashboardChart({ data }: DashboardChartProps) {
  const chartData = data.map(({ date, count }) => ({
    date: date.slice(5),
    count,
    fullDate: date,
  }));

  return (
    <div
      className={css({
        w: "full",
        h: "320px",
        p: 4,
        borderRadius: "lg",
        border: "1px solid",
        borderColor: { base: "#E4E4E7", _dark: "#27272A" },
        bg: { base: "white", _dark: "#18181B" },
      })}
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E4E4E7" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 12 }}
            tickFormatter={(v) => v}
          />
          <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
          <Tooltip
            formatter={(value: number) => [value.toLocaleString(), "使用回数"]}
            labelFormatter={(_, payload) =>
              payload?.[0]?.payload?.fullDate ?? ""
            }
          />
          <Line
            type="monotone"
            dataKey="count"
            stroke="#3B82F6"
            strokeWidth={2}
            dot={{ r: 2 }}
            activeDot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
