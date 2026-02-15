"use client";

import { Button } from "@/components/ui/button";
import { useUiMode } from "@/contexts/ui-mode-context";
import { ColumnsIcon, LayoutGridIcon } from "lucide-react";
import { css } from "styled-system/css";
import { Flex } from "styled-system/jsx";

export function ModeSwitcher() {
  const { mode, setMode } = useUiMode();

  return (
    <div
      className={css({
        position: "fixed",
        top: { base: "auto", md: 24 },
        bottom: { base: 24, md: "auto" },
        right: { base: "50%", md: 24 },
        transform: { base: "translateX(50%)", md: "none" },
        zIndex: 50,
        bg: "bg.card",
        borderRadius: "button",
        boxShadow: "float",
        p: 1,
      })}
    >
      <Flex gap={1}>
        <Button
          variant={mode === "focus" ? "solid" : "ghost"}
          size="sm"
          onClick={() => setMode("focus")}
          className={css({
            display: "flex",
            alignItems: "center",
            gap: 2,
            transition: "all 0.2s ease",
            bg: mode === "focus" ? "brand.DEFAULT" : "transparent",
            color: mode === "focus" ? "white" : "text.secondary",
            _hover: {
              bg: mode === "focus" ? "brand.dark" : "gray.100",
            },
          })}
        >
          <LayoutGridIcon size={16} />
          <span className={css({ display: { base: "none", md: "inline" } })}>作業集中</span>
        </Button>
        <Button
          variant={mode === "browse" ? "solid" : "ghost"}
          size="sm"
          onClick={() => setMode("browse")}
          className={css({
            display: "flex",
            alignItems: "center",
            gap: 2,
            transition: "all 0.2s ease",
            bg: mode === "browse" ? "brand.DEFAULT" : "transparent",
            color: mode === "browse" ? "white" : "text.secondary",
            _hover: {
              bg: mode === "browse" ? "brand.dark" : "gray.100",
            },
          })}
        >
          <ColumnsIcon size={16} />
          <span className={css({ display: { base: "none", md: "inline" } })}>情報確認</span>
        </Button>
      </Flex>
    </div>
  );
}
