"use client";

import { useState } from "react";
import { css } from "styled-system/css";
import { Box, Flex } from "styled-system/jsx";
import { ConsultChat } from "./consult-chat";
import { ConsultingHistory } from "./consulting-history";
import { HistoryIcon, XIcon } from "lucide-react";

type Props = {
  projectId?: string;
  children?: React.ReactNode;
};

export function ConsultingPageClient({ projectId, children }: Props) {
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [historyRefreshKey, setHistoryRefreshKey] = useState(0);
  const [mobileHistoryOpen, setMobileHistoryOpen] = useState(false);

  const handleSessionCreated = (sessionId: string) => {
    setSelectedSessionId(sessionId);
    setHistoryRefreshKey((k) => k + 1);
  };

  const handleSelectSession = (sessionId: string) => {
    setSelectedSessionId(sessionId);
    setMobileHistoryOpen(false);
  };

  return (
    <Flex gap={6} align="flex-start" direction={{ base: "column", xl: "row" }}>
      <Flex direction="column" gap={4} flex="1" minW={0}>
        {children}

        {/* Mobile: 履歴ボタン */}
        <Box display={{ base: "flex", xl: "none" }} justifyContent="flex-end">
          <button
            type="button"
            onClick={() => setMobileHistoryOpen(true)}
            className={css({
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              px: 3,
              py: 2,
              borderRadius: "8px",
              border: "1px solid",
              borderColor: { base: "#E4E4E7", _dark: "#27272A" },
              bg: "bg.card",
              color: "text.secondary",
              fontSize: "sm",
              cursor: "pointer",
              _hover: { borderColor: "brand.DEFAULT", color: "brand.DEFAULT" },
            })}
          >
            <HistoryIcon size={15} />
            会話履歴
          </button>
        </Box>

        <ConsultChat
          projectId={projectId}
          selectedSessionId={selectedSessionId}
          onSessionCreated={handleSessionCreated}
        />
      </Flex>

      {/* Desktop: サイドバー */}
      <Box display={{ base: "none", xl: "block" }}>
        <ConsultingHistory
          selectedSessionId={selectedSessionId}
          onSelectSession={handleSelectSession}
          refreshKey={historyRefreshKey}
        />
      </Box>

      {/* Mobile: ドロワー */}
      {mobileHistoryOpen && (
        <Box
          position="fixed"
          inset={0}
          zIndex={50}
          display={{ xl: "none" }}
        >
          {/* Backdrop */}
          <Box
            position="absolute"
            inset={0}
            bg="rgba(0,0,0,0.4)"
            onClick={() => setMobileHistoryOpen(false)}
          />
          {/* Drawer */}
          <Box
            position="absolute"
            right={0}
            top={0}
            bottom={0}
            w="80vw"
            maxW="320px"
            className={css({
              bg: "bg.base",
              boxShadow: "-4px 0 24px rgba(0,0,0,0.15)",
              display: "flex",
              flexDirection: "column",
            })}
          >
            {/* Drawer header */}
            <Flex
              justify="space-between"
              align="center"
              px={4}
              py={3}
              className={css({
                borderBottom: "1px solid",
                borderColor: { base: "#E4E4E7", _dark: "#27272A" },
              })}
            >
              <span className={css({ fontWeight: 600, fontSize: "sm", color: "text.primary" })}>
                会話履歴
              </span>
              <button
                type="button"
                onClick={() => setMobileHistoryOpen(false)}
                className={css({ color: "text.muted", cursor: "pointer", _hover: { color: "text.primary" } })}
              >
                <XIcon size={18} />
              </button>
            </Flex>
            <Box flex={1} overflow="hidden">
              <ConsultingHistory
                selectedSessionId={selectedSessionId}
                onSelectSession={handleSelectSession}
                refreshKey={historyRefreshKey}
                mobile
              />
            </Box>
          </Box>
        </Box>
      )}
    </Flex>
  );
}
