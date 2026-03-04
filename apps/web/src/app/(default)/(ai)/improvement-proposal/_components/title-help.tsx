"use client";

import { IconButton } from "@/components/ui/icon-button";
import { Popover } from "@/components/ui/popover";
import { HelpCircleIcon } from "lucide-react";
import { css } from "styled-system/css";
import { Box, HStack } from "styled-system/jsx";

const FEATURE_DESCRIPTION = `集客・SNS運用・店舗改善など、ビジネスに関する相談をAIに気軽にできます。

画像（Instagramの投稿・競合店の写真など）を添付すると、より具体的なアドバイスが可能です。`;

export function TitleHelp() {
  return (
    <HStack gap={1} alignItems="center">
      <Popover.Root>
        <Popover.Trigger asChild>
          <IconButton
            aria-label="機能の説明"
            variant="ghost"
            size="xs"
            className={css({
              color: "text.muted",
              _hover: { color: "text.secondary" },
            })}
          >
            <HelpCircleIcon size={16} />
          </IconButton>
        </Popover.Trigger>
        <Popover.Positioner>
          <Popover.Content minW="280px" maxW="400px">
            <Box
              className={css({
                fontSize: "sm",
                color: "text.secondary",
                lineHeight: 1.7,
                whiteSpace: "pre-wrap",
              })}
            >
              {FEATURE_DESCRIPTION}
            </Box>
          </Popover.Content>
        </Popover.Positioner>
      </Popover.Root>
    </HStack>
  );
}
