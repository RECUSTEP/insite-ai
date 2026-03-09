"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { css } from "styled-system/css";

type UsageByFeatureItem = { feature: string; count: number };

const FEATURE_LABELS: Record<string, string> = {
  market: "市場分析",
  competitor: "競合分析",
  account: "アカウント分析",
  insight: "インサイト分析",
  improvement: "改善提案（画像あり）",
  "improvement-no-image": "改善提案（画像なし）",
  "feed-post": "フィード投稿",
  "reel-and-stories": "リール・ストーリーズ",
  profile: "プロフィール分析",
  "google-map": "Googleマップ（画像あり）",
  "google-map-no-image": "Googleマップ（画像なし）",
  "seo-article": "SEO記事生成",
  "seo-article-revise": "SEO記事修正",
  不明: "不明",
};

function getFeatureLabel(feature: string): string {
  return FEATURE_LABELS[feature] ?? feature;
}

type UsageByFeatureChartProps = {
  data: UsageByFeatureItem[];
};

export function UsageByFeatureChart({ data }: UsageByFeatureChartProps) {
  const chartData = data.map(({ feature, count }) => ({
    feature: getFeatureLabel(feature),
    count,
    rawFeature: feature,
  }));

  if (chartData.length === 0) {
    return (
      <div
        className={css({
          w: "full",
          minH: "200px",
          p: 4,
          borderRadius: "lg",
          border: "1px solid",
          borderColor: { base: "#E4E4E7", _dark: "#27272A" },
          bg: { base: "white", _dark: "#18181B" },
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "fg.muted",
        })}
      >
        今月のデータがありません
      </div>
    );
  }

  return (
    <div
      className={css({
        w: "full",
        h: { base: "auto", md: "320px" },
        minH: "200px",
        p: 4,
        borderRadius: "lg",
        border: "1px solid",
        borderColor: { base: "#E4E4E7", _dark: "#27272A" },
        bg: { base: "white", _dark: "#18181B" },
      })}
    >
      <ResponsiveContainer width="100%" height="100%" minHeight={200}>
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#E4E4E7" horizontal={false} />
          <XAxis type="number" tick={{ fontSize: 12 }} allowDecimals={false} />
          <YAxis
            type="category"
            dataKey="feature"
            width={180}
            tick={{ fontSize: 11 }}
            tickFormatter={(v) => (v.length > 20 ? `${v.slice(0, 18)}…` : v)}
          />
          <Tooltip
            formatter={(value: number) => [value.toLocaleString(), "使用回数"]}
          />
          <Bar dataKey="count" fill="#3B82F6" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
