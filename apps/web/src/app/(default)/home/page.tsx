import { Text } from "@/components/ui/text";
import { FeaturesCarousel } from "@/components/features-carousel";
import { createClient } from "@/lib/api";
import type { LucideIcon } from "lucide-react";
import {
  ImagePlusIcon,
  MessageCircleReplyIcon,
  StoreIcon,
  TrendingUpIcon,
} from "lucide-react";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import Link from "next/link";
import { css } from "styled-system/css";
import { Box, Flex, VStack } from "styled-system/jsx";

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
    title: "AI自動生成",
    description:
      "高度な自然言語処理AIが、あなたのビジネスに最適化されたコンテンツを瞬時に生成。Instagram投稿、Google Mapの口コミ返信、SEO記事まで、プロフェッショナルな品質を数秒で実現します。",
    color: "#2F80ED",
  },
  {
    title: "業務効率化",
    description:
      "SNS運用、口コミ対応、コンテンツ作成など、日々の煩雑な業務を自動化。手作業の時間を最大90%削減し、戦略立案やお客様との対話など、本質的な業務に集中できる環境を実現します。",
    color: "#27AE60",
  },
  {
    title: "データ駆動の戦略立案",
    description:
      "市場トレンド、競合店舗の動向、自社アカウントのパフォーマンスを統合的に分析。AIが膨大なデータから意味のある洞察を抽出し、次の一手を的確に提案します。",
    color: "#9B51E0",
  },
  {
    title: "持続的な成長支援",
    description:
      "AIが24時間365日、あなたのビジネスの成長をサポート。最適化されたマーケティング施策、効果的なコンテンツ戦略、データに基づく改善提案により、集客力と売上の向上を実現します。",
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
      <VStack gap={16} w="full" maxW="1100px" mb={12}>
        <VStack gap={4} textAlign="center">
          <Text
            size="4xl"
            className={css({
              fontWeight: 700,
              background: "brand.gradient",
              backgroundClip: "text",
              color: "transparent",
            })}
            style={{
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            INSITE AIの特徴
          </Text>
          <Text
            size="lg"
            className={css({
              color: "text.secondary",
              maxW: "3xl",
              lineHeight: 1.8,
            })}
          >
            最先端のAI技術とデータサイエンスを駆使し、
            <br />
            あなたのビジネスを次のステージへ導きます
          </Text>
        </VStack>

        <FeaturesCarousel features={aiFeatures} />
      </VStack>
    </Flex>
  );
}
