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
  return (
    <Box
      py={8}
      px={4}
      className={css({
        animation: "slideIn 0.3s ease",
      })}
    >
      <VStack gap={8} w="full" maxW="900px" mx="auto">
        <VStack gap={3} textAlign="center">
          <Text
            size="2xl"
            className={css({
              fontWeight: 700,
              color: "text.primary",
            })}
          >
            SEO/AIO記事の最新トレンド
          </Text>
          <Text
            className={css({
              color: "text.secondary",
              maxW: "2xl",
              fontSize: "md",
            })}
          >
            検索エンジンで高評価を得るための最新情報とベストプラクティス
          </Text>
        </VStack>

        <VStack gap={6} w="full" alignItems="stretch">
          {insights.map((insight, idx) => (
            <Box
              key={insight.id}
              className={css({
                borderLeft: "4px solid",
                borderColor: insight.color,
                pl: 6,
                pr: 4,
                py: 4,
                bg: {
                  base: "white",
                  _dark: "#374151",
                },
                borderRadius: "md",
                transition: "all 0.2s ease",
                _hover: {
                  transform: "translateX(8px)",
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                },
              })}
            >
              <Flex align="center" gap={3} mb={4}>
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
                  size="lg"
                  className={css({
                    fontWeight: 700,
                    color: "text.primary",
                  })}
                >
                  {insight.title}
                </Text>
              </Flex>

              <VStack gap={2} alignItems="stretch">
                {insight.items.map((item, itemIdx) => (
                  <Flex
                    key={itemIdx}
                    gap={3}
                    align="flex-start"
                    className={css({
                      py: 2,
                    })}
                  >
                    <Box
                      className={css({
                        w: 6,
                        h: 6,
                        borderRadius: "full",
                        bg: `${insight.color}30`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        mt: 1,
                      })}
                    >
                      <Text
                        className={css({
                          fontSize: "xs",
                          fontWeight: 700,
                          color: insight.color,
                        })}
                      >
                        {itemIdx + 1}
                      </Text>
                    </Box>
                    <Text
                      className={css({
                        fontSize: "md",
                        color: "text.secondary",
                        lineHeight: 1.8,
                        flex: 1,
                      })}
                    >
                      {item}
                    </Text>
                  </Flex>
                ))}
              </VStack>
            </Box>
          ))}
        </VStack>
      </VStack>
    </Box>
  );
}
