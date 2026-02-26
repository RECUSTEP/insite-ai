import { Text } from "@/components/ui/text";
import { createClient, createFetch } from "@/lib/api";
import { PROJECT_TAG } from "@/lib/tags";
import type { LucideIcon } from "lucide-react";
import {
  ArrowRightIcon,
  AtSignIcon,
  FileTextIcon,
  ImagePlusIcon,
  MapPinIcon,
  MessageCircleReplyIcon,
  NotebookPenIcon,
  StoreIcon,
  TrendingUpIcon,
  UserRoundSearchIcon,
} from "lucide-react";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import Link from "next/link";
import { css } from "styled-system/css";
import { Box, Flex, Grid, VStack } from "styled-system/jsx";

export const metadata: Metadata = {
  title: "ホーム",
};

const features: Array<{
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  color: string;
  path: string;
  category: string;
}> = [
  {
    id: "writing",
    title: "インスタ投稿",
    description: "画像・文章・タグを自動生成",
    icon: ImagePlusIcon,
    color: "#2F80ED",
    path: "/writing",
    category: "ライティング",
  },
  {
    id: "google-map",
    title: "口コミ返信",
    description: "Google MAPの口コミ作成",
    icon: MessageCircleReplyIcon,
    color: "#27AE60",
    path: "/google-map",
    category: "ライティング",
  },
  {
    id: "analysis",
    title: "分析インサイト",
    description: "市場・競合・自社を総合分析",
    icon: TrendingUpIcon,
    color: "#9B51E0",
    path: "/competitor-analysis",
    category: "分析",
  },
  {
    id: "operation",
    title: "店舗運営相談",
    description: "売上・スタッフ配置のアドバイス",
    icon: StoreIcon,
    color: "#F2994A",
    path: "/improvement-proposal",
    category: "分析",
  },
  {
    id: "threads",
    title: "Threads投稿",
    description: "Threads用の投稿文を自動生成",
    icon: AtSignIcon,
    color: "#000000",
    path: "/threads",
    category: "ライティング",
  },
  {
    id: "seo-articles",
    title: "SEO記事生成",
    description: "検索最適化された記事を自動作成",
    icon: FileTextIcon,
    color: "#E74C3C",
    path: "/seo-articles",
    category: "ライティング",
  },
];

const quickLinks = [
  {
    icon: UserRoundSearchIcon,
    label: "分析AI",
    path: "/competitor-analysis",
  },
  {
    icon: NotebookPenIcon,
    label: "ライティング",
    path: "/writing",
  },
  {
    icon: MapPinIcon,
    label: "Google Map",
    path: "/google-map",
  },
  {
    icon: AtSignIcon,
    label: "Threads",
    path: "/threads",
  },
];

