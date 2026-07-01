"use client";

import { toaster } from "@/app/_components/toast";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Text } from "@/components/ui/text";
import {
  BarChart3Icon,
  ChevronDownIcon,
  ChevronUpIcon,
  ExternalLinkIcon,
  InstagramIcon,
  LinkIcon,
  MessageCircleIcon,
  RefreshCwIcon,
  UnlinkIcon,
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { css } from "styled-system/css";
import { Box, HStack, VStack } from "styled-system/jsx";

type Props = {
  metaSocialChatEnabled: boolean;
  metaAccountLinkEnabled: boolean;
};

type ConnectedAccount = {
  connected: boolean;
  account?: {
    instagramUserId: string;
    instagramUsername: string | null;
    connectedAt: number;
  };
};

type ProfileData = {
  username?: string;
  name?: string;
  biography?: string;
  followersCount?: number;
  followsCount?: number;
  mediaCount?: number;
  profilePictureUrl?: string;
};

type InsightMetric = {
  name: string;
  period: string;
  values: Array<{ value: number; endTime?: string }>;
};

type MediaItem = {
  id: string;
  caption?: string;
  mediaType: string;
  mediaUrl?: string;
  thumbnailUrl?: string;
  timestamp: string;
  likeCount?: number;
  commentsCount?: number;
  permalink: string;
  insights?: Record<string, number>;
  insightError?: string;
};

type MediaInsights = {
  mediaId: string;
  insights: Record<string, number>;
};

type InsightPeriod = "day" | "week" | "days_28";
type InsightSourceTab = "instagram" | "threads";

type ChartPoint = {
  label: string;
  value: number;
};

type SummaryItem = {
  label: string;
  value: number;
  previous: number;
  unit?: string;
};

const PERIOD_OPTIONS: Array<{ value: InsightPeriod; label: string; days: number }> = [
  { value: "day", label: "日次", days: 30 },
  { value: "week", label: "週次", days: 84 },
  { value: "days_28", label: "28日", days: 180 },
];
const DEFAULT_PERIOD_OPTION = PERIOD_OPTIONS[0] ?? { value: "day", label: "日次", days: 30 };

const METRIC_LABELS = new Map([
  ["views", "表示回数"],
  ["impressions", "インプレッション"],
  ["reach", "リーチ"],
  ["profile_views", "プロフィール表示"],
  ["saved", "保存"],
  ["likes", "いいね"],
  ["comments", "コメント"],
  ["shares", "シェア"],
  ["plays", "再生"],
  ["total_interactions", "合計反応"],
]);

const cardStyle = css({
  rounded: "lg",
  border: "1px solid",
  borderColor: { base: "#E4E4E7", _dark: "#3F3F46" },
  bg: "bg.card",
  p: 4,
});

const statStyle = css({
  textAlign: "center",
  p: 3,
  rounded: "md",
  bg: { base: "#F4F4F5", _dark: "#27272A" },
  flex: 1,
  minW: 0,
});

const periodButtonStyle = css({
  px: 3,
  py: 1.5,
  rounded: "md",
  border: "1px solid",
  fontSize: "sm",
  fontWeight: 600,
  cursor: "pointer",
});

async function fetchJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, init);
  const data = (await response.json().catch(() => ({}))) as { error?: string };
  if (!response.ok) {
    throw new Error(data.error ?? "Meta API の取得に失敗しました");
  }
  return data as T;
}

function formatNumber(value: number | undefined) {
  return (value ?? 0).toLocaleString("ja-JP");
}

function metricValue(metrics: InsightMetric[], name: string) {
  return metrics.find((metric) => metric.name === name)?.values.at(-1)?.value ?? 0;
}

function metricPreviousValue(metrics: InsightMetric[], name: string) {
  return metrics.find((metric) => metric.name === name)?.values.at(-2)?.value ?? 0;
}

function metricValueAny(metrics: InsightMetric[], names: string[]) {
  for (const name of names) {
    const value = metricValue(metrics, name);
    if (value) {
      return value;
    }
  }
  return 0;
}

function metricPreviousValueAny(metrics: InsightMetric[], names: string[]) {
  for (const name of names) {
    const value = metricPreviousValue(metrics, name);
    if (value) {
      return value;
    }
  }
  return 0;
}

function metricLabel(name: string) {
  return METRIC_LABELS.get(name) ?? name;
}

