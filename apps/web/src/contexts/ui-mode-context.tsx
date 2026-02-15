"use client";

import { createContext, useContext, useEffect, useState } from "react";

type UiMode = "focus" | "browse";

interface UiModeContextValue {
  mode: UiMode;
  setMode: (mode: UiMode) => void;
}

const UiModeContext = createContext<UiModeContextValue | undefined>(undefined);

const STORAGE_KEY = "ui-mode-preference";

export function UiModeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<UiMode>("focus");
  const [isInitialized, setIsInitialized] = useState(false);

  // localStorage から初期値を読み込む
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "focus" || stored === "browse") {
      setModeState(stored);
    }
    setIsInitialized(true);
  }, []);

  // モード変更時に localStorage に保存
  const setMode = (newMode: UiMode) => {
    setModeState(newMode);
    localStorage.setItem(STORAGE_KEY, newMode);
  };

  // 初期化完了まで children をレンダリングしない（ちらつき防止）
  if (!isInitialized) {
    return null;
  }

  return <UiModeContext.Provider value={{ mode, setMode }}>{children}</UiModeContext.Provider>;
}

export function useUiMode() {
  const context = useContext(UiModeContext);
  if (context === undefined) {
    throw new Error("useUiMode must be used within a UiModeProvider");
  }
  return context;
}
