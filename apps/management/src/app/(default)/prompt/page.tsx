import { Text } from "@/components/ui/text";
import { createClient } from "@/lib/api";
import { cookies } from "next/headers";
import { VStack } from "styled-system/jsx";
import { SavePromptForm } from "./_components/save-prompt-form";

export default async function Page() {
  const client = createClient();
  const response = await client.admin.prompts.$get(
    {},
    {
      headers: {
        cookie: cookies().toString(),
      },
    },
  );

  if (!response.ok) {
    throw new Error("Failed to fetch help info");
  }
  const defaultValue = await response.json();

  return (
    <VStack maxW="3xl" mx="auto" py="8" gap="8" alignItems="stretch">
      <Text as="h1" size="xl">
        プロンプト設定
      </Text>
      <SavePromptForm defaultValue={defaultValue} />
    </VStack>
  );
}