function comparisonRate(current: number, previous: number) {
  if (!previous) {
    return null;
  }
  return Math.round(((current - previous) / previous) * 100);
}

function formatDateLabel(value?: string) {
  if (!value) {
    return "";
  }
  return new Date(value).toLocaleDateString("ja-JP", { month: "numeric", day: "numeric" });
}

function buildChartPoints(metrics: InsightMetric[], name: string): ChartPoint[] {
  const metric = metrics.find((item) => item.name === name);
  return (
    metric?.values.map((item, index) => ({
      label: formatDateLabel(item.endTime) || String(index + 1),
      value: item.value ?? 0,
    })) ?? []
  );
}

function periodRange(period: InsightPeriod) {
  const option = PERIOD_OPTIONS.find((item) => item.value === period) ?? DEFAULT_PERIOD_OPTION;
  const until = Math.floor(Date.now() / 1000);
  const since = until - option.days * 24 * 60 * 60;
  return { since, until };
}

function mediaLabel(mediaType: string) {
  if (mediaType === "VIDEO" || mediaType === "REEL") {
    return "動画";
  }
  if (mediaType === "CAROUSEL_ALBUM") {
    return "カルーセル";
  }
  return "画像";
}

function normalizeMediaItem(item: Record<string, unknown>): MediaItem {
  const insights: Record<string, number> | undefined =
    item.insights && typeof item.insights === "object"
      ? Object.entries(item.insights as Record<string, unknown>).reduce<Record<string, number>>(
          (acc, [key, value]) => {
            if (typeof value === "number") {
              acc[key] = value;
            }
            return acc;
          },
          {},
        )
      : undefined;

  return {
    id: String(item.id ?? ""),
    caption: typeof item.caption === "string" ? item.caption : undefined,
    mediaType: typeof item.media_type === "string" ? item.media_type : "IMAGE",
    mediaUrl: typeof item.media_url === "string" ? item.media_url : undefined,
    thumbnailUrl: typeof item.thumbnail_url === "string" ? item.thumbnail_url : undefined,
    timestamp: typeof item.timestamp === "string" ? item.timestamp : "",
    likeCount: typeof item.like_count === "number" ? item.like_count : undefined,
    commentsCount: typeof item.comments_count === "number" ? item.comments_count : undefined,
    permalink: typeof item.permalink === "string" ? item.permalink : "#",
    insights,
    insightError: typeof item.insight_error === "string" ? item.insight_error : undefined,
  };
}

function mediaInsightValue(item: MediaItem, names: string[]) {
  for (const name of names) {
    const value = item.insights?.[name];
    if (typeof value === "number") {
      return value;
    }
  }
  return 0;
}

function mediaReach(item: MediaItem) {
  return mediaInsightValue(item, ["reach"]);
}

function mediaViews(item: MediaItem) {
  return mediaInsightValue(item, ["views", "impressions", "plays"]);
}

function mediaSaved(item: MediaItem) {
  return mediaInsightValue(item, ["saved"]);
}

function mediaShares(item: MediaItem) {
  return mediaInsightValue(item, ["shares"]);
}

function mediaEngagementScore(item: MediaItem) {
  const totalInteractions = mediaInsightValue(item, ["total_interactions"]);
  if (totalInteractions > 0) {
    return totalInteractions;
  }
  return (
    (item.likeCount ?? mediaInsightValue(item, ["likes"])) +
    (item.commentsCount ?? mediaInsightValue(item, ["comments"])) +
    mediaSaved(item) +
    mediaShares(item)
  );
}

function postQualityLabel(score: number, average: number) {
  if (average <= 0) {
    return "データ蓄積中";
  }
  if (score >= average * 1.25) {
    return "良い投稿";
  }
  if (score <= average * 0.65) {
    return "改善余地";
  }
  return "平均的";
}

function trendSummary(summary: SummaryItem[]) {
  const reach = summary.find((item) => item.label === "リーチ");
  const profileViews = summary.find((item) => item.label === "プロフィール表示");
  const views = summary.find((item) => item.label === "表示回数");
  const messages: string[] = [];

  for (const item of [reach, views, profileViews]) {
    if (!item) {
      continue;
    }
    const rate = comparisonRate(item.value, item.previous);
    if (rate === null) {
      continue;
    }
    if (rate > 0) {
      messages.push(`${item.label}は前期間比で${rate}%伸びています。`);
    } else if (rate < 0) {
      messages.push(`${item.label}は前期間比で${Math.abs(rate)}%下がっています。`);
    }
  }

  if (messages.length === 0) {
    return "インサイトデータが蓄積されると、前期間比の変化をここに表示します。";
  }
  return messages.slice(0, 2).join("");
}

