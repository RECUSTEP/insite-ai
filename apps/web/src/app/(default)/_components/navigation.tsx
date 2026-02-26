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

const navigationBefore = [
  {
    icon: <HomeIcon size="16" />,
    label: "ホーム",
    path: "/home",
  },
  {
    icon: <UserRoundSearchIcon size="16" />,
    label: "分析AI",
    path: "/competitor-analysis",
  },
  {
    icon: <TrendingUpIcon size="16" />,
    label: "AIコンサルティング",
    path: "/improvement-proposal",
  },
  {
    icon: <NotebookPenIcon size="16" />,
    label: "ライティングAI（Instagram）",
    path: "/writing",
  },
  {
    icon: <MapPinIcon size="16" />,
    label: "ライティングAI（Google Map）",
    path: "/google-map",
  },
] as const;

const navigationAfter = [
  {
    icon: <HistoryIcon size="16" />,
    label: "履歴",
    path: "/history",
  },
  {
    icon: <SettingsIcon size="16" />,
    label: "設定",
    path: "/",
  },
] as const;

interface NavigationProps {
  seoAddonEnabled: boolean;
}

const navItemClass = css({
  display: "flex",
  alignItems: "center",
  gap: 2.5,
  px: 3,
  py: 2,
  mx: 2,
  color: "text.secondary",
  borderRadius: "8px",
  transition: "all 0.15s ease",
  fontSize: "sm",
  fontWeight: 500,
  _currentPage: {
    color: "text.primary",
    bg: { base: "#F4F4F5", _dark: "#27272A" },
    fontWeight: 600,
  },
  _hover: {
    bg: { base: "#F4F4F5", _dark: "#27272A" },
    color: "text.primary",
    _currentPage: {
      bg: { base: "#F4F4F5", _dark: "#27272A" },
    },
  },
});

export function Navigation({ seoAddonEnabled }: NavigationProps) {
  const pathname = usePathname();

  return (
    <nav
      className={css({
        flex: 1,
        overflowY: "auto",
        py: 1,
      })}
    >
      <ul className={css({ display: "flex", flexDir: "column", gap: 0.5 })}>
        {navigationBefore.map((item) => (
          <li key={item.path}>
            <Link
              href={item.path}
              className={navItemClass}
              aria-current={pathname === item.path ? "page" : undefined}
            >
              <Tooltip.Root positioning={{ placement: "right", strategy: "fixed" }} openDelay={200}>
                <Tooltip.Trigger asChild>
                  <span
                    className={css({
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      w: 5,
                      h: 5,
                      flexShrink: 0,
                    })}
                  >
                    {item.icon}
                  </span>
                </Tooltip.Trigger>
                <Tooltip.Positioner
                  css={{ ".group[data-expanded=true] &": { display: "none" } }}
                >
                  <Tooltip.Arrow>
                    <Tooltip.ArrowTip />
                  </Tooltip.Arrow>
                  <Tooltip.Content>{item.label}</Tooltip.Content>
                </Tooltip.Positioner>
              </Tooltip.Root>
              <span
                className={css({
                  ".group[data-expanded=false] &": { display: "none" },
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                })}
              >
                {item.label}
              </span>
            </Link>
          </li>
        ))}

        {/* SEO/AIO */}
        <li>
          {seoAddonEnabled ? (
            <Link
              href="/seo-articles"
              className={navItemClass}
              aria-current={pathname === "/seo-articles" ? "page" : undefined}
            >
              <Tooltip.Root positioning={{ placement: "right", strategy: "fixed" }} openDelay={200}>
                <Tooltip.Trigger asChild>
                  <span
                    className={css({
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      w: 5,
                      h: 5,
                      flexShrink: 0,
                    })}
                  >
                    <FileTextIcon size="16" />
                  </span>
                </Tooltip.Trigger>
                <Tooltip.Positioner
                  css={{ ".group[data-expanded=true] &": { display: "none" } }}
                >
                  <Tooltip.Arrow>
                    <Tooltip.ArrowTip />
                  </Tooltip.Arrow>
                  <Tooltip.Content>SEO/AIO記事生成</Tooltip.Content>
                </Tooltip.Positioner>
              </Tooltip.Root>
              <span
                className={css({
                  ".group[data-expanded=false] &": { display: "none" },
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                })}
              >
                SEO/AIO記事生成
              </span>
            </Link>
          ) : (
            <Box
              className={css({
                mx: 2,
                px: 3,
                py: 2,
                borderRadius: "8px",
                bg: { base: "#FAFAFA", _dark: "#18181B" },
                border: "1px solid",
                borderColor: { base: "#E4E4E7", _dark: "#27272A" },
                ".group[data-expanded=false] &": { display: "none" },
              })}
            >
              <VStack gap={1} alignItems="stretch">
                <Box display="flex" alignItems="center" gap={2}>
                  <LockIcon size={14} className={css({ color: "text.muted" })} />
                  <span
                    className={css({
                      fontSize: "xs",
                      fontWeight: 600,
                      color: "text.secondary",
                    })}
                  >
                    SEO/AIO記事生成
                  </span>
                </Box>
                <p
                  className={css({
                    fontSize: "xs",
                    color: "text.muted",
                    lineHeight: 1.5,
                  })}
                >
                  有料プランで利用できます。
                </p>
              </VStack>
            </Box>
          )}
        </li>

        {/* 区切り */}
        <li>
          <Box
            className={css({
              mx: 3,
              my: 1,
              h: "1px",
              bg: { base: "#E4E4E7", _dark: "#27272A" },
              ".group[data-expanded=false] &": { display: "none" },
            })}
          />
        </li>

        {navigationAfter.map((item) => (
          <li key={item.path}>
            <Link
              href={item.path}
              className={navItemClass}
              aria-current={pathname === item.path ? "page" : undefined}
            >
              <Tooltip.Root positioning={{ placement: "right", strategy: "fixed" }} openDelay={200}>
                <Tooltip.Trigger asChild>
                  <span
                    className={css({
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      w: 5,
                      h: 5,
                      flexShrink: 0,
                    })}
                  >
                    {item.icon}
                  </span>
                </Tooltip.Trigger>
                <Tooltip.Positioner
                  css={{ ".group[data-expanded=true] &": { display: "none" } }}
                >
                  <Tooltip.Arrow>
                    <Tooltip.ArrowTip />
                  </Tooltip.Arrow>
                  <Tooltip.Content>{item.label}</Tooltip.Content>
                </Tooltip.Positioner>
              </Tooltip.Root>
              <span
                className={css({
                  ".group[data-expanded=false] &": { display: "none" },
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                })}
              >
                {item.label}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
