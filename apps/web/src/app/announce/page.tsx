import { MarkdownRenderer } from "@/components/markdown";
import { Text } from "@/components/ui/text";
import { createClient } from "@/lib/api";
import type { Metadata } from "next";
import { css } from "styled-system/css";
import { VStack } from "styled-system/jsx";

export const metadata: Metadata = {
  title: "お知らせ",
};

export default async function Page() {
  const client = createClient();
  const response = await client.announces.$get();

  if (!response.ok) {
    return (
      <VStack gap={4} p={8}>
        <Text size="xl">お知らせを取得できませんでした</Text>
      </VStack>
    );
  }

  const announces = await response.json();

  return (
    <VStack gap={8} p={8} alignItems="stretch" className={css({ animation: "fadeIn 0.4s ease" })}>
      <Text
        as="h1"
        size="2xl"
        className={css({
          fontWeight: 700,
          textAlign: "center",
          color: "text.primary",
        })}
      >
        お知らせ
      </Text>

      {announces.length === 0 ? (
        <Text textAlign="center" color="text.secondary">
          お知らせはありません
        </Text>
      ) : (
        announces.map((announce) => (
          <VStack
            key={announce.id}
            gap={4}
            p={6}
            borderRadius="12px"
            border="1px solid"
            borderColor={{ base: "#E4E4E7", _dark: "#27272A" }}
            bg={{ base: "#F4F4F5", _dark: "#18181B" }}
            alignItems="stretch"
          >
            <Text
              as="h2"
              size="lg"
              className={css({
                fontWeight: 600,
                color: "text.primary",
              })}
            >
              {announce.title}
            </Text>
            <Text fontSize="sm" color="text.muted">
              {new Date(announce.createdAt).toLocaleDateString("ja-JP", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </Text>
            <MarkdownRenderer>{announce.content}</MarkdownRenderer>
          </VStack>
        ))
      )}
    </VStack>
  );
}
