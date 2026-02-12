import { Text } from "@/components/ui/text";
import { createClient } from "@/lib/api";
import { cookies } from "next/headers";
import { VStack } from "styled-system/jsx";
import { SaveInstructionGuideForm } from "./_components/save-instruction-guide";

export default async function Page() {
  const client = createClient();
  const response = await client.admin["instruction-guide"].$get(
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
        生成指示ガイド設定
      </Text>
      <SaveInstructionGuideForm defaultValue={defaultValue} />
    </VStack>
  );
}
