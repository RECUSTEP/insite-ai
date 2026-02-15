"use client";

import { useUiMode } from "@/contexts/ui-mode-context";
import { BrowseModeLayout } from "./browse-mode-layout";
import { FocusModeLayout } from "./focus-mode-layout";

interface CompetitorAnalysisWrapperProps {
  children: React.ReactNode;
}

export function CompetitorAnalysisWrapper({ children }: CompetitorAnalysisWrapperProps) {
  const { mode } = useUiMode();

  return (
    <>
      {mode === "focus" ? (
        <FocusModeLayout>{children}</FocusModeLayout>
      ) : (
        <BrowseModeLayout>{children}</BrowseModeLayout>
      )}
    </>
  );
}
