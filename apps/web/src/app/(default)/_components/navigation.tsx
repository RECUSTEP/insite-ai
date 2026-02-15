"use client";

import { Tooltip } from "@/components/ui/tooltip";
import {
  FileTextIcon,
  HistoryIcon,
  HomeIcon,
  MapPinIcon,
  NotebookPenIcon,
  SettingsIcon,
  TrendingUpIcon,
  UserRoundSearchIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { css } from "styled-system/css";

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
    icon: <FileTextIcon size="20" />,
    label: "SEO・AIO記事",
    path: "/seo-articles",
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

export function Navigation() {
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
      </ul>
    </nav>
  );
}
