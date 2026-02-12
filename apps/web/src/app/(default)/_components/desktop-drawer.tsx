"use client";

import logoImage from "@/assets/logo.png";
import { Tooltip } from "@/components/ui/tooltip";
import { ChevronsLeftIcon, ChevronsRightIcon } from "lucide-react";
import { useState } from "react";
import { css, cx } from "styled-system/css";
import { Box } from "styled-system/jsx";

type Props = {
  children: React.ReactNode;
};

export default function DesktopDrawer({ children }: Props) {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <aside
      data-expanded={isExpanded}
      className={cx(
        "group",
        css({
          w: 80,
          pb: 4,
          display: { base: "none", md: "block" },
          height: "100dvh",
          top: 0,
          position: "sticky",
          bgColor: "sidebarBg",
          transition: "width 0.2s",
          overflowX: "hidden",
          "&[data-expanded=false]": {
            w: "3.25rem",
          },
        }),
      )}
    >
      <Box h="full" w={80} display="flex" flexDir="column" gap={4}>
        <Box display="grid" placeItems="center" mb={-4}>
          <img
            alt="SAIのロゴ"
            src={logoImage.src}
            width={logoImage.width}
            height={logoImage.height}
            className={css({
              height: 24,
              width: "auto",
            })}
          />
        </Box>
        <button
          type="button"
          onClick={() => setIsExpanded((prev) => !prev)}
          className={css({
            display: "flex",
            alignItems: "center",
            gap: 4,
            p: 4,
            color: "white",
            _hover: {
              bg: "gray.a4",
            },
            cursor: "pointer",
            fontSize: "sm",
          })}
        >
          <Tooltip.Root positioning={{ placement: "left", strategy: "fixed" }} openDelay={200}>
            <Tooltip.Trigger asChild>
              <span
                className={css({
                  m: -4,
                  p: 4,
                })}
              >
                <ChevronsLeftIcon
                  size="20"
                  className={css({
                    ".group[data-expanded=false] &": {
                      display: "none",
                    },
                  })}
                />
                <ChevronsRightIcon
                  size="20"
                  className={css({ ".group[data-expanded=true] &": { display: "none" } })}
                />
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
              <Tooltip.Content>メニューを開く</Tooltip.Content>
            </Tooltip.Positioner>
          </Tooltip.Root>
          メニューを閉じる
        </button>
        {children}
      </Box>
    </aside>
  );
}
