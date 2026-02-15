"use client";

import { Tooltip } from "@/components/ui/tooltip";
import {
  FileTextIcon,
  HistoryIcon,
  HomeIcon,
  LockIcon,
  MapPinIcon,
  NotebookPenIcon,
  SettingsIcon,
  TrendingUpIcon,
  UserRoundSearchIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { css } from "styled-system/css";
import { Box, VStack } from "styled-system/jsx";

const navigation = [
  {
    icon: <HomeIcon size="20" />,
    label: "ホーム",
    path: "/home",
  },
  {
    icon: <UserRoundSearchIcon size="20" />,
    label: "分析AI",
    path: "/competitor-analysis",
  },
  {
    icon: <TrendingUpIcon size="20" />,
    label: "AI店舗運営",
    path: "/improvement-proposal",
  },
  {
    icon: <NotebookPenIcon size="20" />,
    label: "ライティングAI（Instagram）",
    path: "/writing",
  },
  {
    icon: <MapPinIcon size="20" />,
    label: "ライティングAI（Google Map）",
    path: "/google-map",
  },
  {
    icon: <HistoryIcon size="20" />,
    label: "履歴",
    path: "/history",
  },
  {
    icon: <SettingsIcon size="20" />,
    label: "設定",
    path: "/",
  },
] as const;

interface NavigationProps {
  seoAddonEnabled: boolean;
}

export function Navigation({ seoAddonEnabled }: NavigationProps) {
  const pathname = usePathname();

  return (
    <nav
      className={css({
        flex: 1,
        overflowY: "auto",
      })}
    >
      <ul>
        {navigation.map((item) => (
          <li key={item.path}>
            <Link
              href={item.path}
              className={css({
                display: "flex",
                alignItems: "center",
                gap: 4,
                p: 4,
                color: "text.primary",
                borderRadius: "md",
                transition: "all 0.2s ease",
                _currentPage: {
                  color: "brand.DEFAULT",
                  bg: "#EBF8FF",
                  fontWeight: 600,
                },
                _hover: {
                  bg: "gray.100",
                  transform: "scale(1.02)",
                  _currentPage: {
                    bg: "#EBF8FF",
                  },
                },
              })}
              aria-current={pathname === item.path ? "page" : undefined}
            >
              <Tooltip.Root positioning={{ placement: "left", strategy: "fixed" }} openDelay={200}>
                <Tooltip.Trigger asChild>
                  <span
                    className={css({
                      m: -4,
                      p: 4,
                      color: "brand.DEFAULT",
                    })}
                  >
                    {item.icon}
                  </span>
                </Tooltip.Trigger>
                <Tooltip.Positioner
                  css={{
                    ".group[data-expanded=true] &": {
                      display: "none",
                    },
                  }}
                >
                  <Tooltip.Arrow>
                    <Tooltip.ArrowTip />
                  </Tooltip.Arrow>
                  <Tooltip.Content>{item.label}</Tooltip.Content>
                </Tooltip.Positioner>
              </Tooltip.Root>
              {item.label}
            </Link>
          </li>
        ))}
        
        {/* SEO/AIO機能 */}
        <li>
          {seoAddonEnabled ? (
            <Link
              href="/seo-articles"
              className={css({
                display: "flex",
                alignItems: "center",
                gap: 4,
                p: 4,
                color: "text.primary",
                borderRadius: "md",
                transition: "all 0.2s ease",
                _currentPage: {
                  color: "brand.DEFAULT",
                  bg: "#EBF8FF",
                  fontWeight: 600,
                },
                _hover: {
                  bg: "gray.100",
                  transform: "scale(1.02)",
                  _currentPage: {
                    bg: "#EBF8FF",
                  },
                },
              })}
              aria-current={pathname === "/seo-articles" ? "page" : undefined}
            >
              <Tooltip.Root positioning={{ placement: "left", strategy: "fixed" }} openDelay={200}>
                <Tooltip.Trigger asChild>
                  <span
                    className={css({
                      m: -4,
                      p: 4,
                      color: "brand.DEFAULT",
                    })}
                  >
                    <FileTextIcon size="20" />
                  </span>
                </Tooltip.Trigger>
                <Tooltip.Positioner
                  css={{
                    ".group[data-expanded=true] &": {
                      display: "none",
                    },
                  }}
                >
                  <Tooltip.Arrow>
                    <Tooltip.ArrowTip />
                  </Tooltip.Arrow>
                  <Tooltip.Content>SEO・AIO記事</Tooltip.Content>
                </Tooltip.Positioner>
              </Tooltip.Root>
              SEO・AIO記事
            </Link>
          ) : (
            <Box
              className={css({
                p: 4,
                borderRadius: "md",
                bg: "gray.50",
                border: "1px solid",
                borderColor: "gray.200",
              })}
            >
              <VStack gap={2} alignItems="stretch">
                <Box display="flex" alignItems="center" gap={2}>
                  <LockIcon size={16} className={css({ color: "gray.400" })} />
                  <span
                    className={css({
                      fontSize: "sm",
                      fontWeight: 600,
                      color: "text.secondary",
                      ".group[data-expanded=false] &": {
                        display: "none",
                      },
                    })}
                  >
                    SEO・AIO記事（有料）
                  </span>
                </Box>
                <p
                  className={css({
                    fontSize: "xs",
                    color: "text.muted",
                    lineHeight: 1.5,
                    ".group[data-expanded=false] &": {
                      display: "none",
                    },
                  })}
                >
                  検索最適化された長文記事を自動生成。管理者にお問い合わせください。
                </p>
              </VStack>
            </Box>
          )}
        </li>
      </ul>
    </nav>
  );
}
