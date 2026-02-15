"use client";

import { BarChartIcon, TrendingUpIcon, UsersIcon } from "lucide-react";
import { css } from "styled-system/css";
import { Box, Flex } from "styled-system/jsx";
import { AnalysisStats } from "./analysis-stats";

interface BrowseModeLayoutProps {
  children: React.ReactNode;
}

const analysisCards = [
  {
    id: "market" as const,
    title: "市場トレンド",
    icon: TrendingUpIcon,
    color: "#2F80ED",
    description: "話題のキーワードと投稿数推移",
  },
  {
    id: "competitor" as const,
    title: "競合動向",
    icon: UsersIcon,
    color: "#27AE60",
    description: "競合店の最新投稿とフォロワー数",
  },
  {
    id: "account" as const,
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
        <Flex gap={4} px={4} minW="max-content">
          {analysisCards.map((card) => (
            <AnalysisStats
              key={card.id}
              type={card.id}
              title={card.title}
              icon={card.icon}
              color={card.color}
              description={card.description}
            />
          ))}
        </Flex>
      </Box>

      <Box px={4}>{children}</Box>
    </Flex>
  );
}
