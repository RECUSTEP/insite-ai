"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { css } from "styled-system/css";
import { container } from "styled-system/patterns";

const navigation = [
  {
    path: "/",
    label: "プロジェクト管理",
  },
  {
    path: "/auth",
    label: "アカウント管理",
  },
  {
    path: "/application-setting",
    label: "アプリケーション設定",
  },
  {
    path: "/prompt",
    label: "プロンプト設定",
  },
  {
    path: "/help",
    label: "ヘルプ設定",
  },
  {
    path: "/instruction-guide",
    label: "生成指示ガイド設定",
  },
];

export function Header() {
  const pathname = usePathname();

  return (
    <header
      className={css({
        py: 6,
        shadow: "xs",
      })}
    >
      <div className={container()}>
        <nav
          className={css({
            display: "flex",
            gap: 8,
          })}
        >
          {navigation.map(({ path, label }) => (
            <Link
              key={path}
              href={path}
              className={css({
                color: "fg.muted",
                _hover: {
                  color: "accent.text",
                },
                _currentPage: {
                  color: "accent.text",
                },
              })}
              aria-current={path === pathname ? "page" : undefined}
            >
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