export default async function HomePage() {
  const fetcher = createFetch({ next: { revalidate: 0, tags: [PROJECT_TAG] } });
  const client = createClient(fetcher);

  const projectRes = await client.project.$get(
    {},
    { headers: { cookie: cookies().toString() } },
  );

  let seoAddonEnabled = false;
  let projectName = "";
  let apiUsageCount = 0;
  let apiUsageLimit = 0;

  if (projectRes.ok) {
    const project = await projectRes.json();
    seoAddonEnabled = project.seoAddonEnabled ?? false;
    projectName = project.name ?? "";
    apiUsageCount = project.apiUsageCount ?? 0;
    apiUsageLimit = project.apiUsageLimit ?? 0;
  }

  const visibleFeatures = features.filter(
    (f) => f.id !== "seo-articles" || seoAddonEnabled,
  );

  const usagePercent = apiUsageLimit > 0 ? (apiUsageCount / apiUsageLimit) * 100 : 0;

  return (
    <Flex
      direction="column"
      gap={8}
      py={6}
      className={css({ animation: "fadeIn 0.3s ease" })}
    >
      {/* ページタイトル */}
      <VStack gap={1} alignItems="flex-start">
        <Text
          className={css({
            fontSize: "2xl",
            fontWeight: 700,
            color: "text.primary",
            letterSpacing: "-0.02em",
          })}
        >
          {projectName ? `${projectName}` : "ダッシュボード"}
        </Text>
        <Text
          className={css({
            fontSize: "sm",
            color: "text.secondary",
          })}
        >
          ようこそ。AIツールでビジネスを加速させましょう。
        </Text>
      </VStack>

      {/* API使用状況 */}
      <Box
        className={css({
          bg: "bg.card",
          border: "1px solid",
          borderColor: { base: "#E4E4E7", _dark: "#27272A" },
          borderRadius: "12px",
          p: 5,
        })}
      >
        <Flex justify="space-between" align="center" mb={3}>
          <Text
            className={css({
              fontSize: "sm",
              fontWeight: 600,
              color: "text.primary",
            })}
          >
            今月のAPI使用状況
          </Text>
          <Text
            className={css({
              fontSize: "sm",
              color: "text.secondary",
              fontVariantNumeric: "tabular-nums",
            })}
          >
            {apiUsageCount.toLocaleString()} / {apiUsageLimit.toLocaleString()} 回
          </Text>
        </Flex>
        <Box
          className={css({
            h: "6px",
            bg: { base: "#E4E4E7", _dark: "#27272A" },
            borderRadius: "full",
            overflow: "hidden",
          })}
        >
          <Box
            style={{ width: `${Math.min(usagePercent, 100)}%` }}
            className={css({
              h: "full",
              bg: usagePercent > 80 ? "#E74C3C" : "brand.DEFAULT",
              borderRadius: "full",
              transition: "width 0.5s ease",
            })}
          />
        </Box>
        <Text
          className={css({
            fontSize: "xs",
            color: "text.muted",
            mt: 2,
          })}
        >
          残り {Math.max(0, apiUsageLimit - apiUsageCount).toLocaleString()} 回
        </Text>
      </Box>

      {/* AIツール一覧 */}
      <Box>
        <Text
          className={css({
            fontSize: "sm",
            fontWeight: 600,
            color: "text.secondary",
            mb: 3,
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          })}
        >
          AIツール
        </Text>
        <Grid
          className={css({
            gridTemplateColumns: {
              base: "1fr",
              sm: "repeat(2, 1fr)",
              lg: "repeat(3, 1fr)",
            },
            gap: 3,
          })}
        >
          {visibleFeatures.map((feature) => (
            <Link key={feature.id} href={feature.path}>
              <Box
                className={css({
                  bg: "bg.card",
                  border: "1px solid",
                  borderColor: { base: "#E4E4E7", _dark: "#27272A" },
                  borderRadius: "12px",
                  p: 5,
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 4,
                  _hover: {
                    borderColor: feature.color,
                    boxShadow: `0 0 0 1px ${feature.color}33`,
                    transform: "translateY(-1px)",
                  },
                })}
              >
                <Box
                  className={css({
                    w: 10,
                    h: 10,
                    borderRadius: "10px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  })}
                  style={{ background: `${feature.color}18` }}
                >
                  <feature.icon size={20} style={{ color: feature.color }} />
                </Box>
                <Box flex="1" minW={0}>
                  <Text
                    className={css({
                      fontSize: "sm",
                      fontWeight: 600,
                      color: "text.primary",
                      mb: 1,
                    })}
                  >
                    {feature.title}
                  </Text>
                  <Text
                    className={css({
                      fontSize: "xs",
                      color: "text.secondary",
                      lineHeight: 1.5,
                    })}
                  >
                    {feature.description}
                  </Text>
                </Box>
                <ArrowRightIcon
                  size={16}
                  className={css({ color: "text.muted", flexShrink: 0, mt: 1 })}
                />
              </Box>
            </Link>
          ))}
        </Grid>
      </Box>

      {/* クイックリンク */}
      <Box>
        <Text
          className={css({
            fontSize: "sm",
            fontWeight: 600,
            color: "text.secondary",
            mb: 3,
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          })}
        >
          クイックアクセス
        </Text>
        <Flex gap={3} flexWrap="wrap">
          {quickLinks.map((link) => (
            <Link key={link.path} href={link.path}>
              <Flex
                align="center"
                gap={2}
                className={css({
                  bg: "bg.card",
                  border: "1px solid",
                  borderColor: { base: "#E4E4E7", _dark: "#27272A" },
                  borderRadius: "8px",
                  px: 4,
                  py: 2.5,
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                  _hover: {
                    borderColor: "brand.DEFAULT",
                    color: "brand.DEFAULT",
                  },
                })}
              >
                <link.icon size={16} className={css({ color: "brand.DEFAULT" })} />
                <Text
                  className={css({
                    fontSize: "sm",
                    fontWeight: 500,
                    color: "text.primary",
                  })}
                >
                  {link.label}
                </Text>
              </Flex>
            </Link>
          ))}
          <Link href="/history">
            <Flex
              align="center"
              gap={2}
              className={css({
                bg: "bg.card",
                border: "1px solid",
                borderColor: { base: "#E4E4E7", _dark: "#27272A" },
                borderRadius: "8px",
                px: 4,
                py: 2.5,
                cursor: "pointer",
                transition: "all 0.15s ease",
                _hover: {
                  borderColor: "brand.DEFAULT",
                  color: "brand.DEFAULT",
                },
              })}
            >
              <Text
                className={css({
                  fontSize: "sm",
                  fontWeight: 500,
                  color: "text.primary",
                })}
              >
                履歴を見る
              </Text>
              <ArrowRightIcon size={14} className={css({ color: "text.muted" })} />
            </Flex>
          </Link>
        </Flex>
      </Box>
    </Flex>
  );
}
