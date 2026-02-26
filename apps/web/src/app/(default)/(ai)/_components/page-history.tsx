"use client";

import { aiTypeMap } from "@/constants/api";
import { ExternalLinkIcon, HistoryIcon } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { css } from "styled-system/css";
import { Box, Flex, Stack } from "styled-system/jsx";

type HistoryEntry = {
  id: string;
  aiType: keyof typeof aiTypeMap;
  input: { instruction?: string; image?: string };
  output: { output: string };
  createdAt: number;
};

type Props = {
  aiTypes: string[];
};

const cardStyle = {
  bg: "bg.card",
  border: "1px solid",
  borderColor: { base: "#E4E4E7", _dark: "#27272A" },
  borderRadius: "12px",
  p: 4,
  w: "full",
} as const;

const cardCss = css(cardStyle);

function SkeletonItem() {
  return (
    <Box
      className={css({
        bg: "bg.card",
        border: "1px solid",
        borderColor: { base: "#E4E4E7", _dark: "#27272A" },
        borderRadius: "12px",
        p: 4,
        w: "full",
      })}
    >
      <Box
        className={css({
          h: "10px",
          w: "60%",
          bg: { base: "#E4E4E7", _dark: "#27272A" },
          borderRadius: "4px",
          mb: 2,
          animation: "pulse 1.5s ease-in-out infinite",
        })}
      />
      <Box
        className={css({
          h: "10px",
          w: "90%",
          bg: { base: "#E4E4E7", _dark: "#27272A" },
          borderRadius: "4px",
        })}
      />
    </Box>
  );
}

export function PageHistory({ aiTypes }: Props) {
  const [histories, setHistories] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/history")
      .then((res) => {
        if (!res.ok) return [] as HistoryEntry[];
        return res.json() as Promise<HistoryEntry[]>;
      })
      .then((data) => {
        const filtered = data
          .filter((h) => aiTypes.includes(h.aiType))
          .sort((a, b) => b.createdAt - a.createdAt)
          .slice(0, 20);
        setHistories(filtered);
      })
      .catch(() => setHistories([]))
      .finally(() => setLoading(false));
  }, [aiTypes.join(",")]);

  return (
    <Box
      className={css({
        w: { base: "full", xl: "260px" },
        flexShrink: 0,
        position: { xl: "sticky" },
        top: { xl: "80px" },
        alignSelf: { xl: "flex-start" },
      })}
    >
      <Stack gap="3">
        <Flex align="center" gap="2">
          <HistoryIcon
            size={14}
            className={css({ color: "text.secondary" })}
          />
          <span
            className={css({
              fontSize: "xs",
              fontWeight: 600,
              letterSpacing: "0.05em",
              textTransform: "uppercase",
              color: "text.secondary",
            })}
          >
            この機能の履歴
          </span>
        </Flex>

        <Stack gap="2">
          {loading ? (
            <>
              <SkeletonItem />
              <SkeletonItem />
              <SkeletonItem />
            </>
          ) : histories.length === 0 ? (
            <Box
              className={css({
                bg: "bg.card",
                border: "1px solid",
                borderColor: { base: "#E4E4E7", _dark: "#27272A" },
                borderRadius: "12px",
                p: 4,
                textAlign: "center",
              })}
            >
              <span
                className={css({
                  fontSize: "sm",
                  color: "text.muted",
                })}
              >
                まだ利用履歴がありません
              </span>
            </Box>
          ) : (
            histories.map((h) => (
              <Link key={h.id} href={`/history/${h.id}`}>
                <Box
                  className={css({
                    ...cardStyle,
                    transition: "border-color 0.15s ease, background 0.15s ease",
                    _hover: {
                      borderColor: { base: "#D4D4D8", _dark: "#3F3F46" },
                      bg: { base: "#FAFAFA", _dark: "#1C1C1F" },
                    },
                    cursor: "pointer",
                  })}
                >
                  <Flex justify="space-between" align="flex-start" gap="2">
                    <Stack gap="1" minW={0}>
                      <span
                        className={css({
                          fontSize: "xs",
                          color: "text.muted",
                          display: "block",
                        })}
                      >
                        {new Date(h.createdAt).toLocaleString("ja", {
                          dateStyle: "short",
                          timeStyle: "short",
                        })}
                      </span>
                      <span
                        className={css({
                          fontSize: "sm",
                          color: "text.primary",
                          display: "block",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        })}
                      >
                        {h.output.output.slice(0, 60) || "（出力なし）"}
                      </span>
                      {h.input.instruction && (
                        <span
                          className={css({
                            fontSize: "xs",
                            color: "text.secondary",
                            display: "block",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          })}
                        >
                          {h.input.instruction.slice(0, 40)}
                        </span>
                      )}
                    </Stack>
                    <ExternalLinkIcon
                      size={14}
                      className={css({
                        color: "text.muted",
                        flexShrink: 0,
                        mt: "1",
                      })}
                    />
                  </Flex>
                </Box>
              </Link>
            ))
          )}
        </Stack>
      </Stack>
    </Box>
  );
}
