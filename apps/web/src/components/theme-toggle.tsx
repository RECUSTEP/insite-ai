"use client";

import { useTheme } from "@/hooks/use-theme";
import { MoonIcon, SunIcon } from "lucide-react";
import { css } from "styled-system/css";
import { Box, Flex } from "styled-system/jsx";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label="テーマを切り替え"
      className={css({
        position: "relative",
        w: 14,
        h: 7,
        borderRadius: "full",
        bg: {
          base: "gray.200",
          _dark: "gray.700",
        },
        transition: "background-color 0.3s ease",
        cursor: "pointer",
        border: "none",
        outline: "none",
        _focusVisible: {
          ring: "2px",
          ringColor: "brand.DEFAULT",
          ringOffset: "2px",
        },
      })}
    >
      <Flex
        align="center"
        justify="center"
        className={css({
          position: "absolute",
          top: "1",
          left: resolvedTheme === "dark" ? "7.5" : "1",
          w: 5,
          h: 5,
          borderRadius: "full",
          bg: "white",
          boxShadow: "sm",
          transition: "left 0.3s ease",
        })}
      >
        {resolvedTheme === "dark" ? (
          <MoonIcon
            size={12}
            className={css({
              color: "gray.700",
            })}
          />
        ) : (
          <SunIcon
            size={12}
            className={css({
              color: "yellow.500",
            })}
          />
        )}
      </Flex>
    </button>
  );
}
