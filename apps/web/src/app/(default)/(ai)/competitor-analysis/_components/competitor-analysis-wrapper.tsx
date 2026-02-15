"use client";

import { css } from "styled-system/css";
import { Box } from "styled-system/jsx";

interface CompetitorAnalysisWrapperProps {
  children: React.ReactNode;
}

export function CompetitorAnalysisWrapper({ children }: CompetitorAnalysisWrapperProps) {
  return (
    <Box
      px={4}
      py={8}
      maxW="1400px"
      mx="auto"
      w="full"
      className={css({
        animation: "fadeIn 0.4s ease",
      })}
    >
      {children}
    </Box>
  );
}
