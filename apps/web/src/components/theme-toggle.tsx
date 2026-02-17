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
        w: 16,
        h: 8,
        borderRadius: "full",
        bg: {
          base: "gray.300",
          _dark: "gray.600",
        },
        transition: "background-color 0.3s ease",
        cursor: "pointer",
        border: "2px solid",
        borderColor: {
          base: "gray.400",
          _dark: "gray.500",
        },
        outline: "none",
        _focusVisible: {
          ring: "2px",
          ringColor: "brand.DEFAULT",
          ringOffset: "2px",
        },
        _hover: {
          bg: {
            base: "gray.400",
            _dark: "gray.500",
          },
        },
      })}
    >
      <Flex
        align="center"
        justify="center"
        className={css({
          position: "absolute",
          top: "0.5",
          left: resolvedTheme === "dark" ? "8" : "0.5",
          w: 6,
          h: 6,
          borderRadius: "full",
          bg: "white",
          boxShadow: "md",
          transition: "left 0.3s ease",
        })}
      >
        {resolvedTheme === "dark" ? (
          <MoonIcon
            size={14}
            className={css({
              color: "gray.700",
            })}
          />
        ) : (
          <SunIcon
            size={14}
            className={css({
              color: "yellow.500",
            })}
          />
        )}
      </Flex>
    </button>
  );
}