function MiniLineChart({ points, color = "#2F80ED" }: { points: ChartPoint[]; color?: string }) {
  if (points.length < 2) {
    return (
      <Box
        className={css({
          display: "grid",
          placeItems: "center",
          h: 36,
          rounded: "md",
          bg: { base: "#FAFAFA", _dark: "#1C1C1E" },
        })}
      >
        <Text size="sm" className={css({ color: "text.secondary" })}>
          推移データがまだ不足しています
        </Text>
      </Box>
    );
  }

  const width = 640;
  const height = 180;
  const padding = 24;
  const max = Math.max(...points.map((point) => point.value), 1);
  const min = Math.min(...points.map((point) => point.value), 0);
  const range = Math.max(max - min, 1);
  const step = (width - padding * 2) / Math.max(points.length - 1, 1);
  const coords = points.map((point, index) => {
    const x = padding + index * step;
    const y = height - padding - ((point.value - min) / range) * (height - padding * 2);
    return { ...point, x, y };
  });
  const line = coords.map((point) => `${point.x},${point.y}`).join(" ");

  return (
    <Box className={css({ overflowX: "auto" })}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label="インサイト推移グラフ"
        className={css({ width: "100%", minW: 96, h: 44 })}
      >
        <title>インサイト推移グラフ</title>
        <line
          x1={padding}
          y1={height - padding}
          x2={width - padding}
          y2={height - padding}
          stroke="#D4D4D8"
        />
        <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="#D4D4D8" />
        <polyline
          fill="none"
          stroke={color}
          strokeWidth="4"
          strokeLinejoin="round"
          strokeLinecap="round"
          points={line}
        />
        {coords.map((point, index) => (
          <g key={`${point.label}-${index}`}>
            <circle cx={point.x} cy={point.y} r="4" fill={color} />
            {(index === 0 || index === coords.length - 1) && (
              <>
                <text
                  x={point.x}
                  y={height - 6}
                  textAnchor={index === 0 ? "start" : "end"}
                  fill="#71717A"
                  fontSize="12"
                >
                  {point.label}
                </text>
                <text
                  x={point.x}
                  y={Math.max(point.y - 10, 14)}
                  textAnchor={index === 0 ? "start" : "end"}
                  fill="#3F3F46"
                  fontSize="12"
                >
                  {formatNumber(point.value)}
                </text>
              </>
            )}
          </g>
        ))}
      </svg>
    </Box>
  );
}

function SummaryCard({ item }: { item: SummaryItem }) {
  const rate = comparisonRate(item.value, item.previous);
  const positive = rate !== null && rate >= 0;

  return (
    <Box className={statStyle}>
      <Text size="lg" fontWeight={700}>
        {formatNumber(item.value)}
        {item.unit ?? ""}
      </Text>
      <Text size="xs" className={css({ color: "text.secondary" })}>
        {item.label}
      </Text>
      <HStack justify="center" gap={1} mt={1}>
        {rate === null ? (
          <Text size="xs" className={css({ color: "text.secondary" })}>
            前期間データなし
          </Text>
        ) : (
          <>
            {positive ? <ChevronUpIcon size={13} /> : <ChevronDownIcon size={13} />}
            <Text size="xs" className={css({ color: positive ? "#16A34A" : "#DC2626" })}>
              前期間比 {positive ? "+" : ""}
              {rate}%
            </Text>
          </>
        )}
      </HStack>
    </Box>
  );
}

function InsightSourceTabs({
  active,
  onChange,
}: {
  active: InsightSourceTab;
  onChange: (tab: InsightSourceTab) => void;
}) {
  const items: Array<{ value: InsightSourceTab; label: string }> = [
    { value: "instagram", label: "Instagram" },
    { value: "threads", label: "Threads" },
  ];

  return (
    <HStack
      gap={1}
      p={1}
      alignSelf="flex-start"
      className={css({
        rounded: "md",
        border: "1px solid",
        borderColor: { base: "#E4E4E7", _dark: "#3F3F46" },
        bg: { base: "#FAFAFA", _dark: "#1C1C1E" },
      })}
    >
      {items.map((item) => (
        <button
          key={item.value}
          type="button"
          onClick={() => onChange(item.value)}
          className={css({
            px: 4,
            py: 2,
            rounded: "sm",
            fontSize: "sm",
            fontWeight: 700,
            cursor: "pointer",
            color: active === item.value ? "white" : "text.secondary",
            bg: active === item.value ? "#18181B" : "transparent",
          })}
        >
          {item.label}
        </button>
      ))}
    </HStack>
  );
}

