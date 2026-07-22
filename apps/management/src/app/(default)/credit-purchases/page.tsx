import { Text } from "@/components/ui/text";
import { createClient } from "@/lib/api";
import { cookies } from "next/headers";
import { VStack } from "styled-system/jsx";
import {
  type AdminCreditPurchaseRequest,
  CreditPurchaseManager,
} from "./_components/credit-purchase-manager";

export default async function CreditPurchasesPage() {
  const client = createClient();
  const response = await client.admin["credit-purchases"].$get(
    {},
    { headers: { cookie: cookies().toString() } },
  );
  const requests = response.ok ? ((await response.json()) as AdminCreditPurchaseRequest[]) : [];

  return (
    <VStack w="full" maxW="full" py="6" gap="8" alignItems="stretch">
      <VStack gap="1" alignItems="flex-start">
        <Text as="h1" size="xl">
          クレジット購入申請
        </Text>
        <Text color="fg.muted">
          銀行振込の入金確認後に承認すると、対象プロジェクトの当月上限へ100 creditが追加されます。
        </Text>
      </VStack>
      <CreditPurchaseManager initialRequests={requests} />
    </VStack>
  );
}
