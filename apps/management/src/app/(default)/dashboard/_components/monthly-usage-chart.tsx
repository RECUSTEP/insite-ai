"use client";

import { useState } from "react";
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
import { css } from "styled-system/css";
import { HStack, VStack } from "styled-system/jsx";

type MonthlyUsageItem = { month: string; count: number };

type Mode = "combo" | "line" | "bar";

type Props = {
  data: MonthlyUsageItem[];
};

function formatMonthLabel(month: string): string {
  // "2026-05" -> "5月"
  const [, m] = month.split("-");
  if (!m) return month;
  return `${Number(m)}月`;
}

function formatMonthFull(month: string): string {
  const [y, m] = month.split("-");
  if (!y || !m) return month;
  return `${y}年${Number(m)}月`;
}

export function MonthlyUsageChart({ data }: Props) {
  const [mode, setMode] = useState<Mode>("combo");

  const chartData = data.map((d) => ({
    monthShort: formatMonthLabel(d.month),
    monthFull: formatMonthFull(d.month),
    count: d.count,
  }));

  const total = chartData.reduce((sum, d) => sum + d.count, 0);
  const max = chartData.reduce((m, d) => Math.max(m, d.count), 0);
  const avg = chartData.length > 0 ? Math.round(total / chartData.length) : 0;
  const latest = chartData.at(-1)?.count ?? 0;
  const prev = chartData.at(-2)?.count ?? 0;
  const delta = latest - prev;
  const deltaPct = prev > 0 ? Math.round((delta / prev) * 1000) / 10 : null;

  if (chartData.length === 0) {
    return (
      <div
        className={css({
          w: "full",
          minH: "260px",
          p: 4,
          borderRadius: "xl",
          border: "1px solid",
          borderColor: { base: "#E4E4E7", _dark: "#27272A" },
          bg: { base: "white", _dark: "#18181B" },
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "fg.muted",
        })}
      >
        データがありません
      </div>
    );
  }

  return (
    <div
      className={css({
        w: "full",
        p: 4,
        borderRadius: "xl",
        border: "1px solid",
        borderColor: { base: "#E4E4E7", _dark: "#27272A" },
        bg: { base: "white", _dark: "#18181B" },
        boxShadow: "0 1px 2px rgba(16,24,40,0.04)",
      })}
    >
      <VStack gap={4} alignItems="stretch">
        <HStack justify="space-between" alignItems="center" flexWrap="wrap" gap={3}>
          <HStack gap={4} flexWrap="wrap">
            <Metric label="累計" value={total} />
            <Metric label="月平均" value={avg} />
            <Metric label="最大" value={max} />
            <DeltaMetric label="前月比" delta={delta} pct={deltaPct} />
          </HStack>
          <ModeSwitcher mode={mode} onChange={setMode} />
        </HStack>

        <div className={css({ w: "full", h: { base: "260px", md: "320px" } })}>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={chartData}
              margin={{ top: 10, right: 24, left: 0, bottom: 5 }}
              barCategoryGap="25%"
            >
              <defs>
                <linearGradient id="barFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#7C3AED" stopOpacity={0.85} />
                  <stop offset="100%" stopColor="#7C3AED" stopOpacity={0.45} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E4E4E7" vertical={false} />
              <XAxis
                dataKey="monthShort"
                tick={{ fontSize: 12 }}
                axisLine={{ stroke: "#E4E4E7" }}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 12 }}
                allowDecimals={false}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                cursor={{ fill: "rgba(124,58,237,0.06)" }}
                contentStyle={{
                  borderRadius: 8,
                  border: "1px solid #E4E4E7",
                  fontSize: 12,
                }}
                formatter={(value: number) => [value.toLocaleString(), "使用回数"]}
                labelFormatter={(_, payload) =>
                  payload?.[0]?.payload?.monthFull ?? ""
                }
              />
              <Legend
                verticalAlign="top"
                align="right"
                height={28}
                iconType="circle"
                wrapperStyle={{ fontSize: 12 }}
              />
              {(mode === "combo" || mode === "bar") && (
                <Bar
                  dataKey="count"
                  name="月次（棒）"
                  fill="url(#barFill)"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={48}
                />
              )}
              {(mode === "combo" || mode === "line") && (
                <Line
                  type="monotone"
                  dataKey="count"
                  name="推移（折れ線）"
                  stroke="#2563EB"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: "#2563EB", strokeWidth: 0 }}
                  activeDot={{ r: 5 }}
                />
              )}
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </VStack>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <VStack gap={0.5} alignItems="flex-start">
      <span className={css({ fontSize: "xs", color: "fg.muted" })}>{label}</span>
      <span
        className={css({
          fontSize: "lg",
          fontWeight: "bold",
          fontVariantNumeric: "tabular-nums",
        })}
      >
        {value.toLocaleString()}
      </span>
    </VStack>
  );
}

function DeltaMetric({
  label,
  delta,
  pct,
}: {
  label: string;
  delta: number;
  pct: number | null;
}) {
  const up = delta > 0;
  const down = delta < 0;
  const color = up ? "#059669" : down ? "#DC2626" : "#71717A";
  const sign = up ? "+" : "";
  return (
    <VStack gap={0.5} alignItems="flex-start">
      <span className={css({ fontSize: "xs", color: "fg.muted" })}>{label}</span>
      <HStack gap={1} alignItems="baseline">
        <span
          className={css({
            fontSize: "lg",
            fontWeight: "bold",
            fontVariantNumeric: "tabular-nums",
          })}
          style={{ color }}
        >
          {sign}
          {delta.toLocaleString()}
        </span>
        {pct !== null ? (
          <span className={css({ fontSize: "xs" })} style={{ color }}>
            ({sign}
            {pct}%)
          </span>
        ) : null}
      </HStack>
    </VStack>
  );
}

function ModeSwitcher({
  mode,
  onChange,
}: {
  mode: Mode;
  onChange: (m: Mode) => void;
}) {
  const options: { value: Mode; label: string }[] = [
    { value: "combo", label: "重ねて比較" },
    { value: "line", label: "折れ線のみ" },
    { value: "bar", label: "棒のみ" },
  ];
  return (
    <div
      className={css({
        display: "inline-flex",
        p: "2px",
        borderRadius: "lg",
        border: "1px solid",
        borderColor: { base: "#E4E4E7", _dark: "#27272A" },
        bg: { base: "#F4F4F5", _dark: "#0A0A0A" },
      })}
    >
      {options.map((opt) => {
        const isActive = mode === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={css({
              px: 3,
              py: 1,
              fontSize: "xs",
              fontWeight: "medium",
              borderRadius: "md",
              border: "none",
              cursor: "pointer",
              transition: "background 120ms ease, color 120ms ease",
            })}
            style={{
              background: isActive ? "white" : "transparent",
              color: isActive ? "#18181B" : "#71717A",
              boxShadow: isActive ? "0 1px 2px rgba(16,24,40,0.06)" : undefined,
            }}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
