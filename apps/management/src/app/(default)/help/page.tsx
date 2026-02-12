import { Text } from "@/components/ui/text";
import { createClient } from "@/lib/api";
import { cookies } from "next/headers";
import { VStack } from "styled-system/jsx";
import { SaveHelpForm } from "./_components/save-help-form";

export default async function Page() {
  const client = createClient();
  const response = await client.admin.helps.$get(
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
        ヘルプ設定
      </Text>
      <SaveHelpForm defaultValue={defaultValue} />
    </VStack>
  );
}
