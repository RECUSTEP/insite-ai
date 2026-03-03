"use client";

import { ChevronDownIcon, ChevronUpIcon, MessageSquareIcon } from "lucide-react";
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

export function ConsultingHistory({ selectedSessionId, onSelectSession, refreshKey }: Props) {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

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

  const sessionItems = loading ? (
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
    <Flex align="center" justify="center" py={8}>
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
            onClick={() => {
              onSelectSession(session.id);
              setMobileOpen(false);
            }}
            className={css({
              w: "full",
              textAlign: "left",
              px: 3,
              py: 2.5,
              borderRadius: "8px",
              cursor: "pointer",
              transition: "background 0.15s ease",
              bg: isActive ? { base: "#F4F4F5", _dark: "#27272A" } : "transparent",
              _hover: { bg: { base: "#F4F4F5", _dark: "#27272A" } },
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
  );

  const headerContent = (
    <Flex align="center" gap={2}>
      <MessageSquareIcon size={14} className={css({ color: "text.muted" })} />
      <span
        className={css({
          fontSize: "xs",
          fontWeight: 600,
          color: "text.secondary",
          textTransform: "uppercase",
          letterSpacing: "0.05em",
          flex: 1,
        })}
      >
        会話履歴
      </span>
    </Flex>
  );

  return (
    <>
      {/* Desktop: sticky sidebar */}
      <Box
        w="260px"
        flexShrink={0}
        display={{ base: "none", xl: "block" }}
        className={css({
          bg: "bg.card",
          border: "1px solid",
          borderColor: { base: "#E4E4E7", _dark: "#27272A" },
          borderRadius: "16px",
          overflow: "hidden",
          height: "calc(100vh - 200px)",
          minH: "500px",
          position: "sticky",
          top: "80px",
        })}
      >
        <Box
          px={4}
          py={3}
          className={css({
            borderBottom: "1px solid",
            borderColor: { base: "#E4E4E7", _dark: "#27272A" },
            bg: { base: "#FAFAFA", _dark: "#18181B" },
          })}
        >
          {headerContent}
        </Box>
        <Box overflowY="auto" h="calc(100% - 49px)" className={css({ scrollbarWidth: "thin" })}>
          {sessionItems}
        </Box>
      </Box>

      {/* Mobile: collapsible panel at the bottom */}
      <Box
        w="full"
        display={{ base: "block", xl: "none" }}
        className={css({
          bg: "bg.card",
          border: "1px solid",
          borderColor: { base: "#E4E4E7", _dark: "#27272A" },
          borderRadius: "16px",
          overflow: "hidden",
        })}
      >
        <button
          type="button"
          onClick={() => setMobileOpen((o) => !o)}
          className={css({
            w: "full",
            px: 4,
            py: 3,
            display: "flex",
            alignItems: "center",
            gap: 2,
            cursor: "pointer",
            bg: { base: "#FAFAFA", _dark: "#18181B" },
          })}
        >
          {headerContent}
          {mobileOpen ? (
            <ChevronUpIcon size={14} className={css({ color: "text.muted", flexShrink: 0 })} />
          ) : (
            <ChevronDownIcon size={14} className={css({ color: "text.muted", flexShrink: 0 })} />
          )}
        </button>
        {mobileOpen && (
          <Box
            maxH="240px"
            overflowY="auto"
            className={css({ scrollbarWidth: "thin" })}
          >
            {sessionItems}
          </Box>
        )}
      </Box>
    </>
  );
}
