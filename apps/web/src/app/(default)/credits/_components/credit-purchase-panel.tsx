"use client";

import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { Textarea } from "@/components/ui/textarea";
import { Building2Icon, CheckCircle2Icon, CreditCardIcon, RefreshCwIcon } from "lucide-react";
import { useState } from "react";
import { css } from "styled-system/css";
import { Box, Flex, Grid, Stack, VStack } from "styled-system/jsx";

type CreditPurchaseRequest = {
  id: string;
  paymentMethod: string;
  transferName: string | null;
  note: string | null;
  credits: number;
  amountYen: number;
  status: string;
  createdAt: number;
  reviewedAt: number | null;
};

export type CreditPurchaseData = {
  package: { credits: number; amountYen: number };
  paymentMethods: {
    card: { available: boolean; message: string };
    bankTransfer: { available: boolean; message: string };
  };
  additionalCredits: number;
  requests: CreditPurchaseRequest[];
};

const cardClass = css({
  bg: "bg.card",
  border: "1px solid",
  borderColor: { base: "#E4E4E7", _dark: "#27272A" },
  borderRadius: "12px",
  p: 6,
});

const statusLabel: Record<string, string> = {
  pending: "運営確認待ち",
  approved: "承認済み",
  rejected: "却下",
};

const statusColor: Record<string, string> = {
  pending: "#B45309",
  approved: "#15803D",
  rejected: "#B91C1C",
};

async function parseError(response: Response) {
  try {
    const body = (await response.json()) as { error?: string };
    return body.error || "申請に失敗しました。";
  } catch {
    return "申請に失敗しました。";
  }
}

