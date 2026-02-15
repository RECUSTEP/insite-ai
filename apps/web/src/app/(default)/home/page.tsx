import { Text } from "@/components/ui/text";
import { createClient } from "@/lib/api";
import type { LucideIcon } from "lucide-react";
import {
  BrainCircuitIcon,
  FileTextIcon,
  ImagePlusIcon,
  MessageCircleReplyIcon,
  RocketIcon,
  SparklesIcon,
  StoreIcon,
  TrendingUpIcon,
  ZapIcon,
} from "lucide-react";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import Link from "next/link";
import { css } from "styled-system/css";
import { Box, Flex, HStack, VStack } from "styled-system/jsx";

export const metadata: Metadata = {
  title: "ホーム - SAI",
};

const features: Array<{
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  color: string;
  path: string;
}> = [
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
  {
    id: "seo-articles",
    title: "SEO/AIO記事生成",
    description: "検索最適化された長文記事を自動作成",
    icon: FileTextIcon,
    color: "#E74C3C",
    path: "/seo-articles",
  },
];

const aiFeatures = [
  {
    icon: SparklesIcon,
    title: "AI自動生成",
    description: "最新のAI技術で、高品質なコンテンツを数秒で生成",
    color: "#2F80ED",
  },
  {
    icon: ZapIcon,
    title: "業務効率化",
    description: "手作業の時間を90%削減し、本質的な業務に集中",
    color: "#27AE60",
  },
  {
    icon: BrainCircuitIcon,
    title: "データ分析",
    description: "市場・競合・自社データを総合的に分析して戦略立案",
    color: "#9B51E0",
  },
  {
    icon: RocketIcon,
    title: "売上向上",
    description: "最適化されたマーケティング施策で集客・売上アップ",
    color: "#F2994A",
  },
];

export default async function HomePage() {
  // プロジェクト情報を取得してSEOアドオンの有効状態を確認
  const client = createClient();
  const projectRes = await client.project.$get(
    {},
    {
      headers: {
        cookie: cookies().toString(),
      },
    },
  );

  let seoAddonEnabled = false;
  if (projectRes.ok) {
    const project = await projectRes.json();
    seoAddonEnabled = project.seoAddonEnabled ?? false;
  }

  // SEOアドオンが有効な場合のみSEO機能を表示
  const visibleFeatures = features.filter(f => 
    f.id !== 'seo-articles' || seoAddonEnabled
  );

  return (
    <Flex
      direction="column"
      align="center"
      justify="flex-start"
      minH="calc(100vh - 200px)"
      gap={20}
      px={4}
      py={12}
      bg="bg.base"
      className={css({
        animation: "fadeIn 0.4s ease",
      })}
    >
      <VStack gap={3} textAlign="center" maxW="3xl">
        <Text
          size="4xl"
          className={css({
            fontWeight: 700,
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
          INSITE AI
        </Text>
        <Text
          size="xl"
          className={css({
            fontWeight: 600,
            color: "text.primary",
          })}
        >
          店舗・ビジネスを成長させるAIアシスタント
        </Text>
        <Text
          size="md"
          className={css({
            color: "text.secondary",
            lineHeight: 1.8,
          })}
        >
          SNS投稿、口コミ返信、市場分析、SEO記事作成まで。
          <br />
          AIが24時間365日、あなたのビジネスをサポートします。
        </Text>
      </VStack>

      <Box
        className={css({
          display: "grid",
          gridTemplateColumns: {
            base: "1fr", // モバイル: 1列
            md: "repeat(2, 1fr)", // タブレット以上: 2列
          },
          gap: { base: 4, md: 6 },
          maxW: "900px",
          w: "full",
        })}
      >
        {visibleFeatures.map((feature) => (
          <Link key={feature.id} href={feature.path}>
            <Box
              className={css({
                bg: "white",
                borderRadius: "xl",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
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
                border: "1px solid",
                borderColor: "gray.100",
                _hover: {
                  transform: "translateY(-8px)",
                  boxShadow: "0 12px 24px rgba(0, 0, 0, 0.12)",
                  borderColor: feature.color,
                },
              })}
            >
              {/* シンプルなアイコン */}
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
                  lineHeight: 1.6,
                })}
              >
                {feature.description}
              </Text>
            </Box>
          </Link>
        ))}
      </Box>

      {/* INSITE AIの特徴セクション */}
      <VStack gap={12} w="full" maxW="1200px">
        <VStack gap={3} textAlign="center">
          <Text
            size="3xl"
            className={css({
              fontWeight: 700,
              color: "text.primary",
            })}
          >
            INSITE AIの特徴
          </Text>
          <Text
            size="md"
            className={css({
              color: "text.secondary",
              maxW: "2xl",
            })}
          >
            最先端のAI技術で、あなたのビジネスを次のステージへ
          </Text>
        </VStack>

        <Box
          className={css({
            display: "grid",
            gridTemplateColumns: {
              base: "1fr",
              md: "repeat(2, 1fr)",
            },
            gap: 6,
            w: "full",
          })}
        >
          {aiFeatures.map((feature, index) => (
            <Box
              key={index}
              className={css({
                bg: "white",
                borderRadius: "xl",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
                p: 8,
                transition: "all 0.3s ease",
                border: "1px solid",
                borderColor: "gray.100",
                _hover: {
                  transform: "translateY(-4px)",
                  boxShadow: "0 12px 24px rgba(0, 0, 0, 0.12)",
                  borderColor: feature.color,
                },
              })}
            >
              <HStack gap={4} alignItems="flex-start">
                <Box
                  className={css({
                    w: 14,
                    h: 14,
                    borderRadius: "xl",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    bg: `${feature.color}15`,
                    flexShrink: 0,
                  })}
                >
                  <feature.icon
                    size={28}
                    className={css({
                      color: feature.color,
                    })}
                  />
                </Box>
                <VStack gap={2} alignItems="flex-start" flex={1}>
                  <Text
                    size="lg"
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
                </VStack>
              </HStack>
            </Box>
          ))}
        </Box>
      </VStack>
    </Flex>
  );
}
