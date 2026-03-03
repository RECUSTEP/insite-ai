"use client";

import { MessageSquareIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { css } from "styled-system/css";
import { Box, Flex, Stack } from "styled-system/jsx";

type ChatSession = {
  id: string;
  title: string;
  updatedAt: number;
};

type Props = {
  selectedSessionId?: string | null;
  onSelectSession: (sessionId: string) => void;
  refreshKey?: number;
  mobile?: boolean;
};

function formatDate(timestamp: number) {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return date.toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" });
  }
  if (diffDays < 7) {
    return `${diffDays}日前`;
  }
  return date.toLocaleDateString("ja-JP", { month: "numeric", day: "numeric" });
}

export function ConsultingHistory({ selectedSessionId, onSelectSession, refreshKey, mobile }: Props) {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch("/api/chat-sessions")
      .then((res) => {
        if (!res.ok) return [];
        return res.json() as Promise<ChatSession[]>;
      })
      .then((data) => setSessions(Array.isArray(data) ? data : []))
      .catch(() => setSessions([]))
      .finally(() => setLoading(false));
  }, [refreshKey]);

  return (
    <Box
      w={mobile ? "full" : { base: "full", xl: "260px" }}
      flexShrink={0}
      className={css({
        bg: "bg.card",
        border: mobile ? "none" : "1px solid",
        borderColor: { base: "#E4E4E7", _dark: "#27272A" },
        borderRadius: mobile ? "0" : "16px",
        overflow: "hidden",
        height: mobile ? "100%" : "calc(100vh - 200px)",
        minH: mobile ? "0" : "500px",
        position: mobile ? "relative" : "sticky",
        top: mobile ? "0" : "80px",
      })}
    >
      {/* Header */}
      <Box
        px={4}
        py={3}
        className={css({
          borderBottom: "1px solid",
          borderColor: { base: "#E4E4E7", _dark: "#27272A" },
          bg: { base: "#FAFAFA", _dark: "#18181B" },
        })}
      >
        <Flex align="center" gap={2}>
          <MessageSquareIcon size={14} className={css({ color: "text.muted" })} />
          <span className={css({ fontSize: "xs", fontWeight: 600, color: "text.secondary", textTransform: "uppercase", letterSpacing: "0.05em" })}>
            会話履歴
          </span>
        </Flex>
      </Box>

      {/* Session list */}
      <Box overflowY="auto" h="calc(100% - 49px)" className={css({ scrollbarWidth: "thin" })}>
        {loading ? (
          <Stack gap={2} p={3}>
            {[1, 2, 3].map((i) => (
              <Box
                key={i}
                h={12}
                borderRadius="8px"
                className={css({
                  bg: { base: "#F4F4F5", _dark: "#27272A" },
                  animation: "pulse 1.5s ease infinite",
                })}
              />
            ))}
          </Stack>
        ) : sessions.length === 0 ? (
          <Flex align="center" justify="center" h="full" py={8}>
            <Stack gap={2} align="center">
              <MessageSquareIcon size={24} className={css({ color: "text.muted", opacity: 0.5 })} />
              <span className={css({ fontSize: "xs", color: "text.muted" })}>
                会話履歴がありません
              </span>
            </Stack>
          </Flex>
        ) : (
          <Stack gap={0} p={2}>
            {sessions.map((session) => {
              const isActive = session.id === selectedSessionId;
              return (
                <button
                  key={session.id}
                  type="button"
                  onClick={() => onSelectSession(session.id)}
                  className={css({
                    w: "full",
                    textAlign: "left",
                    px: 3,
                    py: 2.5,
                    borderRadius: "8px",
                    cursor: "pointer",
                    transition: "background 0.15s ease",
                    bg: isActive
                      ? { base: "#F4F4F5", _dark: "#27272A" }
                      : "transparent",
                    _hover: {
                      bg: { base: "#F4F4F5", _dark: "#27272A" },
                    },
                  })}
                >
                  <Flex direction="column" gap={0.5}>
                    <span
                      className={css({
                        fontSize: "sm",
                        fontWeight: isActive ? 600 : 400,
                        color: "text.primary",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        display: "block",
                      })}
                    >
                      {session.title}
                    </span>
                    <span className={css({ fontSize: "xs", color: "text.muted" })}>
                      {formatDate(session.updatedAt)}
                    </span>
                  </Flex>
                </button>
              );
            })}
          </Stack>
        )}
      </Box>
    </Box>
  );
}
