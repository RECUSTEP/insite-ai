"use server";

import { createClient } from "@/lib/api";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

export async function reviewCreditPurchase(id: string, status: "approved" | "rejected") {
  const client = createClient();
  const response = await client.admin["credit-purchases"][":id"].$patch(
    { param: { id }, json: { status } },
    { headers: { cookie: cookies().toString() } },
  );
  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(body?.error ?? "購入申請の更新に失敗しました。");
  }
  const result = await response.json();
  revalidatePath("/credit-purchases");
  return result;
}
