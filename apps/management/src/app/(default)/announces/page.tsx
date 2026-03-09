import { Text } from "@/components/ui/text";
import { createClient } from "@/lib/api";
import { cookies } from "next/headers";
import { VStack } from "styled-system/jsx";
import { AnnouncesManager } from "./_components/announces-manager";

export default async function Page() {
  const client = createClient();
  let announces: any[] = [];
  
  try {
    const response = await client.admin.announces.$get(
      {},
      {
        headers: {
          cookie: cookies().toString(),
        },
      },
    );

    if (response.ok) {
      announces = await response.json();
    } else {
      console.error("Failed to fetch announces:", response.status);
    }
  } catch (error) {
    console.error("Error fetching announces:", error);
  }

  return (
    <VStack maxW="6xl" w="full" mx="auto" py="8" gap="8" alignItems="stretch">
      <Text as="h1" size="xl">
        お知らせ管理
      </Text>
      <AnnouncesManager initialAnnounces={announces} />
    </VStack>
  );
}
