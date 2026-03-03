"use client";

import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { Box, VStack } from "styled-system/jsx";
import { css } from "styled-system/css";

export default function ErrorBoundary({
  error,
  reset,
}: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <Box h="100dvh" display="grid" placeContent="center" placeItems="center" gap={8}>
      <VStack gap={4} alignItems="center">
        <Text size="xl" className={css({ fontWeight: 700 })}>エラーが発生しました</Text>
        <Text size="sm" className={css({ color: "text.secondary", textAlign: "center" })}>
          問題が解決しない場合はサポートへお問い合わせください。
        </Text>
        {error.message && (
          <Box
            className={css({
              bg: "bg.card",
              border: "1px solid",
              borderColor: "border.subtle",
              borderRadius: "md",
              p: 4,
              maxW: "lg",
              w: "full",
            })}
          >
            <Text size="xs" className={css({ color: "text.secondary", fontFamily: "monospace", whiteSpace: "pre-wrap", wordBreak: "break-all" })}>
              {error.message}
            </Text>
            {error.digest && (
              <Text size="xs" className={css({ color: "text.secondary", mt: 2 })}>
                診断ID: {error.digest}
              </Text>
            )}
          </Box>
        )}
        <Button onClick={() => reset()}>再読み込み</Button>
      </VStack>
    </Box>
  );
}
