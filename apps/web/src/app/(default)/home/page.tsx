import { Text } from "@/components/ui/text";
import { ImagePlusIcon, MessageCircleReplyIcon, StoreIcon, TrendingUpIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { css } from "styled-system/css";
import { Box, Flex, VStack } from "styled-system/jsx";

export const metadata: Metadata = {
  title: "ホーム - SAI",
};

const features = [
  {
    id: "writing",
    title: "インスタ投稿作成",
    description: "画像・文章・タグを自動生成",
    icon: ImagePlusIcon,
    color: "#2F80ED",
    path: "/writing",
  },
  {
    id: "google-map",
    title: "口コミ返信",
    description: "Google Mapの口コミへ自動返信",
    icon: MessageCircleReplyIcon,
    color: "#27AE60",
    path: "/google-map",
  },
  {
    id: "analysis",
    title: "分析インサイト",
    description: "市場・競合・自社を総合分析",
    icon: TrendingUpIcon,
    color: "#9B51E0",
    path: "/competitor-analysis",
  },
  {
    id: "operation",
    title: "店舗運営相談",
    description: "売上・スタッフ配置のアドバイス",
    icon: StoreIcon,
    color: "#F2994A",
    path: "/improvement-proposal",
  },
];

export default function HomePage() {
  return (
    <Flex
      direction="column"
      align="center"
      justify="center"
      minH="calc(100vh - 200px)"
      gap={12}
      px={4}
      className={css({
        animation: "fadeIn 0.4s ease",
      })}
    >
      <VStack gap={4} textAlign="center">
        <Text
          size="3xl"
          className={css({
            fontWeight: 600,
            background: "brand.gradient",
            backgroundClip: "text",
            color: "transparent",
            "& ::selection": {
              background: "brand.light",
              color: "white",
            },
          })}
          style={{
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          どの機能を使いますか？
        </Text>
        <Text
          size="lg"
          className={css({
            color: "text.secondary",
          })}
        >
          AIがあなたの業務をサポートします
        </Text>
      </VStack>

      <Box
        className={css({
          display: "grid",
          gridTemplateColumns: { base: "1fr", md: "repeat(2, 1fr)" },
          gap: 6,
          maxW: "800px",
          w: "full",
        })}
      >
        {features.map((feature) => (
          <Link key={feature.id} href={feature.path}>
            <Box
              className={css({
                bg: "bg.card",
                borderRadius: "card",
                boxShadow: "card",
                p: 8,
                cursor: "pointer",
                transition: "all 0.3s ease",
                h: "240px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 4,
                textAlign: "center",
                _hover: {
                  transform: "translateY(-8px)",
                  boxShadow: "cardHover",
                },
              })}
            >
              <Box
                className={css({
                  w: 16,
                  h: 16,
                  borderRadius: "full",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  bg: `${feature.color}20`,
                })}
              >
                <feature.icon
                  size={32}
                  className={css({
                    color: feature.color,
                  })}
                />
              </Box>
              <Text
                size="xl"
                className={css({
                  fontWeight: 600,
                  color: "text.primary",
                })}
              >
                {feature.title}
              </Text>
              <Text
                className={css({
                  color: "text.secondary",
                  fontSize: "sm",
                })}
              >
                {feature.description}
              </Text>
            </Box>
          </Link>
        ))}
      </Box>
    </Flex>
  );
}
