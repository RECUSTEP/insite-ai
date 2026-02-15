"use client";

import { UiModeProvider, useUiMode } from "@/contexts/ui-mode-context";
import { BrowseModeLayout } from "./browse-mode-layout";
import { FocusModeLayout } from "./focus-mode-layout";
import { ModeSwitcher } from "./mode-switcher";

interface CompetitorAnalysisWrapperProps {
  children: React.ReactNode;
}

function CompetitorAnalysisContent({ children }: CompetitorAnalysisWrapperProps) {
  const { mode } = useUiMode();

  return (
    <>
      <ModeSwitcher />
      {mode === "focus" ? (
        <FocusModeLayout>{children}</FocusModeLayout>
      ) : (
        <BrowseModeLayout>{children}</BrowseModeLayout>
      )}
    </>
  );
}

export function CompetitorAnalysisWrapper({ children }: CompetitorAnalysisWrapperProps) {
  return (
    <UiModeProvider>
      <CompetitorAnalysisContent>{children}</CompetitorAnalysisContent>
    </UiModeProvider>
  );
}
