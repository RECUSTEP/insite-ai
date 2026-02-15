"use client";

import { useUiMode } from "@/contexts/ui-mode-context";
import { css } from "styled-system/css";
import { Box, Flex } from "styled-system/jsx";
import { SeoInsightsBrowse } from "./seo-insights-browse";

interface SeoArticlesWrapperProps {
  children: React.ReactNode;
}

export function SeoArticlesWrapper({ children }: SeoArticlesWrapperProps) {
  const { mode } = useUiMode();

  return (
    <>
      {mode === "focus" ? (
        <Flex
          direction="column"
          align="center"
          gap={6}
          className={css({
            animation: "slideIn 0.3s ease",
          })}
        >
          <SeoInsightsBrowse mode="focus" />
          <Box maxW="1600px" w="full" px={4}>
            {children}
          </Box>
        </Flex>
      ) : (
        <>
          <SeoInsightsBrowse mode="browse" />
          {children}
        </>
      )}
    </>
  );
}
