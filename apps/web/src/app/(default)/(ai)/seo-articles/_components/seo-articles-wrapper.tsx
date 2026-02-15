"use client";

import { SeoInsightsBrowse } from "./seo-insights-browse";

interface SeoArticlesWrapperProps {
  children: React.ReactNode;
}

export function SeoArticlesWrapper({ children }: SeoArticlesWrapperProps) {
  return (
    <>
      <SeoInsightsBrowse />
      {children}
    </>
  );
}
