"use client";

import { HistoryIcon, HomeIcon, NotebookPenIcon, TrendingUpIcon } from "lucide-react";
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
    icon: NotebookPenIcon,
    label: "ライティング",
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
        bg: "bg.card",
        borderTop: "1px solid",
        borderColor: "gray.200",
        boxShadow: "0 -2px 8px rgba(0, 0, 0, 0.08)",
        zIndex: 40,
      })}
    >
      <Flex justify="space-around" py={2}>
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link key={item.path} href={item.path}>
              <Flex
                direction="column"
                align="center"
                gap={1}
                px={4}
                py={2}
                className={css({
                  transition: "all 0.2s ease",
                  color: isActive ? "brand.DEFAULT" : "text.secondary",
                  _hover: {
                    color: "brand.DEFAULT",
                    transform: "scale(1.05)",
                  },
                })}
              >
                <item.icon size={24} />
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
