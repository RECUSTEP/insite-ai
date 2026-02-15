"use client";

import { Text } from "@/components/ui/text";
import type { LucideIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { css } from "styled-system/css";
import { Box, Flex, VStack } from "styled-system/jsx";

interface AnalysisStatsProps {
  type: "market" | "competitor" | "account";
  title: string;
  icon: LucideIcon;
  color: string;
  description: string;
  mode?: "focus" | "browse";
}

interface HistoryItem {
  aiType: string;
  createdAt: string;
  output: { output: string };
}

function extractSummaryPoints(markdownText: string, maxPoints: number = 3): string[] {
  const points: string[] = [];
  
  // **太字マーカー**を削除
  const cleanedText = markdownText.replace(/\*\*(.+?)\*\*/g, "$1");
  
  // 箇条書きを優先的に抽出
  const bulletRegex = /^[\s]*[-*]\s+(.+)$/gm;
  let match;
  while ((match = bulletRegex.exec(cleanedText)) !== null && points.length < maxPoints) {
    const point = match[1]?.trim().slice(0, 60);
    if (point && point.length > 10) {
      points.push(point + (point.length >= 60 ? "..." : ""));
    }
  }
  
  // 箇条書きが少ない場合、見出し直後のテキストを抽出
  if (points.length < 3) {
    const headingRegex = /^#{2,3}\s+(.+?)[\r\n]+(.+?)(?=\n\n|#{2,3}|$)/gms;
    while ((match = headingRegex.exec(cleanedText)) !== null && points.length < maxPoints) {
      const content = match[2]?.trim();
      if (content && content.length > 15) {
        const firstSentence = content.split(/[。\n]/)[0]?.trim().slice(0, 60);
        if (firstSentence && firstSentence.length > 10) {
          points.push(firstSentence + (firstSentence.endsWith("。") ? "" : "..."));
        }
      }
    }
  }
  
  // それでも足りない場合、段落の最初の文を抽出
  if (points.length < 2) {
    const paragraphs = cleanedText.split(/\n\n+/);
    for (const para of paragraphs) {
      if (points.length >= maxPoints) break;
      const cleaned = para.replace(/^#{1,6}\s+/, "").trim();
      if (cleaned.length > 15 && !cleaned.startsWith("-") && !cleaned.startsWith("*")) {
        const firstSentence = cleaned.split(/[。\n]/)[0]?.trim().slice(0, 60);
        if (firstSentence && firstSentence.length > 10) {
          points.push(firstSentence + (firstSentence.endsWith("。") ? "" : "..."));
        }
      }
    }
  }
  
  return points.slice(0, maxPoints);
}

export function AnalysisStats({ type, title, icon: Icon, color, description, mode = "browse" }: AnalysisStatsProps) {
  const [summaryPoints, setSummaryPoints] = useState<string[]>([]);
  const [hasData, setHasData] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("/api/history");

        if (response.ok) {
          const data = await response.json();
          const histories = data as Array<HistoryItem>;

          const filteredHistories = histories.filter((h) => h.aiType === type);

          if (filteredHistories.length > 0) {
            // 最新の分析結果を取得
            const latestHistory = filteredHistories.sort(
              (a, b) =>
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
            )[0];

            if (latestHistory?.output?.output) {
              const points = extractSummaryPoints(latestHistory.output.output);
              if (points.length > 0) {
                setSummaryPoints(points);
                setHasData(true);
              } else {
                // 要約抽出失敗時は最初の200文字を使用
                const fallback = latestHistory.output.output
                  .replace(/^#{1,6}\s+/gm, "")
                  .replace(/[-*]\s+/g, "")
                  .trim()
                  .slice(0, 200);
                if (fallback) {
                  setSummaryPoints([fallback + "..."]);
                  setHasData(true);
                }
              }
            }
          }
        }
      } catch (error) {
        console.error("Failed to fetch analysis stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [type]);

  const cardStyles = mode === "browse" 
    ? {
        minW: "280px",
        maxW: "280px",
        h: "300px",
      }
    : {
        flex: 1,
        minW: "380px",
        h: "380px",
      };

  if (loading) {
    return (
      <Box
        className={css({
          ...cardStyles,
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
        ...cardStyles,
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
          transform: mode === "browse" ? "translateY(-4px)" : "none",
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

      {/* 分析結果の要約 */}
      {hasData ? (
        <VStack
          flex={1}
          gap={mode === "browse" ? 1.5 : 3}
          alignItems="stretch"
          className={css({
            borderRadius: "md",
            bg: "gray.50",
            p: mode === "browse" ? 3 : 6,
            overflowY: mode === "browse" ? "auto" : "hidden",
          })}
        >
          {summaryPoints.map((point, index) => (
            <Box
              key={index}
              className={css({
                py: mode === "browse" ? 1.5 : 3,
                px: mode === "browse" ? 2 : 5,
                borderRadius: "md",
                bg: "white",
                transition: "background 0.2s ease",
                _hover: {
                  bg: "gray.100",
                },
              })}
            >
              <Text
                className={css({
                  fontSize: mode === "browse" ? "xs" : "md",
                  color: "text.secondary",
                  lineHeight: 1.6,
                })}
              >
                {point}
              </Text>
            </Box>
          ))}
        </VStack>
      ) : (
        <Box
          flex={1}
          className={css({
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "md",
            bg: "gray.50",
            p: 6,
            textAlign: "center",
          })}
        >
          <Icon
            size={48}
            className={css({
              color: color,
              opacity: 0.3,
              mb: 3,
            })}
          />
          <Text
            className={css({
              fontSize: "md",
              fontWeight: 600,
              color: "text.primary",
              mb: 2,
            })}
          >
            まだ実行されていません
          </Text>
          <Text
            className={css({
              fontSize: "sm",
              color: "text.muted",
              lineHeight: 1.6,
            })}
          >
            この分析を実行すると、
            <br />
            ここに最新の結果が表示されます
          </Text>
        </Box>
      )}
    </Box>
  );
}
