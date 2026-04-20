"use client";

import { Text } from "@/components/ui/text";
import { css } from "styled-system/css";
import { Box, HStack, VStack } from "styled-system/jsx";

// NOTE: API 未接続のため、UI プレビュー用のモックデータで表示している
type Props = {
  metaSocialChatEnabled: boolean;
  metaAccountLinkEnabled: boolean;
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

const MOCK_PROFILE: ProfileData = {
  username: "insiteai_demo",
  name: "InsiteAI デモアカウント",
  biography: "デモ用のビジネスアカウントです。",
  followersCount: 12480,
  followsCount: 312,
  mediaCount: 87,
  profilePictureUrl: "",
};

const MOCK_MEDIA: MediaItem[] = [
  {
    id: "demo-1",
    caption: "新商品ラインが入荷しました！春の装いを先取り 🌸 #新作 #春コーデ",
    media_type: "IMAGE",
    timestamp: "2026-04-18T09:30:00+0900",
    like_count: 428,
    comments_count: 37,
    permalink: "#",
  },
  {
    id: "demo-2",
    caption: "週末限定キャンペーン開催中。店舗スタッフがおすすめアイテムをご紹介します。",
    media_type: "VIDEO",
    timestamp: "2026-04-15T18:00:00+0900",
    like_count: 612,
    comments_count: 54,
    permalink: "#",
  },
  {
    id: "demo-3",
    caption: "お客様の声をご紹介。ご愛用ありがとうございます！",
    media_type: "CAROUSEL_ALBUM",
    timestamp: "2026-04-12T12:15:00+0900",
    like_count: 289,
    comments_count: 21,
    permalink: "#",
  },
  {
    id: "demo-4",
    caption: "裏側大公開！スタッフの1日に密着しました。",
    media_type: "VIDEO",
    timestamp: "2026-04-09T20:45:00+0900",
    like_count: 873,
    comments_count: 92,
    permalink: "#",
  },
  {
    id: "demo-5",
    caption: "今月のベストセラーTOP5を発表します。",
    media_type: "IMAGE",
    timestamp: "2026-04-05T10:00:00+0900",
    like_count: 501,
    comments_count: 43,
    permalink: "#",
  },
];

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

export function MetaInsightPanel(_props: Props) {
  const profile = MOCK_PROFILE;
  const media = MOCK_MEDIA;

  return (
    <VStack gap={6} alignItems="stretch">
      <Box className={cardStyle}>
        <HStack justify="space-between" className={css({ mb: 3 })}>
          <Text size="sm" fontWeight={600}>
            接続済みアカウント（デモ表示）
          </Text>
        </HStack>
        <VStack gap={3} alignItems="stretch">
          <Text size="sm" fontWeight={500}>
            @{profile.username} ({profile.name})
          </Text>
          <HStack gap={3}>
            <Box className={statStyle}>
              <Text size="lg" fontWeight={700}>
                {profile.followersCount.toLocaleString()}
              </Text>
              <Text size="xs" className={css({ color: "text.secondary" })}>
                フォロワー
              </Text>
            </Box>
            <Box className={statStyle}>
              <Text size="lg" fontWeight={700}>
                {profile.followsCount.toLocaleString()}
              </Text>
              <Text size="xs" className={css({ color: "text.secondary" })}>
                フォロー中
              </Text>
            </Box>
            <Box className={statStyle}>
              <Text size="lg" fontWeight={700}>
                {profile.mediaCount.toLocaleString()}
              </Text>
              <Text size="xs" className={css({ color: "text.secondary" })}>
                投稿数
              </Text>
            </Box>
          </HStack>
        </VStack>
      </Box>

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
    </VStack>
  );
}
