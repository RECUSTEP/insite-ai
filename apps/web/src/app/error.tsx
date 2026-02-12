"use client";

import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { Box } from "styled-system/jsx";

export default function ErrorBoundary({
  error: _,
  reset,
}: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <Box h="100dvh" display="grid" placeContent="center" placeItems="center" gap={8}>
      <Text>エラーが発生しました</Text>
      <Button onClick={() => reset()}>再読み込み</Button>
    </Box>
  );
}
