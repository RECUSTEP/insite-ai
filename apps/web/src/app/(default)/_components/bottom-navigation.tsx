"use client";

import { HistoryIcon, HomeIcon, Instagram, TrendingUpIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { css } from "styled-system/css";
import { Box, Flex } from "styled-system/jsx";

const navItems = [
  {
    icon: HomeIcon,
    label: "ホーム",
    path: "/home",
  },
  {
    icon: TrendingUpIcon,
    label: "分析",
    path: "/competitor-analysis",
  },
  {
    icon: Instagram,
    label: "Instagram",
    path: "/writing",
  },
  {
    icon: HistoryIcon,
    label: "履歴",
    path: "/history",
  },
];

export function BottomNavigation() {
  const pathname = usePathname();

  return (
    <Box
      className={css({
        display: { base: "block", md: "none" },
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        bg: "bg.base",
        borderTop: "1px solid",
        borderColor: { base: "#E4E4E7", _dark: "#27272A" },
        zIndex: 40,
      })}
    >
      <Flex justify="space-around" py={1}>
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link key={item.path} href={item.path}>
              <Flex
                direction="column"
                align="center"
                gap={0.5}
                px={5}
                py={2}
                className={css({
                  transition: "all 0.15s ease",
                  color: isActive ? "text.primary" : "text.muted",
                  borderRadius: "8px",
                  _hover: {
                    color: "text.primary",
                  },
                })}
              >
                <Box
                  className={css({
                    w: 8,
                    h: 8,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: "8px",
                    bg: isActive ? { base: "#F4F4F5", _dark: "#27272A" } : "transparent",
                  })}
                >
                  <item.icon size={20} />
                </Box>
                <span
                  className={css({
                    fontSize: "xs",
                    fontWeight: isActive ? 600 : 400,
                  })}
                >
                  {item.label}
                </span>
              </Flex>
            </Link>
          );
        })}
      </Flex>
    </Box>
  );
}
