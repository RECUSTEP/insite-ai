"use client";

import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { css } from "styled-system/css";
import { Box, HStack, VStack } from "styled-system/jsx";

type Props = {
  metaSocialChatEnabled: boolean;
  metaAccountLinkEnabled: boolean;
};

type AccountInfo = {
  connected: boolean;
  account?: {
    instagramUserId: string;
    instagramUsername: string;
    connectedAt: number;
  };
};

type ProfileData = {
  username: string;
  name: string;
  biography: string;
  followersCount: number;
  followsCount: number;
  mediaCount: number;
  profilePictureUrl: string;
};

type MediaItem = {
  id: string;
  caption?: string;
  media_type: string;
  timestamp: string;
  like_count?: number;
  comments_count?: number;
  permalink: string;
};

const cardStyle = css({
  rounded: "lg",
  border: "1px solid",
  borderColor: { base: "#E4E4E7", _dark: "#3F3F46" },
  p: 4,
});

const statStyle = css({
  textAlign: "center",
  p: 3,
  rounded: "md",
  bg: { base: "#F4F4F5", _dark: "#27272A" },
  flex: 1,
});

export function MetaInsightPanel({ metaAccountLinkEnabled }: Props) {
  const searchParams = useSearchParams();
  const [account, setAccount] = useState<AccountInfo | null>(null);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // OAuth コールバックからのリダイレクト処理
  useEffect(() => {
    const metaError = searchParams.get("meta_error");
    if (metaError) {
      setError(decodeURIComponent(metaError));
    }
  }, [searchParams]);

  // アカウント接続状態を確認
  useEffect(() => {
    fetchAccountStatus();
  }, []);

  async function fetchAccountStatus() {
    try {
      const res = await fetch("/api/meta/account");
      const data = (await res.json()) as AccountInfo;
      setAccount(data);
      if (data.connected) {
        await Promise.all([fetchProfile(), fetchMedia()]);
      }
    } catch {
      setError("アカウント情報の取得に失敗しました");
    } finally {
      setLoading(false);
    }
  }

  async function fetchProfile() {
    const res = await fetch("/api/meta-insights/profile");
    if (res.ok) {
      setProfile((await res.json()) as ProfileData);
    }
  }

  async function fetchMedia() {
    const res = await fetch("/api/meta-insights/media?limit=10");
    if (res.ok) {
      const data = (await res.json()) as { media?: MediaItem[] };
      setMedia(data.media ?? []);
    }
  }

  async function handleConnect() {
    setConnecting(true);
    try {
      const res = await fetch("/api/meta/auth");
      const data = (await res.json()) as { authUrl?: string };
      if (data.authUrl) {
        window.location.href = data.authUrl;
      } else {
        setError("認証URLの取得に失敗しました");
        setConnecting(false);
      }
    } catch {
      setError("接続に失敗しました");
      setConnecting(false);
    }
  }

  async function handleDisconnect() {
    if (!confirm("Instagram アカウントの連携を解除しますか？")) return;
    const res = await fetch("/api/meta/account", { method: "DELETE" });
    if (res.ok) {
      setAccount({ connected: false });
      setProfile(null);
      setMedia([]);
    }
  }

  if (loading) {
    return (
      <Text size="sm" className={css({ color: "text.secondary" })}>
        読み込み中...
      </Text>
    );
  }

  // 未接続状態
  if (!account?.connected) {
    return (
      <VStack gap={6} alignItems="stretch">
        <Box className={cardStyle}>
          <Text size="sm" fontWeight={600} className={css({ mb: 3 })}>
            Instagram アカウント連携
          </Text>
          <Text size="sm" className={css({ color: "text.secondary", mb: 4 })}>
            Instagram ビジネスアカウントを連携すると、投稿のインサイト・プロフィール分析・フォロワー推移を確認できます。
          </Text>
          {metaAccountLinkEnabled ? (
            <Button onClick={handleConnect} loading={connecting} size="sm">
              Instagram を連携する
            </Button>
          ) : (
            <Text size="sm" className={css({ color: "text.secondary" })}>
              管理画面で「アカウント連携（OAuth）」を有効にしてください。
            </Text>
          )}
          {error && (
            <Text size="sm" className={css({ color: "red.500", mt: 2 })}>
              {error}
            </Text>
          )}
        </Box>
      </VStack>
    );
  }

  // 接続済み
  return (
    <VStack gap={6} alignItems="stretch">
      {/* アカウント情報 */}
      <Box className={cardStyle}>
        <HStack justify="space-between" className={css({ mb: 3 })}>
          <Text size="sm" fontWeight={600}>
            接続済みアカウント
          </Text>
          <Button onClick={handleDisconnect} size="xs" variant="ghost">
            連携解除
          </Button>
        </HStack>
        {profile ? (
          <VStack gap={3} alignItems="stretch">
            <Text size="sm" fontWeight={500}>
              @{profile.username} {profile.name && `(${profile.name})`}
            </Text>
            {/* フォロワー等の統計 */}
            <HStack gap={3}>
              <Box className={statStyle}>
                <Text size="lg" fontWeight={700}>
                  {profile.followersCount?.toLocaleString()}
                </Text>
                <Text size="xs" className={css({ color: "text.secondary" })}>
                  フォロワー
                </Text>
              </Box>
              <Box className={statStyle}>
                <Text size="lg" fontWeight={700}>
                  {profile.followsCount?.toLocaleString()}
                </Text>
                <Text size="xs" className={css({ color: "text.secondary" })}>
                  フォロー中
                </Text>
              </Box>
              <Box className={statStyle}>
                <Text size="lg" fontWeight={700}>
                  {profile.mediaCount?.toLocaleString()}
                </Text>
                <Text size="xs" className={css({ color: "text.secondary" })}>
                  投稿数
                </Text>
              </Box>
            </HStack>
          </VStack>
        ) : (
          <Text size="sm" className={css({ color: "text.secondary" })}>
            @{account.account?.instagramUsername ?? "---"}
          </Text>
        )}
      </Box>

      {/* 最新投稿一覧 */}
      {media.length > 0 && (
        <Box className={cardStyle}>
          <Text size="sm" fontWeight={600} className={css({ mb: 3 })}>
            最新投稿
          </Text>
          <VStack gap={2} alignItems="stretch">
            {media.map((item) => (
              <HStack
                key={item.id}
                justify="space-between"
                className={css({
                  p: 2,
                  rounded: "md",
                  bg: { base: "#FAFAFA", _dark: "#1C1C1E" },
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
                    {item.caption?.slice(0, 60) || "(キャプションなし)"}
                  </Text>
                  <Text size="xs" className={css({ color: "text.secondary" })}>
                    {new Date(item.timestamp).toLocaleDateString("ja-JP")}
                  </Text>
                </Box>
                <HStack gap={3} flexShrink={0}>
                  <Text size="xs" className={css({ color: "text.secondary" })}>
                    ♥ {item.like_count ?? 0}
                  </Text>
                  <Text size="xs" className={css({ color: "text.secondary" })}>
                    💬 {item.comments_count ?? 0}
                  </Text>
                </HStack>
              </HStack>
            ))}
          </VStack>
        </Box>
      )}
    </VStack>
  );
}
