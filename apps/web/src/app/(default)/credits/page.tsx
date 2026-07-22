import { createClient } from "@/lib/api";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { type CreditPurchaseData, CreditPurchasePanel } from "./_components/credit-purchase-panel";

export const metadata: Metadata = {
  title: "クレジット追加",
};

const fallbackData: CreditPurchaseData = {
  package: { credits: 100, amountYen: 2200 },
  paymentMethods: {
    card: {
      available: false,
      message: "Stripeアカウント連携後にご利用いただけます。",
    },
    bankTransfer: {
      available: true,
      message: "申請後に運営から振込先をご案内します。",
    },
  },
  additionalCredits: 0,
  requests: [],
};

export default async function CreditPurchasePage() {
  const client = createClient();
  const response = await client["credit-purchases"].$get(
    {},
    { headers: { cookie: cookies().toString() } },
  );
  const initialData = response.ok ? ((await response.json()) as CreditPurchaseData) : fallbackData;

  return <CreditPurchasePanel initialData={initialData} />;
}
