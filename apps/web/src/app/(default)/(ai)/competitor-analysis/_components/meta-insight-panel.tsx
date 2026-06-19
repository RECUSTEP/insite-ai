"use client";

import { toaster } from "@/app/_components/toast";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Text } from "@/components/ui/text";
import {
  BarChart3Icon,
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
  values: Array<{ value: number }>;
};

type MediaItem = {
  id: string;
  caption?: string;
  mediaType: string;
  timestamp: string;
  likeCount?: number;
  commentsCount?: number;
  permalink: string;
};

type MediaInsights = {
  mediaId: string;
  insights: Record<string, number>;
};

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
  return {
    id: String(item.id ?? ""),
    caption: typeof item.caption === "string" ? item.caption : undefined,
    mediaType: typeof item.media_type === "string" ? item.media_type : "IMAGE",
    timestamp: typeof item.timestamp === "string" ? item.timestamp : "",
    likeCount: typeof item.like_count === "number" ? item.like_count : undefined,
    commentsCount: typeof item.comments_count === "number" ? item.comments_count : undefined,
    permalink: typeof item.permalink === "string" ? item.permalink : "#",
  };
}

export function MetaInsightPanel({ metaSocialChatEnabled, metaAccountLinkEnabled }: Props) {
  const searchParams = useSearchParams();
  const [account, setAccount] = useState<ConnectedAccount | null>(null);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [profileInsights, setProfileInsights] = useState<InsightMetric[]>([]);
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [selectedMediaId, setSelectedMediaId] = useState<string>("");
  const [mediaInsights, setMediaInsights] = useState<MediaInsights | null>(null);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [insightLoading, setInsightLoading] = useState(false);

  const selectedMedia = useMemo(
    () => media.find((item) => item.id === selectedMediaId) ?? null,
    [media, selectedMediaId],
  );

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

      const [profileData, profileInsightData, mediaData] = await Promise.all([
        fetchJson<ProfileData>("/api/meta-insights/profile"),
        fetchJson<{ insights: InsightMetric[] }>("/api/meta-insights/profile-insights?period=day"),
        fetchJson<{ media: Record<string, unknown>[] }>("/api/meta-insights/media?limit=12"),
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
  }, []);

  useEffect(() => {
    loadInstagramData();
  }, [loadInstagramData]);

  useEffect(() => {
    const connected = searchParams.get("meta_connected");
    const error = searchParams.get("meta_error");
    if (connected === "true") {
      toaster.success({
        title: "Meta 連携完了",
        description: "Instagram アカウントを接続しました。",
      });
    }
    if (error) {
      toaster.error({ title: "Meta 連携エラー", description: error });
    }
  }, [searchParams]);

  useEffect(() => {
    if (!selectedMediaId) {
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
  }, [selectedMediaId]);

  const connectInstagram = async () => {
    setConnecting(true);
    try {
      const data = await fetchJson<{ authUrl: string }>("/api/meta/auth");
      window.location.href = data.authUrl;
    } catch (e) {
      const message = e instanceof Error ? e.message : "Meta 認可 URL の取得に失敗しました";
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
                Facebook ページに紐づいた Instagram
                ビジネスアカウントのプロフィール、投稿、投稿別インサイトを取得します。
              </Text>
              <Button mt={4} onClick={connectInstagram} loading={connecting}>
                <LinkIcon />
                Meta と連携
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
        <HStack gap={2} mb={3}>
          <BarChart3Icon className={css({ width: 18, height: 18 })} />
          <Text size="sm" fontWeight={600}>
            プロフィールインサイト
          </Text>
        </HStack>
        <HStack gap={3} flexWrap="wrap">
          <Box className={statStyle}>
            <Text size="lg" fontWeight={700}>
              {formatNumber(metricValue(profileInsights, "impressions"))}
            </Text>
            <Text size="xs" className={css({ color: "text.secondary" })}>
              インプレッション
            </Text>
          </Box>
          <Box className={statStyle}>
            <Text size="lg" fontWeight={700}>
              {formatNumber(metricValue(profileInsights, "reach"))}
            </Text>
            <Text size="xs" className={css({ color: "text.secondary" })}>
              リーチ
            </Text>
          </Box>
          <Box className={statStyle}>
            <Text size="lg" fontWeight={700}>
              {formatNumber(metricValue(profileInsights, "profile_views"))}
            </Text>
            <Text size="xs" className={css({ color: "text.secondary" })}>
              プロフィール表示
            </Text>
          </Box>
        </HStack>
      </Box>

      <Box className={cardStyle}>
        <Text size="sm" fontWeight={600} className={css({ mb: 3 })}>
          最新投稿
        </Text>
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
          ) : (
            <HStack gap={3} flexWrap="wrap">
              {Object.entries(mediaInsights?.insights ?? {}).map(([name, value]) => (
                <Box key={name} className={statStyle}>
                  <Text size="md" fontWeight={700}>
                    {formatNumber(value)}
                  </Text>
                  <Text size="xs" className={css({ color: "text.secondary" })}>
                    {name}
                  </Text>
                </Box>
              ))}
            </HStack>
          )}
        </Box>
      )}

      <ThreadsNotice metaSocialChatEnabled={metaSocialChatEnabled} />
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
            Threads インサイト
          </Text>
          <Text size="sm" className={css({ mt: 2, color: "text.secondary" })}>
            Threads は Instagram Graph API とは別の Threads Graph API
            認可トークンが必要です。現時点では投稿作成用の導線のみ有効で、インサイト取得は次の実装対象です。
          </Text>
          <Text size="xs" className={css({ mt: 2, color: "text.secondary" })}>
            Meta 連携チャット: {metaSocialChatEnabled ? "有効" : "無効"}
          </Text>
        </Box>
      </HStack>
    </Box>
  );
}
