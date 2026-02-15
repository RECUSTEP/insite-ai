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
      "AI生成コンテンツの品質評価が厳格化",
      "ユーザー体験（UX）シグナルの重要性増加",
      "E-E-A-T（経験・専門性・権威性・信頼性）が必須",
      "モバイルファーストインデックスの完全移行",
      "音声検索最適化の重要性が上昇",
    ],
  },
  {
    id: "best-practices",
    title: "評価されるポイント",
    icon: CheckCircleIcon,
    color: "#27AE60",
    items: [
      "3000文字以上の充実したコンテンツ量",
      "明確な見出し構造（H2, H3の適切な使用）",
      "FAQ形式での質問回答（各200文字以上）",
      "独自の視点や実体験の盛り込み",
      "読みやすい段落構成と適切な改行",
      "内部リンクと外部リンクのバランス",
    ],
  },
  {
    id: "tips",
    title: "記事作成のコツ",
    icon: LightbulbIcon,
    color: "#9B51E0",
    items: [
      "ターゲットキーワードを自然に配置",
      "最初の段落で記事の結論を提示",
      "具体的な数値やデータを含める",
      "ユーザーの検索意図を満たす内容",
      "定期的な更新で鮮度を保つ",
      "画像のalt属性を適切に設定",
    ],
  },
];

export function SeoInsightsBrowse() {
  return (
    <Flex
      direction="column"
      gap={6}
      py={8}
      className={css({
        animation: "slideIn 0.3s ease",
      })}
    >
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

      <Box
        className={css({
          overflowX: "auto",
          WebkitOverflowScrolling: "touch",
          scrollbarWidth: "none",
          "&::-webkit-scrollbar": {
            display: "none",
          },
        })}
      >
        <Flex gap={4} px={4} minW="max-content">
          {insights.map((insight) => (
            <Box
              key={insight.id}
              className={css({
                minW: "360px",
                bg: "bg.card",
                borderRadius: "card",
                boxShadow: "card",
                p: 6,
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

              <VStack gap={2} alignItems="stretch">
                {insight.items.map((item, index) => (
                  <Flex
                    key={index}
                    gap={2}
                    className={css({
                      py: 2,
                      px: 3,
                      borderRadius: "md",
                      bg: "gray.50",
                      transition: "background 0.2s ease",
                      _hover: {
                        bg: "gray.100",
                      },
                    })}
                  >
                    <Box
                      className={css({
                        w: 5,
                        h: 5,
                        borderRadius: "full",
                        bg: insight.color,
                        flexShrink: 0,
                        mt: 0.5,
                      })}
                    />
                    <Text
                      className={css({
                        fontSize: "sm",
                        color: "text.secondary",
                        lineHeight: 1.6,
                      })}
                    >
                      {item}
                    </Text>
                  </Flex>
                ))}
              </VStack>
            </Box>
          ))}
        </Flex>
      </Box>
    </Flex>
  );
}
