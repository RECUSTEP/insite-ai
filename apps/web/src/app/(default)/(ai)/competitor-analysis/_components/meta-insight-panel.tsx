"use client";

import { Text } from "@/components/ui/text";
import { css } from "styled-system/css";
import { Box, VStack } from "styled-system/jsx";

type Props = {
  metaSocialChatEnabled: boolean;
  metaAccountLinkEnabled: boolean;
};

export function MetaInsightPanel({ metaSocialChatEnabled, metaAccountLinkEnabled }: Props) {
  return (
    <VStack gap={6} alignItems="stretch" className={css({ maxW: "xl" })}>
      <Text size="sm" className={css({ color: "text.secondary", lineHeight: 1.7 })}>
        Instagram・Threads のインサイトを Meta Graph API 経由で取得し、AI
        分析に渡す機能の受け口です。開発者アプリ作成後、トークン保管・プロンプト設計を接続します。
      </Text>

      <Box
        className={css({
          rounded: "lg",
          border: "1px solid",
          borderColor: { base: "#E4E4E7", _dark: "#3F3F46" },
          p: 4,
        })}
      >
        <Text size="sm" fontWeight={600} className={css({ mb: 2 })}>
          アカウント連携
        </Text>
        <Text size="sm" className={css({ color: "text.secondary" })}>
          {metaAccountLinkEnabled
            ? "OAuth フローは実装準備中です。連携ボタンは次の改修で有効化されます。"
            : "管理画面で「アカウント連携（OAuth）を有効化」がオフのため、ユーザー向け連携 UI は表示しません。"}
        </Text>
      </Box>

      <Box
        className={css({
          rounded: "lg",
          border: "1px solid",
          borderColor: { base: "#E4E4E7", _dark: "#3F3F46" },
          p: 4,
        })}
      >
        <Text size="sm" fontWeight={600} className={css({ mb: 2 })}>
          チャット
        </Text>
        <Text size="sm" className={css({ color: "text.secondary" })}>
          {metaSocialChatEnabled
            ? "インサイト結果を踏まえた対話は実装予定です。"
            : "管理画面で「Meta 連携チャット」がオフのため、このプロジェクトでは利用しません。"}
        </Text>
      </Box>
    </VStack>
  );
}
