"use client";

import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { useMemo, useState } from "react";
import { css } from "styled-system/css";
import { Box, Flex, Stack, VStack } from "styled-system/jsx";
import { reviewCreditPurchase } from "../_actions/review-credit-purchase";

export type AdminCreditPurchaseRequest = {
  id: string;
  projectId: string;
  projectName: string;
  authId: string;
  companyName: string | null;
  paymentMethod: string;
  transferName: string | null;
  note: string | null;
  credits: number;
  amountYen: number;
  status: string;
  createdAt: number;
  reviewedAt: number | null;
  approvedAt: number | null;
};

const statusLabel: Record<string, string> = {
  pending: "入金確認待ち",
  approved: "承認済み",
  rejected: "却下",
};

const statusColor: Record<string, string> = {
  pending: "#B45309",
  approved: "#15803D",
  rejected: "#B91C1C",
};

export function CreditPurchaseManager({
  initialRequests,
}: {
  initialRequests: AdminCreditPurchaseRequest[];
}) {
  const [requests, setRequests] = useState(initialRequests);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const sortedRequests = useMemo(
    () =>
      [...requests].sort((a, b) => {
        if (a.status === "pending" && b.status !== "pending") {
          return -1;
        }
        if (a.status !== "pending" && b.status === "pending") {
          return 1;
        }
        return b.createdAt - a.createdAt;
      }),
    [requests],
  );

  const review = async (request: AdminCreditPurchaseRequest, status: "approved" | "rejected") => {
    const message =
      status === "approved"
        ? `「${request.transferName ?? request.projectName}」の入金を確認し、${request.credits} creditを追加しますか？`
        : "この申請を却下しますか？";
    if (!window.confirm(message)) {
      return;
    }

    setProcessingId(request.id);
    setError("");
    try {
      const updated = await reviewCreditPurchase(request.id, status);
      setRequests((current) =>
        current.map((item) => (item.id === request.id ? { ...item, ...updated } : item)),
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "更新に失敗しました。");
    } finally {
      setProcessingId(null);
    }
  };

  if (sortedRequests.length === 0) {
    return (
      <Box
        className={css({
          p: 8,
          border: "1px solid",
          borderColor: "gray.200",
          borderRadius: "md",
          textAlign: "center",
        })}
      >
        <Text color="fg.muted">購入申請はありません。</Text>
      </Box>
    );
  }

  return (
    <VStack gap={4} alignItems="stretch">
      {error && <Text color="#B91C1C">{error}</Text>}
      {sortedRequests.map((request) => (
        <Box
          key={request.id}
          className={css({
            p: 5,
            border: "1px solid",
            borderColor: { base: "#E4E4E7", _dark: "#27272A" },
            borderRadius: "12px",
            bg: "bg.card",
          })}
        >
          <Flex justify="space-between" align="flex-start" gap={5} flexWrap="wrap">
            <Stack gap={2} minW={0}>
              <Flex align="center" gap={2} flexWrap="wrap">
                <Text fontWeight="bold" fontSize="lg">
                  {request.companyName || request.projectName}
                </Text>
                <Text
                  fontSize="sm"
                  fontWeight="bold"
                  color={statusColor[request.status] ?? "fg.muted"}
                >
                  {statusLabel[request.status] ?? request.status}
                </Text>
              </Flex>
              <Text fontSize="sm" color="fg.muted">
                プロジェクト: {request.projectName}（{request.projectId}） / 認証ID:{" "}
                {request.authId}
              </Text>
              <Text fontSize="sm">
                振込名義: <strong>{request.transferName || "未入力"}</strong>
              </Text>
              <Text fontSize="sm">
                {request.credits} credit / ¥{request.amountYen.toLocaleString()}
              </Text>
              {request.note && (
                <Text fontSize="sm" whiteSpace="pre-wrap">
                  備考: {request.note}
                </Text>
              )}
              <Text fontSize="xs" color="fg.muted">
                申請日時: {new Date(request.createdAt).toLocaleString("ja-JP")}
                {request.reviewedAt
                  ? ` / 処理日時: ${new Date(request.reviewedAt).toLocaleString("ja-JP")}`
                  : ""}
              </Text>
            </Stack>

            {request.status === "pending" && (
              <Flex gap={2}>
                <Button
                  loading={processingId === request.id}
                  onClick={() => review(request, "approved")}
                >
                  入金確認・承認
                </Button>
                <Button
                  variant="outline"
                  disabled={processingId === request.id}
                  onClick={() => review(request, "rejected")}
                >
                  却下
                </Button>
              </Flex>
            )}
          </Flex>
        </Box>
      ))}
    </VStack>
  );
}
