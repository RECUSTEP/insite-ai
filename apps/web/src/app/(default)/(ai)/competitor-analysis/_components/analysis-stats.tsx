"use client";

import { Text } from "@/components/ui/text";
import type { LucideIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { css } from "styled-system/css";
import { Box, Flex } from "styled-system/jsx";

interface AnalysisStatsProps {
  type: "market" | "competitor" | "account";
  title: string;
  icon: LucideIcon;
  color: string;
  description: string;
}

interface Stats {
  totalCount: number;
  thisMonthCount: number;
  lastUsed: string | null;
}

export function AnalysisStats({ type, title, icon: Icon, color, description }: AnalysisStatsProps) {
  const [stats, setStats] = useState<Stats>({
    totalCount: 0,
    thisMonthCount: 0,
    lastUsed: null,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("/api/history");

        if (response.ok) {
          const data = await response.json();
          const histories = data as Array<{ aiType: string; createdAt: string }>;
          const now = new Date();
          const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

          const filteredHistories = histories.filter((h) => h.aiType === type);

          const totalCount = filteredHistories.length;
          const thisMonthCount = filteredHistories.filter(
            (h) => new Date(h.createdAt) >= thisMonthStart,
          ).length;

          let lastUsed: string | null = null;
          if (filteredHistories.length > 0) {
            const lastHistory = filteredHistories.sort(
              (a, b) =>
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
            )[0];
            if (lastHistory) {
              const lastDate = new Date(lastHistory.createdAt);
              const diffDays = Math.floor((now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
              lastUsed = diffDays === 0 ? "今日" : diffDays === 1 ? "昨日" : `${diffDays}日前`;
            }
          }

          setStats({ totalCount, thisMonthCount, lastUsed });
        }
      } catch (error) {
        console.error("Failed to fetch analysis stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [type]);

  if (loading) {
    return (
      <Box
        className={css({
          minW: "320px",
          h: "400px",
          bg: "bg.card",
          borderRadius: "card",
          boxShadow: "card",
          p: 6,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        })}
      >
        <Text
          className={css({
            color: "text.muted",
            fontSize: "sm",
          })}
        >
          読み込み中...
        </Text>
      </Box>
    );
  }

  return (
    <Box
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
            bg: `${color}20`,
          })}
        >
          <Icon
            size={24}
            className={css({
              color: color,
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
          {title}
        </Text>
      </Flex>
      <Text
        className={css({
          color: "text.secondary",
          fontSize: "sm",
        })}
      >
        {description}
      </Text>

      {/* 統計情報 */}
      <Flex
        flex={1}
        direction="column"
        gap={3}
        className={css({
          borderRadius: "md",
          bg: "gray.50",
          p: 4,
        })}
      >
        <Box>
          <Text
            className={css({
              fontSize: "xs",
              color: "text.muted",
              mb: 1,
            })}
          >
            総実行回数
          </Text>
          <Text
            className={css({
              fontSize: "2xl",
              fontWeight: 700,
              color: color,
            })}
          >
            {stats.totalCount}回
          </Text>
        </Box>

        <Box>
          <Text
            className={css({
              fontSize: "xs",
              color: "text.muted",
              mb: 1,
            })}
          >
            今月の実行回数
          </Text>
          <Text
            className={css({
              fontSize: "xl",
              fontWeight: 600,
              color: "text.primary",
            })}
          >
            {stats.thisMonthCount}回
          </Text>
        </Box>

        {stats.lastUsed && (
          <Box>
            <Text
              className={css({
                fontSize: "xs",
                color: "text.muted",
                mb: 1,
              })}
            >
              最終実行
            </Text>
            <Text
              className={css({
                fontSize: "md",
                fontWeight: 500,
                color: "text.secondary",
              })}
            >
              {stats.lastUsed}
            </Text>
          </Box>
        )}

        {stats.totalCount === 0 && (
          <Box pt={4}>
            <Text
              className={css({
                fontSize: "sm",
                color: "text.muted",
                textAlign: "center",
              })}
            >
              まだ実行されていません
            </Text>
          </Box>
        )}
      </Flex>
    </Box>
  );
}
