import { Text } from "@/components/ui/text";
import { createClient } from "@/lib/api";
import { cookies } from "next/headers";
import { VStack } from "styled-system/jsx";
import { AnnouncesManager } from "./_components/announces-manager";

export default async function Page() {
  const client = createClient();
  const response = await client.admin.announces.$get(
    {},
    {
      headers: {
        cookie: cookies().toString(),
      },
    },
  );

  if (!response.ok) {
    throw new Error("Failed to fetch announces");
  }
  const announces = await response.json();

  return (
    <VStack maxW="4xl" mx="auto" py="8" gap="8" alignItems="stretch">
      <Text as="h1" size="xl">
        お知らせ管理
      </Text>
      <AnnouncesManager initialAnnounces={announces} />
    </VStack>
  );
}
