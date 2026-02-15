"use client";

import { css } from "styled-system/css";
import { Box, Flex } from "styled-system/jsx";
import { AnalysisStats } from "./analysis-stats";
import { BarChart3Icon, TrendingUpIcon, UserIcon } from "lucide-react";

interface CompetitorAnalysisWrapperProps {
  children: React.ReactNode;
}

const analysisCards = [
  {
    id: "market" as const,
    title: "市場トレンド",
    description: "話題のキーワードと投稿推移",
    icon: TrendingUpIcon,
    color: "#2F80ED",
  },
  {
    id: "competitor" as const,
    title: "競合動向",
    description: "競合店の最新投稿とフォロワー数",
    icon: BarChart3Icon,
    color: "#27AE60",
  },
  {
    id: "account" as const,
    title: "自社アカウント",
    description: "フォロワー増減とエンゲージメント率",
    icon: UserIcon,
    color: "#9B51E0",
  },
];

export function CompetitorAnalysisWrapper({ children }: CompetitorAnalysisWrapperProps) {
  return (
    <Flex
      direction="column"
      gap={6}
      py={8}
      className={css({
        animation: "fadeIn 0.4s ease",
      })}
    >
      {/* カード3枚を横並び（スクロールなし） */}
      <Flex gap={4} px={4} justify="center" flexWrap="wrap" maxW="1400px" mx="auto">
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

      <Box px={4} maxW="1400px" mx="auto" w="full">{children}</Box>
    </Flex>
  );
}