export function CreditPurchasePanel({ initialData }: { initialData: CreditPurchaseData }) {
  const [data, setData] = useState(initialData);
  const [transferName, setTransferName] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const hasPending = data.requests.some((request) => request.status === "pending");

  const refresh = async () => {
    setRefreshing(true);
    setError("");
    try {
      const response = await fetch("/api/credit-purchases", { cache: "no-store" });
      if (!response.ok) {
        throw new Error(await parseError(response));
      }
      setData((await response.json()) as CreditPurchaseData);
    } catch (e) {
      setError(e instanceof Error ? e.message : "最新状態の取得に失敗しました。");
    } finally {
      setRefreshing(false);
    }
  };

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSuccess("");
    if (!transferName.trim()) {
      setError("振込名義を入力してください。");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch("/api/credit-purchases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transferName, note: note || undefined }),
      });
      if (!response.ok) {
        throw new Error(await parseError(response));
      }
      const request = (await response.json()) as CreditPurchaseRequest;
      setData((current) => ({ ...current, requests: [request, ...current.requests] }));
      setTransferName("");
      setNote("");
      setSuccess("申請を受け付けました。運営からの振込先案内をお待ちください。");
    } catch (e) {
      setError(e instanceof Error ? e.message : "申請に失敗しました。");
    } finally {
      setLoading(false);
    }
  };

  return (
    <VStack gap={8} alignItems="stretch" py={6}>
      <Stack gap={1}>
        <Text as="h1" size="2xl" fontWeight="bold">
          クレジットを追加
        </Text>
        <Text color="fg.muted">クレジットが不足した場合に、100 credit単位で追加できます。</Text>
      </Stack>

      <Box className={cardClass}>
        <Flex justify="space-between" align="center" gap={4} flexWrap="wrap">
          <Stack gap={1}>
            <Text fontSize="sm" color="fg.muted">
              追加クレジット
            </Text>
            <Text fontSize="3xl" fontWeight="bold">
              {data.package.credits} credit
            </Text>
            <Text fontSize="sm" color="fg.muted">
              承認月の月末まで利用できます
            </Text>
          </Stack>
          <Text fontSize="3xl" fontWeight="bold">
            ¥{data.package.amountYen.toLocaleString()}
          </Text>
        </Flex>
        {data.additionalCredits > 0 && (
          <Flex
            mt={4}
            gap={2}
            align="center"
            className={css({ color: "#15803D", fontSize: "sm", fontWeight: 600 })}
          >
            <CheckCircle2Icon size={17} />
            今月の購入承認分: {data.additionalCredits} credit
          </Flex>
        )}
      </Box>

      <Grid columns={{ base: 1, md: 2 }} gap={4}>
        <Box className={cardClass} opacity={0.65}>
          <Stack gap={4}>
            <Flex align="center" gap={2}>
              <CreditCardIcon size={20} />
              <Text fontWeight="bold">クレジットカード</Text>
            </Flex>
            <Text fontSize="sm" color="fg.muted">
              {data.paymentMethods.card.message}
            </Text>
            <Button disabled w="full">
              Stripe決済は準備中
            </Button>
          </Stack>
        </Box>

        <Box className={cardClass}>
          <form onSubmit={submit}>
            <Stack gap={4}>
              <Flex align="center" gap={2}>
                <Building2Icon size={20} />
                <Text fontWeight="bold">銀行振込</Text>
              </Flex>
              <Text fontSize="sm" color="fg.muted">
                {data.paymentMethods.bankTransfer.message}
                入金確認後、運営が当月分へ100 creditを追加します。
              </Text>
              <Field.Root required>
                <Field.Label>振込名義</Field.Label>
                <Input
                  value={transferName}
                  onChange={(event) => setTransferName(event.target.value)}
                  placeholder="例：カ）サンプル"
                  maxLength={100}
                  disabled={hasPending}
                />
              </Field.Root>
              <Field.Root>
                <Field.Label>備考（任意）</Field.Label>
                <Textarea
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  placeholder="請求・振込に関する連絡事項"
                  maxLength={500}
                  rows={3}
                  disabled={hasPending}
                />
              </Field.Root>
              {hasPending && (
                <Text fontSize="sm" color="#B45309" fontWeight="semibold">
                  確認待ちの申請があります。運営からの案内または入金確認をお待ちください。
                </Text>
              )}
              {error && <Text color="#B91C1C">{error}</Text>}
              {success && <Text color="#15803D">{success}</Text>}
              <Button type="submit" loading={loading} disabled={hasPending} w="full">
                振込申請を送信
              </Button>
            </Stack>
          </form>
        </Box>
      </Grid>

      <Box className={cardClass}>
        <Flex justify="space-between" align="center" gap={3} mb={4}>
          <Text fontWeight="bold">申請履歴</Text>
          <Button size="sm" variant="outline" loading={refreshing} onClick={refresh}>
            <RefreshCwIcon size={15} />
            最新状態を確認
          </Button>
        </Flex>
        {data.requests.length === 0 ? (
          <Text fontSize="sm" color="fg.muted">
            申請履歴はありません。
          </Text>
        ) : (
          <VStack gap={3} alignItems="stretch">
            {data.requests.map((request) => (
              <Flex
                key={request.id}
                justify="space-between"
                align={{ base: "flex-start", sm: "center" }}
                direction={{ base: "column", sm: "row" }}
                gap={2}
                className={css({
                  borderTop: "1px solid",
                  borderColor: { base: "#E4E4E7", _dark: "#27272A" },
                  pt: 3,
                })}
              >
                <Stack gap={0.5}>
                  <Text fontSize="sm" fontWeight="semibold">
                    {request.credits} credit / ¥{request.amountYen.toLocaleString()}
                  </Text>
                  <Text fontSize="xs" color="fg.muted">
                    {new Date(request.createdAt).toLocaleString("ja-JP")}
                    {request.transferName ? ` ・ 振込名義: ${request.transferName}` : ""}
                  </Text>
                </Stack>
                <Text
                  fontSize="sm"
                  fontWeight="bold"
                  color={statusColor[request.status] ?? "fg.muted"}
                >
                  {statusLabel[request.status] ?? request.status}
                </Text>
              </Flex>
            ))}
          </VStack>
        )}
      </Box>
    </VStack>
  );
}