export function MetaInsightPanel({ metaSocialChatEnabled, metaAccountLinkEnabled }: Props) {
  const searchParams = useSearchParams();
  const [account, setAccount] = useState<ConnectedAccount | null>(null);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [profileInsights, setProfileInsights] = useState<InsightMetric[]>([]);
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [selectedMediaId, setSelectedMediaId] = useState<string>("");
  const [mediaInsights, setMediaInsights] = useState<MediaInsights | null>(null);
  const [period, setPeriod] = useState<InsightPeriod>("day");
  const [activeInsightTab, setActiveInsightTab] = useState<InsightSourceTab>("instagram");
  const [activeMetric, setActiveMetric] = useState("reach");
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [insightLoading, setInsightLoading] = useState(false);

  const selectedMedia = useMemo(
    () => media.find((item) => item.id === selectedMediaId) ?? null,
    [media, selectedMediaId],
  );

  const profileSummary = useMemo<SummaryItem[]>(
    () => [
      {
        label: "表示回数",
        value: metricValueAny(profileInsights, ["views", "impressions"]),
        previous: metricPreviousValueAny(profileInsights, ["views", "impressions"]),
      },
      {
        label: "リーチ",
        value: metricValue(profileInsights, "reach"),
        previous: metricPreviousValue(profileInsights, "reach"),
      },
      {
        label: "プロフィール表示",
        value: metricValue(profileInsights, "profile_views"),
        previous: metricPreviousValue(profileInsights, "profile_views"),
      },
    ],
    [profileInsights],
  );

  const chartPoints = useMemo(
    () => buildChartPoints(profileInsights, activeMetric),
    [profileInsights, activeMetric],
  );

  const rankedMedia = useMemo(
    () =>
      [...media]
        .map((item) => ({
          ...item,
          engagementScore: mediaEngagementScore(item),
          reach: mediaReach(item),
          views: mediaViews(item),
          saved: mediaSaved(item),
          shares: mediaShares(item),
        }))
        .sort((a, b) => b.engagementScore - a.engagementScore),
    [media],
  );

  const averageMediaScore = useMemo(() => {
    if (rankedMedia.length === 0) {
      return 0;
    }
    return rankedMedia.reduce((sum, item) => sum + item.engagementScore, 0) / rankedMedia.length;
  }, [rankedMedia]);

  const mediaAnalysisSummary = useMemo(() => {
    if (rankedMedia.length === 0) {
      return "投稿別インサイトが取得できると、反応が良い投稿と改善余地がある投稿をここに表示します。";
    }

    const top = rankedMedia[0];
    const bottom = rankedMedia.at(-1);
    const topTitle = top?.caption?.slice(0, 30) || "キャプションなし";
    const messages = [
      `反応が最も高い投稿は「${topTitle}」です。合計反応、保存、シェア、リーチを基準に上位表示しています。`,
    ];

    if (bottom && bottom.id !== top?.id && averageMediaScore > 0) {
      const bottomTitle = bottom.caption?.slice(0, 30) || "キャプションなし";
      messages.push(
        `改善余地がある投稿は「${bottomTitle}」です。上位投稿との差分を見て、訴求軸や投稿形式を見直せます。`,
      );
    }

    return messages.join("");
  }, [rankedMedia, averageMediaScore]);

  const loadInstagramData = useCallback(async () => {
    setLoading(true);
    try {
      const accountData = await fetchJson<ConnectedAccount>("/api/meta/account");
      setAccount(accountData);

      if (!accountData.connected) {
        setProfile(null);
        setProfileInsights([]);
        setMedia([]);
        setSelectedMediaId("");
        setMediaInsights(null);
        return;
      }

      const { since, until } = periodRange(period);
      const [profileData, profileInsightData, mediaData] = await Promise.all([
        fetchJson<ProfileData>("/api/meta-insights/profile"),
        fetchJson<{ insights: InsightMetric[] }>(
          `/api/meta-insights/profile-insights?period=${period}&since=${since}&until=${until}`,
        ),
        fetchJson<{ media: Record<string, unknown>[] }>(
          "/api/meta-insights/media?limit=25&includeInsights=true",
        ),
      ]);
      const normalizedMedia = mediaData.media.map(normalizeMediaItem).filter((item) => item.id);

      setProfile(profileData);
      setProfileInsights(profileInsightData.insights);
      setMedia(normalizedMedia);
      setSelectedMediaId((current) => current || normalizedMedia[0]?.id || "");
      setMediaInsights(null);
    } catch (e) {
      const message = e instanceof Error ? e.message : "Meta インサイトの取得に失敗しました";
      toaster.error({ title: "エラー", description: message });
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    loadInstagramData();
  }, [loadInstagramData]);

  useEffect(() => {
    const connected = searchParams.get("meta_connected");
    const error = searchParams.get("meta_error");
    const instagramConnected = searchParams.get("instagram_connected");
    const instagramError = searchParams.get("instagram_error");
    if (connected === "true") {
      toaster.success({
        title: "Meta 連携完了",
        description: "Instagram アカウントを接続しました。",
      });
    }
    if (error) {
      toaster.error({ title: "Meta 連携エラー", description: error });
    }
    if (instagramConnected === "true") {
      toaster.success({
        title: "Instagram 連携完了",
        description: "Instagram アカウントを接続しました。",
      });
    }
    if (instagramError) {
      toaster.error({ title: "Instagram 連携エラー", description: instagramError });
    }
  }, [searchParams]);

  useEffect(() => {
    if (!selectedMediaId) {
      return;
    }

    const selected = media.find((item) => item.id === selectedMediaId);
    if (selected?.insights && Object.keys(selected.insights).length > 0) {
      setMediaInsights({ mediaId: selectedMediaId, insights: selected.insights });
      return;
    }

    const loadMediaInsights = async () => {
      setInsightLoading(true);
      try {
        const data = await fetchJson<MediaInsights>(`/api/meta-insights/media/${selectedMediaId}`);
        setMediaInsights(data);
      } catch (e) {
        const message = e instanceof Error ? e.message : "投稿インサイトの取得に失敗しました";
        setMediaInsights(null);
        toaster.error({ title: "エラー", description: message });
      } finally {
        setInsightLoading(false);
      }
    };

    loadMediaInsights();
  }, [selectedMediaId, media]);

  const connectInstagram = async () => {
    setConnecting(true);
    try {
      const data = await fetchJson<{ authUrl: string }>("/api/instagram/auth");
      window.location.href = data.authUrl;
    } catch (e) {
      const message = e instanceof Error ? e.message : "Instagram 認可 URL の取得に失敗しました";
      toaster.error({ title: "エラー", description: message });
      setConnecting(false);
    }
  };

  const disconnectInstagram = async () => {
    if (!window.confirm("Instagram アカウント連携を解除しますか？")) {
      return;
    }
    setLoading(true);
    try {
      await fetchJson<{ ok: true }>("/api/meta/account", { method: "DELETE" });
      toaster.success({
        title: "連携解除",
        description: "Instagram アカウント連携を解除しました。",
      });
      await loadInstagramData();
    } catch (e) {
      const message = e instanceof Error ? e.message : "Meta 連携解除に失敗しました";
      toaster.error({ title: "エラー", description: message });
      setLoading(false);
    }
  };

  if (loading && account === null) {
    return (
      <Box className={cardStyle}>
        <HStack gap={3}>
          <Spinner />
          <Text size="sm">Meta 連携状態を確認しています</Text>
        </HStack>
      </Box>
    );
  }

  if (!metaAccountLinkEnabled) {
    return (
      <Box className={cardStyle}>
        <Text size="sm" fontWeight={600}>
          Meta アカウント連携が無効です
        </Text>
        <Text size="sm" className={css({ mt: 2, color: "text.secondary" })}>
          管理画面のアプリケーション設定で Meta アカウント連携を有効化してください。
        </Text>
      </Box>
    );
  }

  if (!account?.connected) {
    return (
      <VStack gap={4} alignItems="stretch">
        <Box className={cardStyle}>
          <HStack gap={3} alignItems="flex-start">
            <InstagramIcon className={css({ width: 22, height: 22, mt: 0.5 })} />
            <Box flex={1}>
              <Text size="sm" fontWeight={600}>
                Instagram ビジネスアカウントを連携
              </Text>
              <Text size="sm" className={css({ mt: 2, color: "text.secondary" })}>
                Instagramログインでプロアカウントのプロフィール、投稿、投稿別インサイトを取得します。
              </Text>
              <Button mt={4} onClick={connectInstagram} loading={connecting}>
                <LinkIcon />
                Instagram と連携
              </Button>
            </Box>
          </HStack>
        </Box>
        <ThreadsNotice metaSocialChatEnabled={metaSocialChatEnabled} />
      </VStack>
    );
  }

  return (
    <VStack gap={6} alignItems="stretch">
      <InsightSourceTabs active={activeInsightTab} onChange={setActiveInsightTab} />
      {activeInsightTab === "threads" ? (
        <ThreadsNotice metaSocialChatEnabled={metaSocialChatEnabled} />
      ) : (
        <>
          <Box className={cardStyle}>
            <HStack justify="space-between" gap={4} flexWrap="wrap">
              <HStack gap={3}>
                <InstagramIcon className={css({ width: 24, height: 24 })} />
                <Box>
                  <Text size="sm" fontWeight={600}>
                    @{profile?.username ?? account.account?.instagramUsername ?? "instagram"}
                  </Text>
                  <Text size="xs" className={css({ color: "text.secondary" })}>
                    Instagram ビジネスアカウント
                  </Text>
                </Box>
              </HStack>
              <HStack gap={2}>
                <Button size="sm" variant="outline" onClick={loadInstagramData} loading={loading}>
                  <RefreshCwIcon />
                  更新
                </Button>
                <Button size="sm" variant="outline" onClick={disconnectInstagram}>
                  <UnlinkIcon />
                  解除
                </Button>
              </HStack>
            </HStack>

            <HStack gap={3} mt={4} flexWrap="wrap">
              <Box className={statStyle}>
                <Text size="lg" fontWeight={700}>
                  {formatNumber(profile?.followersCount)}
                </Text>
                <Text size="xs" className={css({ color: "text.secondary" })}>
                  フォロワー
                </Text>
              </Box>
              <Box className={statStyle}>
                <Text size="lg" fontWeight={700}>
                  {formatNumber(profile?.followsCount)}
                </Text>
                <Text size="xs" className={css({ color: "text.secondary" })}>
                  フォロー中
                </Text>
              </Box>
              <Box className={statStyle}>
                <Text size="lg" fontWeight={700}>
                  {formatNumber(profile?.mediaCount)}
                </Text>
                <Text size="xs" className={css({ color: "text.secondary" })}>
                  投稿数
                </Text>
              </Box>
            </HStack>
          </Box>

          <Box className={cardStyle}>
            <HStack justify="space-between" gap={3} mb={4} flexWrap="wrap">
              <HStack gap={2}>
                <BarChart3Icon className={css({ width: 18, height: 18 })} />
                <Text size="sm" fontWeight={600}>
                  プロフィールインサイト
                </Text>
              </HStack>
              <HStack gap={2} flexWrap="wrap">
                {PERIOD_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setPeriod(option.value)}
                    className={periodButtonStyle}
                    style={{
                      color: period === option.value ? "white" : "#3f3f46",
                      background: period === option.value ? "#2F80ED" : "transparent",
                      borderColor: period === option.value ? "#2F80ED" : "#D4D4D8",
                    }}
                  >
                    {option.label}
                  </button>
                ))}
              </HStack>
            </HStack>
            <HStack gap={3} flexWrap="wrap">
              {profileSummary.map((item) => (
                <SummaryCard key={item.label} item={item} />
              ))}
            </HStack>

            <Box mt={5}>
              <HStack gap={2} mb={3} flexWrap="wrap">
                {["reach", "views", "impressions", "profile_views"].map((metric) => (
                  <button
                    key={metric}
                    type="button"
                    onClick={() => setActiveMetric(metric)}
                    className={periodButtonStyle}
                    style={{
                      color: activeMetric === metric ? "white" : "#3f3f46",
                      background: activeMetric === metric ? "#18181B" : "transparent",
                      borderColor: activeMetric === metric ? "#18181B" : "#D4D4D8",
                    }}
                  >
                    {metricLabel(metric)}
                  </button>
                ))}
              </HStack>
              <MiniLineChart points={chartPoints} />
            </Box>

            <Box
              mt={5}
              className={css({
                rounded: "md",
                bg: { base: "#EFF6FF", _dark: "#172033" },
                border: "1px solid",
                borderColor: { base: "#BFDBFE", _dark: "#1D4ED8" },
                p: 3,
              })}
            >
              <Text size="sm" fontWeight={600}>
                自動分析メモ
              </Text>
              <Text size="sm" className={css({ mt: 1, color: "text.secondary" })}>
                {trendSummary(profileSummary)}
                {` ${mediaAnalysisSummary}`}
              </Text>
            </Box>
          </Box>

          <Box className={cardStyle}>
            <HStack justify="space-between" gap={4} mb={3} flexWrap="wrap">
              <Text size="sm" fontWeight={600}>
                投稿ランキング
              </Text>
              <Text size="xs" className={css({ color: "text.secondary" })}>
                直近25件 / 投稿別インサイトの合計反応順
              </Text>
            </HStack>
            {rankedMedia.length === 0 ? (
              <Text size="sm" className={css({ color: "text.secondary" })}>
                ランキング対象の投稿がありません。
              </Text>
            ) : (
              <VStack gap={2} alignItems="stretch">
                {rankedMedia.slice(0, 5).map((item, index) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelectedMediaId(item.id)}
                    className={css({
                      display: "grid",
                      gridTemplateColumns: "auto 1fr auto",
                      alignItems: "center",
                      gap: 3,
                      width: "100%",
                      textAlign: "left",
                      p: 3,
                      rounded: "md",
                      border: "1px solid",
                      borderColor:
                        selectedMediaId === item.id
                          ? "accent.default"
                          : { base: "#E4E4E7", _dark: "#3F3F46" },
                      bg:
                        selectedMediaId === item.id
                          ? "bg.subtle"
                          : { base: "#FAFAFA", _dark: "#1C1C1E" },
                      cursor: "pointer",
                    })}
                  >
                    <Text fontWeight={700} className={css({ color: "accent.default" })}>
                      #{index + 1}
                    </Text>
                    <Box minW={0}>
                      <Text
                        size="sm"
                        className={css({
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        })}
                      >
                        {item.caption?.slice(0, 80) || "(キャプションなし)"}
                      </Text>
                      <Text size="xs" className={css({ color: "text.secondary" })}>
                        {mediaLabel(item.mediaType)} /{" "}
                        {new Date(item.timestamp).toLocaleDateString("ja-JP")}
                      </Text>
                      <HStack gap={2} mt={1} flexWrap="wrap">
                        <Text size="xs" className={css({ color: "text.secondary" })}>
                          リーチ {formatNumber(item.reach)}
                        </Text>
                        <Text size="xs" className={css({ color: "text.secondary" })}>
                          表示 {formatNumber(item.views)}
                        </Text>
                        <Text size="xs" className={css({ color: "text.secondary" })}>
                          保存 {formatNumber(item.saved)}
                        </Text>
                        <Text size="xs" className={css({ color: "text.secondary" })}>
                          シェア {formatNumber(item.shares)}
                        </Text>
                      </HStack>
                      {item.insightError && (
                        <Text size="xs" className={css({ mt: 1, color: "#DC2626" })}>
                          一部指標を取得できませんでした
                        </Text>
                      )}
                    </Box>
                    <VStack gap={0} alignItems="flex-end">
                      <Text size="sm" fontWeight={700}>
                        {formatNumber(item.engagementScore)}
                      </Text>
                      <Text size="xs" className={css({ color: "text.secondary" })}>
                        反応
                      </Text>
                      <Text size="xs" className={css({ color: "text.secondary" })}>
                        {postQualityLabel(item.engagementScore, averageMediaScore)}
                      </Text>
                    </VStack>
                  </button>
                ))}
              </VStack>
            )}
          </Box>

          <Box className={cardStyle}>
            <HStack justify="space-between" gap={4} mb={3}>
              <Text size="sm" fontWeight={600}>
                最新投稿
              </Text>
              <Text size="xs" className={css({ color: "text.secondary" })}>
                クリックで投稿別インサイトを表示
              </Text>
            </HStack>
            {media.length === 0 ? (
              <Text size="sm" className={css({ color: "text.secondary" })}>
                取得できる投稿がありません。
              </Text>
            ) : (
              <VStack gap={2} alignItems="stretch">
                {media.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelectedMediaId(item.id)}
                    className={css({
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 3,
                      width: "100%",
                      textAlign: "left",
                      p: 3,
                      rounded: "md",
                      border: "1px solid",
                      borderColor: selectedMediaId === item.id ? "accent.default" : "transparent",
                      bg:
                        selectedMediaId === item.id
                          ? "bg.subtle"
                          : { base: "#FAFAFA", _dark: "#1C1C1E" },
                      cursor: "pointer",
                    })}
                  >
                    <Box flex={1} minW={0}>
                      <Text
                        size="sm"
                        className={css({
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        })}
                      >
                        {item.caption?.slice(0, 80) || "(キャプションなし)"}
                      </Text>
                      <Text size="xs" className={css({ color: "text.secondary" })}>
                        {mediaLabel(item.mediaType)} /{" "}
                        {new Date(item.timestamp).toLocaleDateString("ja-JP")}
                      </Text>
                      <Text size="xs" className={css({ mt: 1, color: "text.secondary" })}>
                        リーチ {formatNumber(mediaReach(item))} / 表示{" "}
                        {formatNumber(mediaViews(item))} / 保存 {formatNumber(mediaSaved(item))}
                      </Text>
                    </Box>
                    <HStack gap={3} flexShrink={0}>
                      <Text size="xs">{formatNumber(item.likeCount)}</Text>
                      <Text size="xs">{formatNumber(item.commentsCount)}</Text>
                      <ExternalLinkIcon className={css({ width: 14, height: 14 })} />
                    </HStack>
                  </button>
                ))}
              </VStack>
            )}
          </Box>

          {selectedMedia && (
            <Box className={cardStyle}>
              <HStack justify="space-between" gap={4} mb={3}>
                <Text size="sm" fontWeight={600}>
                  投稿別インサイト
                </Text>
                <a
                  href={selectedMedia.permalink}
                  target="_blank"
                  rel="noreferrer"
                  className={css({ color: "accent.default", fontSize: "sm" })}
                >
                  Instagramで開く
                </a>
              </HStack>
              {insightLoading ? (
                <HStack gap={3}>
                  <Spinner />
                  <Text size="sm">投稿インサイトを取得しています</Text>
                </HStack>
              ) : Object.entries(mediaInsights?.insights ?? {}).length === 0 ? (
                <Text size="sm" className={css({ color: "text.secondary" })}>
                  この投稿で取得できるインサイトがありません。
                </Text>
              ) : (
                <HStack gap={3} flexWrap="wrap">
                  {Object.entries(mediaInsights?.insights ?? {}).map(([name, value]) => (
                    <Box key={name} className={statStyle}>
                      <Text size="md" fontWeight={700}>
                        {formatNumber(value)}
                      </Text>
                      <Text size="xs" className={css({ color: "text.secondary" })}>
                        {metricLabel(name)}
                      </Text>
                    </Box>
                  ))}
                </HStack>
              )}
            </Box>
          )}
        </>
      )}
    </VStack>
  );
}

