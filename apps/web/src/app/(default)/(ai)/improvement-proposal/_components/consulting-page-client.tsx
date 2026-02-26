"use client";

import { useState } from "react";
import { Flex } from "styled-system/jsx";
import { ConsultChat } from "./consult-chat";
import { ConsultingHistory } from "./consulting-history";

type Props = {
  projectId?: string;
  children?: React.ReactNode;
};

export function ConsultingPageClient({ projectId, children }: Props) {
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [historyRefreshKey, setHistoryRefreshKey] = useState(0);

  const handleSessionCreated = (sessionId: string) => {
    setSelectedSessionId(sessionId);
    setHistoryRefreshKey((k) => k + 1);
  };

  const handleSelectSession = (sessionId: string) => {
    setSelectedSessionId(sessionId);
  };

  return (
    <Flex gap={8} align="flex-start">
      <Flex direction="column" gap={4} flex="1" minW={0}>
        {children}
        <ConsultChat
          projectId={projectId}
          selectedSessionId={selectedSessionId}
          onSessionCreated={handleSessionCreated}
        />
      </Flex>
      <ConsultingHistory
        selectedSessionId={selectedSessionId}
        onSelectSession={handleSelectSession}
        refreshKey={historyRefreshKey}
      />
    </Flex>
  );
}
