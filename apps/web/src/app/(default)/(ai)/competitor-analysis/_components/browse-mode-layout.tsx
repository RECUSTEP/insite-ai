"use client";

import { Text } from "@/components/ui/text";
import { BarChartIcon, TrendingUpIcon, UsersIcon } from "lucide-react";
import { css } from "styled-system/css";
import { Box, Flex, HStack } from "styled-system/jsx";

interface BrowseModeLayoutProps {
  children: React.ReactNode;
}

const analysisCards = [
  {
    id: "market",
    title: "市場トレンド",
    icon: TrendingUpIcon,
    color: "#2F80ED",
    description: "話題のキーワードと投稿数推移",
  },
  {
    id: "competitor",
    title: "競合動向",
    icon: UsersIcon,
    color: "#27AE60",
    description: "競合店の最新投稿とフォロワー数",
  },
  {
    id: "account",
    title: "自社アカウント",
    icon: BarChartIcon,
    color: "#9B51E0",
    description: "フォロワー増減とエンゲージメント率",
  },
];

export function BrowseModeLayout({ children }: BrowseModeLayoutProps) {
  return (
    <Flex
      direction="column"
      gap={6}
      py={8}
      className={css({
        animation: "slideIn 0.3s ease",
      })}
    >
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
        <HStack gap={4} px={4} minW="max-content">
          {analysisCards.map((card) => (
            <Box
              key={card.id}
              className={css({
                minW: "320px",
                h: "400px",
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
                    bg: `${card.color}20`,
                  })}
                >
                  <card.icon
                    size={24}
                    className={css({
                      color: card.color,
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
                  {card.title}
                </Text>
              </Flex>
              <Text
                className={css({
                  color: "text.secondary",
                  fontSize: "sm",
                })}
              >
                {card.description}
              </Text>
              <Box
                flex={1}
                className={css({
                  borderRadius: "md",
                  bg: "gray.50",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "text.muted",
                  fontSize: "sm",
                })}
              >
                データを表示
              </Box>
            </Box>
          ))}
        </HStack>
      </Box>

      <Box px={4}>{children}</Box>
    </Flex>
  );
}
