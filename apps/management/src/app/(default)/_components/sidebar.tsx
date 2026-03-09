"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { css } from "styled-system/css";
import { VStack } from "styled-system/jsx";

const navigation = [
  { path: "/", label: "プロジェクト管理" },
  { path: "/auth", label: "アカウント管理" },
  { path: "/application-setting", label: "アプリケーション設定" },
  { path: "/prompt", label: "プロンプト設定" },
  { path: "/help", label: "ヘルプ設定" },
  { path: "/instruction-guide", label: "生成指示ガイド設定" },
  { path: "/announces", label: "お知らせ管理" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      className={css({
        w: "56",
        minH: "100vh",
        borderRight: "1px solid",
        borderColor: { base: "#E4E4E7", _dark: "#27272A" },
        bg: { base: "#FAFAFA", _dark: "#18181B" },
        py: 6,
        px: 3,
      })}
    >
      <nav>
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
    </aside>
  );
}
