import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import Link from "next/link";
import { Box } from "styled-system/jsx";

export default function NotFound() {
  return (
    <Box h="100dvh" display="grid" placeContent="center" placeItems="center" gap={8}>
      <Text>404 - ページが見つかりません</Text>
      <Button asChild>
        <Link href="/">ホームに戻る</Link>
      </Button>
    </Box>
  );
}
