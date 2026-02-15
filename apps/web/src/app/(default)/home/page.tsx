import { Text } from "@/components/ui/text";
import type { LucideIcon } from "lucide-react";
import { FileTextIcon, ImagePlusIcon, MessageCircleReplyIcon, StoreIcon, TrendingUpIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { css } from "styled-system/css";
import { Box, Flex, VStack } from "styled-system/jsx";
import { AnimatedIcon } from "./_components/animated-icon";

export const metadata: Metadata = {
  title: "ホーム - SAI",
};

type AnimationVariant = "orbit" | "relay" | "wave" | "spark" | "loop";

const features: Array<{
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  color: string;
  path: string;
  animationVariant: AnimationVariant;
}> = [
  {
    id: "writing",
    title: "インスタ投稿作成",
    description: "画像・文章・タグを自動生成",
    icon: ImagePlusIcon,
    color: "#2F80ED",
    path: "/writing",
    animationVariant: "orbit",
  },
  {
    id: "google-map",
    title: "口コミ返信",
    description: "Google Mapの口コミへ自動返信",
    icon: MessageCircleReplyIcon,
    color: "#27AE60",
    path: "/google-map",
    animationVariant: "relay",
  },
  {
    id: "analysis",
    title: "分析インサイト",
    description: "市場・競合・自社を総合分析",
    icon: TrendingUpIcon,
    color: "#9B51E0",
    path: "/competitor-analysis",
    animationVariant: "wave",
  },
  {
    id: "operation",
    title: "店舗運営相談",
    description: "売上・スタッフ配置のアドバイス",
    icon: StoreIcon,
    color: "#F2994A",
    path: "/improvement-proposal",
    animationVariant: "spark",
  },
  {
    id: "seo-articles",
    title: "SEO/AIO記事生成",
    description: "検索最適化された長文記事を自動作成",
    icon: FileTextIcon,
    color: "#E74C3C",
    path: "/seo-articles",
    animationVariant: "loop",
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
      bg="bg.base"
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
          gridTemplateColumns: {
            base: "1fr", // モバイル: 1列
            md: "repeat(2, 1fr)", // タブレット: 2列
            lg: "repeat(3, 1fr)", // デスクトップ: 3列
          },
          gap: { base: 4, md: 6 },
          maxW: { base: "800px", lg: "1200px" },
          w: "full",
          // 下段2枚を中央配置（5枚目と6枚目）
          "& > a:nth-of-type(4)": {
            gridColumn: { lg: "2 / 3" },
          },
          "& > a:nth-of-type(5)": {
            gridColumn: { lg: "auto" },
          },
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
                h: { base: "220px", md: "240px" },
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 4,
                textAlign: "center",
                position: "relative",
                overflow: "hidden",
                _hover: {
                  transform: "translateY(-8px)",
                  boxShadow: "cardHover",
                  "& [data-animated-icon]": {
                    opacity: 1,
                    transform: "scale(1.1)",
                  },
                },
              })}
            >
              {/* Bentoスタイルアニメーションアイコン */}
              <Box
                data-animated-icon
                className={css({
                  opacity: 0.85,
                  transition: "all 0.4s ease",
                  transform: "scale(1)",
                })}
              >
                <AnimatedIcon
                  variant={feature.animationVariant}
                  icon={feature.icon}
                  color={feature.color}
                  size={64}
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
                  lineHeight: 1.6,
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