function ThreadsNotice({ metaSocialChatEnabled }: { metaSocialChatEnabled: boolean }) {
  return (
    <Box className={cardStyle}>
      <HStack gap={3} alignItems="flex-start">
        <MessageCircleIcon className={css({ width: 20, height: 20, mt: 0.5 })} />
        <Box>
          <Text size="sm" fontWeight={600}>
            Threads インサイト（準備中）
          </Text>
          <Text size="sm" className={css({ mt: 2, color: "text.secondary" })}>
            Threads は Instagram とは別の Threads Graph API
            認可トークンが必要です。画面はタブ分け済みで、次に Threads
            OAuth、投稿一覧、投稿別インサイトをこの枠に接続できます。
          </Text>
          <HStack gap={2} mt={3} flexWrap="wrap">
            {["Threads OAuth", "投稿一覧", "投稿別インサイト"].map((item) => (
              <Text
                key={item}
                size="xs"
                className={css({
                  px: 2,
                  py: 1,
                  rounded: "sm",
                  bg: { base: "#F4F4F5", _dark: "#27272A" },
                  color: "text.secondary",
                })}
              >
                {item}
              </Text>
            ))}
          </HStack>
          <Text size="xs" className={css({ mt: 2, color: "text.secondary" })}>
            Meta 連携チャット: {metaSocialChatEnabled ? "有効" : "無効"}
          </Text>
        </Box>
      </HStack>
    </Box>
  );
}
