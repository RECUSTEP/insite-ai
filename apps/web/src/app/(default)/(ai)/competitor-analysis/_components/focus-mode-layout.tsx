"use client";

import { BarChartIcon, TrendingUpIcon, UsersIcon } from "lucide-react";
import { css } from "styled-system/css";
import { Box, Flex, VStack } from "styled-system/jsx";
import { AnalysisStats } from "./analysis-stats";

interface FocusModeLayoutProps {
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

export function FocusModeLayout({ children }: FocusModeLayoutProps) {
  return (
    <Flex
      direction="column"
      align="center"
      justify="flex-start"
      minH="calc(100vh - 200px)"
      px={4}
      py={8}
      gap={6}
      className={css({
        animation: "slideIn 0.3s ease",
      })}
    >
      {/* 分析結果カード（PC向け、横スクロールなし） */}
      <VStack gap={4} w="full" maxW="1200px">
        {analysisCards.map((card) => (
          <AnalysisStats
            key={card.id}
            type={card.id}
            title={card.title}
            icon={card.icon}
            color={card.color}
            description={card.description}
            mode="focus"
          />
        ))}
      </VStack>

      <Box
        maxW="800px"
        w="full"
        className={css({
          bg: "bg.card",
          borderRadius: "card",
          boxShadow: "card",
          p: { base: 4, md: 8 },
        })}
      >
        {children}
      </Box>
    </Flex>
  );
}
