import { MarkdownRenderer } from "@/components/markdown";
import { createClient } from "@/lib/api";
import type { Metadata } from "next";
import { VStack } from "styled-system/jsx";
import { Text } from "@/components/ui/text";
import { css } from "styled-system/css";

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
    <VStack gap={8} p={8} alignItems="stretch">
      <Text
        as="h1"
        size="3xl"
        className={css({
          fontWeight: 700,
          textAlign: "center",
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
            borderRadius="md"
            border="1px solid"
            borderColor="gray.200"
            bg="white"
            alignItems="stretch"
          >
            <Text
              as="h2"
              size="xl"
              className={css({
                fontWeight: 600,
              })}
            >
              {announce.title}
            </Text>
            <Text fontSize="sm" color="text.secondary">
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
