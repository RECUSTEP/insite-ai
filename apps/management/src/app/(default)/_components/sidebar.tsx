"use client";

import Link from "next/link";
import { PanelLeftCloseIcon, PanelLeftIcon } from "lucide-react";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { css } from "styled-system/css";
import { VStack } from "styled-system/jsx";

const navigation = [
  { path: "/dashboard", label: "ダッシュボード" },
  { path: "/", label: "プロジェクト管理" },
  { path: "/auth", label: "アカウント管理" },
  { path: "/credit-purchases", label: "クレジット購入申請" },
  { path: "/application-setting", label: "アプリケーション設定" },
  { path: "/prompt", label: "プロンプト設定" },
  { path: "/help", label: "ヘルプ設定" },
  { path: "/instruction-guide", label: "生成指示ガイド設定" },
  { path: "/announces", label: "お知らせ管理" },
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={css({
        w: collapsed ? "14" : "56",
        minH: "100vh",
        flexShrink: 0,
        transition: "width 0.2s ease",
        borderRight: "1px solid",
        borderColor: { base: "#E4E4E7", _dark: "#27272A" },
        bg: { base: "#FAFAFA", _dark: "#18181B" },
        py: 6,
        px: collapsed ? 2 : 3,
      })}
    >
      <VStack gap={4} alignItems="stretch">
        <button
          type="button"
          onClick={() => setCollapsed((c) => !c)}
          className={css({
            display: "flex",
            alignItems: "center",
            gap: 2,
            w: "full",
            px: 3,
            py: 2,
            borderRadius: "md",
            fontSize: collapsed ? "sm" : "base",
            fontWeight: "bold",
            color: "accent.text",
            bg: "transparent",
            border: "none",
            cursor: "pointer",
            _hover: { bg: { base: "#F4F4F5", _dark: "#27272A" } },
          })}
        >
          {collapsed ? (
            <PanelLeftIcon size={20} />
          ) : (
            <>
              <PanelLeftCloseIcon size={18} />
              INSITE AI
            </>
          )}
        </button>
        <nav className={css({ display: collapsed ? "none" : "block" })}>
          <VStack gap={1}>
            {navigation.map(({ path, label }) => {
            const isActive =
              path === "/"
                ? pathname === "/"
                : pathname === path || pathname.startsWith(path + "/");
            return (
              <Link
                key={path}
                href={path}
                className={css({
                  display: "block",
                  px: 3,
                  py: 2,
                  borderRadius: "md",
                  fontSize: "sm",
                  color: isActive ? "accent.text" : "fg.muted",
                  bg: isActive ? { base: "#F4F4F5", _dark: "#27272A" } : "transparent",
                  _hover: {
                    color: "accent.text",
                    bg: { base: "#F4F4F5", _dark: "#27272A" },
                  },
                })}
              >
                {label}
              </Link>
            );
          })}
          </VStack>
        </nav>
      </VStack>
    </aside>
  );
}
