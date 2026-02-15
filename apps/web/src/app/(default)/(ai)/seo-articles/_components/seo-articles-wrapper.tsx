"use client";

import { useUiMode } from "@/contexts/ui-mode-context";
import { SeoInsightsBrowse } from "./seo-insights-browse";

interface SeoArticlesWrapperProps {
  children: React.ReactNode;
}

export function SeoArticlesWrapper({ children }: SeoArticlesWrapperProps) {
  const { mode } = useUiMode();

  return (
    <>
      {mode === "focus" ? (
        <>{children}</>
      ) : (
        <>
          <SeoInsightsBrowse />
          {children}
        </>
      )}
    </>
  );
}
