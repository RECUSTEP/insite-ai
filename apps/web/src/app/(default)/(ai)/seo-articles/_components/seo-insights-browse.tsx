"use client";

import { Text } from "@/components/ui/text";
import { CheckCircleIcon, LightbulbIcon, TrendingUpIcon } from "lucide-react";
import { css } from "styled-system/css";
import { Box, Flex, VStack } from "styled-system/jsx";

interface SeoInsightsBrowseProps {
  mode?: "focus" | "browse";
}

const insights = [
  {
    id: "trends",
    title: "2026年のSEOトレンド",
    icon: TrendingUpIcon,
    color: "#2F80ED",
    items: [
      "AI生成コンテンツの品質評価が厳格化",
      "UXシグナルの重要性増加",
      "E-E-A-Tが必須要素に",
      "モバイルファースト完全移行",
    ],
  },
  {
    id: "best-practices",
    title: "評価されるポイント",
    icon: CheckCircleIcon,
    color: "#27AE60",
    items: [
      "3000文字以上の充実したコンテンツ",
      "明確な見出し構造（H2, H3）",
      "FAQ形式での質問回答",
      "独自の視点や実体験",
    ],
  },
  {
    id: "tips",
    title: "記事作成のコツ",
    icon: LightbulbIcon,
    color: "#9B51E0",
    items: [
      "キーワードを自然に配置",
      "最初の段落で結論を提示",
      "具体的な数値やデータを含める",
      "定期的な更新で鮮度を保つ",
    ],
  },
];

export function SeoInsightsBrowse({ mode = "browse" }: SeoInsightsBrowseProps) {
  const cardStyles = mode === "browse" 
    ? {
        minW: "280px",
        maxW: "280px",
        h: "300px",
      }
    : {
        flex: 1,
        minW: "320px",
        h: "auto",
        minH: "220px",
        maxH: "280px",
      };

  const containerGap = mode === "browse" ? 3 : 4;

  return (
    <Flex
      direction="column"
      gap={6}
      py={8}
      align={mode === "focus" ? "center" : "flex-start"}
      className={css({
        animation: "slideIn 0.3s ease",
      })}
    >
      {mode === "browse" && (
        <VStack gap={6} px={4}>
          <Text
            size="2xl"
            className={css({
              fontWeight: 700,
              color: "text.primary",
              textAlign: "center",
            })}
          >
            SEO/AIO記事の最新トレンド
          </Text>
          <Text
            className={css({
              color: "text.secondary",
              textAlign: "center",
              maxW: "2xl",
            })}
          >
            検索エンジンで高評価を得るための最新情報とベストプラクティスをまとめました
          </Text>
        </VStack>
      )}

      <Box
        w="full"
        maxW={mode === "focus" ? "1400px" : "full"}
        className={css({
          overflowX: mode === "browse" ? "auto" : "visible",
          WebkitOverflowScrolling: "touch",
          scrollbarWidth: "none",
          "&::-webkit-scrollbar": {
            display: "none",
          },
        })}
      >
        <Flex 
          gap={containerGap} 
          px={4} 
          minW={mode === "browse" ? "max-content" : "auto"}
          justify={mode === "focus" ? "center" : "flex-start"}
        >
          {insights.map((insight) => (
            <Box
              key={insight.id}
              className={css({
                ...cardStyles,
                bg: "bg.card",
                borderRadius: "card",
                boxShadow: "card",
                p: mode === "browse" ? 4 : 5,
                display: "flex",
                flexDirection: "column",
                gap: mode === "browse" ? 2 : 3,
                transition: "all 0.3s ease",
                _hover: {
                  boxShadow: "cardHover",
                  transform: mode === "browse" ? "translateY(-4px)" : "none",
                },
              })}
            >
              <Flex align="center" gap={2}>
                <Box
                  className={css({
                    w: 10,
                    h: 10,
                    borderRadius: "full",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    bg: `${insight.color}20`,
                  })}
                >
                  <insight.icon
                    size={20}
                    className={css({
                      color: insight.color,
                    })}
                  />
                </Box>
                <Text
                  size="md"
                  className={css({
                    fontWeight: 600,
                    color: "text.primary",
                  })}
                >
                  {insight.title}
                </Text>
              </Flex>

              <VStack 
                gap={mode === "browse" ? 1.5 : 2}
                alignItems="stretch"
                className={css({
                  flex: 1,
                  overflowY: "auto",
                })}
              >
                {insight.items.map((item, index) => (
                  <Box
                    key={index}
                    className={css({
                      py: mode === "browse" ? 1.5 : 2,
                      px: mode === "browse" ? 2 : 3,
                      borderRadius: "md",
                      bg: "gray.50",
                      transition: "background 0.2s ease",
                      _hover: {
                        bg: "gray.100",
                      },
                    })}
                  >
                    <Text
                      className={css({
                        fontSize: mode === "browse" ? "xs" : "sm",
                        color: "text.secondary",
                        lineHeight: 1.5,
                      })}
                    >
                      {item}
                    </Text>
                  </Box>
                ))}
              </VStack>
            </Box>
          ))}
        </Flex>
      </Box>
    </Flex>
  );
}
