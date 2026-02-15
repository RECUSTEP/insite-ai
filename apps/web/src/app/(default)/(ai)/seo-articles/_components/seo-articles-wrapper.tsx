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
      <SeoInsightsBrowse mode="browse" />
      {children}
    </>
  );
}
