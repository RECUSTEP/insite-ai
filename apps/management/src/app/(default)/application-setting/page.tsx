import { Text } from "@/components/ui/text";
import { createClient } from "@/lib/api";
import { cookies } from "next/headers";
import { VStack } from "styled-system/jsx";
import { SaveApplicationSettingForm } from "./_components/save-application-form";

export default async function Page() {
  const client = createClient();
  const response = await client.admin["application-settings"].$get(
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
        アプリケーション設定
      </Text>
      <SaveApplicationSettingForm defaultValue={defaultValue} />
    </VStack>
  );
}
