"use client";

import { Text } from "@/components/ui/text";
import { CheckCircleIcon, LightbulbIcon, TrendingUpIcon } from "lucide-react";
import { css } from "styled-system/css";
import { Box, Flex, VStack } from "styled-system/jsx";

const insights = [
  {
    id: "trends",
    title: "2026年のSEOトレンド",
    icon: TrendingUpIcon,
    color: "#2F80ED",
    items: [
      "AI生成コンテンツ品質評価厳格化",
      "UXシグナルの重要性増加",
      "E-E-A-Tが必須要素に",
    ],
  },
  {
    id: "best-practices",
    title: "評価されるポイント",
    icon: CheckCircleIcon,
    color: "#27AE60",
    items: [
      "3000文字以上の充実コンテンツ",
      "明確な見出し構造",
      "FAQ形式での質問回答",
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
      "数値やデータを含める",
    ],
  },
];

export function SeoInsightsBrowse() {
  const cardStyles = {
    flex: 1,
    minW: "350px",
    maxW: "450px",
    minH: "500px",
  };

  return (
    <Flex
      direction="column"
      gap={6}
      py={8}
      className={css({
        animation: "slideIn 0.3s ease",
      })}
    >
      <VStack gap={4} px={4} w="full" maxW="1400px" mx="auto">
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
            fontSize: "md",
          })}
        >
          検索エンジンで高評価を得るための最新情報とベストプラクティスをまとめました
        </Text>
      </VStack>

      <Flex
        gap={4}
        px={4}
        w="full"
        justify="center"
        flexWrap="wrap"
        maxW="1400px"
        mx="auto"
      >
        {insights.map((insight) => (
          <Box
            key={insight.id}
            className={css({
              ...cardStyles,
              bg: "bg.card",
              borderRadius: "card",
              boxShadow: "card",
              p: 8,
              display: "flex",
              flexDirection: "column",
              gap: 4,
              transition: "all 0.3s ease",
              _hover: {
                boxShadow: "cardHover",
                transform: "translateY(-4px)",
              },
            })}
          >
            <Flex align="center" gap={3}>
              <Box
                className={css({
                  w: 12,
                  h: 12,
                  borderRadius: "full",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  bg: `${insight.color}20`,
                })}
              >
                <insight.icon
                  size={24}
                  className={css({
                    color: insight.color,
                  })}
                />
              </Box>
              <Text
                size="lg"
                className={css({
                  fontWeight: 600,
                  color: "text.primary",
                })}
              >
                {insight.title}
              </Text>
            </Flex>

            <VStack
              gap={3}
              alignItems="stretch"
              flex={1}
            >
              {insight.items.map((item, index) => (
                <Box
                  key={index}
                  className={css({
                    py: 3,
                    px: 3,
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
                      fontSize: "md",
                      color: "text.secondary",
                      lineHeight: 1.7,
                      width: "100%",
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
    </Flex>
  );
}
