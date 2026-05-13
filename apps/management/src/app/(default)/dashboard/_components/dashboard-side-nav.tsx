"use client";

import { useEffect, useState } from "react";
import { css } from "styled-system/css";
import { VStack } from "styled-system/jsx";

type Item = { href: string; label: string };

type Props = {
  items: Item[];
};

export function DashboardSideNav({ items }: Props) {
  const [active, setActive] = useState<string>(items[0]?.href.replace("#", "") ?? "");

  useEffect(() => {
    const targets = items
      .map((i) => document.getElementById(i.href.replace("#", "")))
      .filter((el): el is HTMLElement => el !== null);
    if (targets.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // 画面上部から見える要素を優先してアクティブにする
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]?.target.id) {
          setActive(visible[0].target.id);
        }
      },
      { rootMargin: "-30% 0px -60% 0px", threshold: 0 },
    );
    for (const t of targets) observer.observe(t);
    return () => observer.disconnect();
  }, [items]);

  return (
    <nav
      className={css({
        p: 3,
        borderRadius: "xl",
        border: "1px solid",
        borderColor: { base: "#E4E4E7", _dark: "#27272A" },
        bg: { base: "white", _dark: "#18181B" },
        boxShadow: "0 1px 2px rgba(16,24,40,0.04)",
      })}
    >
      <VStack gap={1} alignItems="stretch">
        <span
          className={css({
            px: 2,
            pb: 1,
            fontSize: "xs",
            color: "fg.muted",
            fontWeight: "medium",
            letterSpacing: "0.02em",
          })}
        >
          セクション
        </span>
        {items.map((item) => {
          const id = item.href.replace("#", "");
          const isActive = active === id;
          return (
            <a
              key={item.href}
              href={item.href}
              className={css({
                position: "relative",
                px: 3,
                py: 2,
                borderRadius: "md",
                fontSize: "sm",
                color: "fg.muted",
                bg: "transparent",
                transition: "color 120ms ease, background 120ms ease",
                _hover: {
                  color: "fg.default",
                  bg: { base: "#F4F4F5", _dark: "#27272A" },
                },
              })}
              style={
                isActive
                  ? {
                      color: "#2563EB",
                      background: "rgba(37,99,235,0.08)",
                      fontWeight: 600,
                    }
                  : undefined
              }
            >
              {item.label}
            </a>
          );
        })}
      </VStack>
    </nav>
  );
}
