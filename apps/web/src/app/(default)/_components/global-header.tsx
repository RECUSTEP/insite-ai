"use client";

import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { BellIcon } from "lucide-react";
import Link from "next/link";
import { css } from "styled-system/css";
import { Box, Flex } from "styled-system/jsx";
import { Logout } from "./logout";

export function GlobalHeader() {
  return (
    <Box
      className={css({
        position: "fixed",
        top: { base: 12, md: 0 },
        left: 0,
        right: 0,
        zIndex: 40,
        bg: "bg.base",
        borderBottom: "1px solid",
        borderColor: { base: "#E4E4E7", _dark: "#27272A" },
      })}
    >
      <Flex
        justify="space-between"
        align="center"
        gap={2}
        px={4}
        py={2.5}
      >
        <Link href="/home">
          <span
            className={css({
              fontSize: "sm",
              fontWeight: 700,
              letterSpacing: "0.08em",
              color: "text.primary",
              userSelect: "none",
            })}
          >
            INSITE AI
          </span>
        </Link>
        <Flex align="center" gap={2}>
        <Link href="/announce">
          <Button
            size="sm"
            variant="ghost"
            className={css({
              gap: 1.5,
              color: "text.secondary",
              _hover: {
                bg: { base: "#F4F4F5", _dark: "#27272A" },
                color: "text.primary",
              },
            })}
          >
            <BellIcon size={16} />
            <Box display={{ base: "none", md: "inline" }} fontSize="sm">お知らせ</Box>
          </Button>
        </Link>
        <ThemeToggle />
        <Logout />
        </Flex>
      </Flex>
    </Box>
  );
}
