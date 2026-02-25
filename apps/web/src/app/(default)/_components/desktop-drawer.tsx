"use client";

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
          w: 72,
          pb: 4,
          display: { base: "none", md: "block" },
          height: "100dvh",
          top: 0,
          position: "sticky",
          bg: "bg.base",
          transition: "width 0.25s ease",
          overflowX: "hidden",
          pt: 14,
          borderRight: "1px solid",
          borderColor: { base: "#E4E4E7", _dark: "#27272A" },
          "&[data-expanded=false]": {
            w: "3.25rem",
          },
        }),
      )}
    >
      <Box h="full" w={72} display="flex" flexDir="column" gap={1}>
        {/* ロゴ */}
        <Box
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          px={4}
          pb={4}
          pt={1}
          className={css({
            borderBottom: "1px solid",
            borderColor: { base: "#E4E4E7", _dark: "#27272A" },
            mb: 2,
          })}
        >
          <span
            className={css({
              fontSize: "lg",
              fontWeight: "800",
              color: "text.primary",
              letterSpacing: "-0.03em",
              ".group[data-expanded=false] &": {
                display: "none",
              },
            })}
          >
            INSITE AI
          </span>
          <button
            type="button"
            onClick={() => setIsExpanded((prev) => !prev)}
            className={css({
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              w: 8,
              h: 8,
              borderRadius: "6px",
              color: "text.muted",
              transition: "all 0.15s ease",
              _hover: {
                bg: { base: "#F4F4F5", _dark: "#27272A" },
                color: "text.primary",
              },
              cursor: "pointer",
              flexShrink: 0,
            })}
          >
            <Tooltip.Root positioning={{ placement: "right", strategy: "fixed" }} openDelay={200}>
              <Tooltip.Trigger asChild>
                <span>
                  <ChevronsLeftIcon
                    size="16"
                    className={css({
                      ".group[data-expanded=false] &": {
                        display: "none",
                      },
                    })}
                  />
                  <ChevronsRightIcon
                    size="16"
                    className={css({ ".group[data-expanded=true] &": { display: "none" } })}
                  />
                </span>
              </Tooltip.Trigger>
              <Tooltip.Positioner
                css={{ ".group[data-expanded=true] &": { display: "none" } }}
              >
                <Tooltip.Arrow>
                  <Tooltip.ArrowTip />
                </Tooltip.Arrow>
                <Tooltip.Content>メニューを開く</Tooltip.Content>
              </Tooltip.Positioner>
            </Tooltip.Root>
          </button>
        </Box>
        {children}
      </Box>
    </aside>
  );
}
