"use client";

import { css } from "styled-system/css";
import { HStack, VStack } from "styled-system/jsx";

type Props = {
  activeAuth: number;
  totalAuth: number;
};

export function ActiveAccountsCard({ activeAuth, totalAuth }: Props) {
  const ratio = totalAuth > 0 ? Math.min(1, activeAuth / totalAuth) : 0;
  const pct = Math.round(ratio * 1000) / 10;
  const inactive = Math.max(0, totalAuth - activeAuth);

  return (
    <div
      className={css({
        p: 5,
        borderRadius: "xl",
        border: "1px solid",
        borderColor: { base: "#E4E4E7", _dark: "#27272A" },
        bg: { base: "white", _dark: "#18181B" },
        boxShadow: "0 1px 2px rgba(16,24,40,0.04)",
      })}
    >
      <VStack gap={4} alignItems="stretch">
        <HStack justify="space-between" alignItems="baseline">
          <span
            className={css({
              fontSize: "xs",
              fontWeight: "medium",
              color: "fg.muted",
              letterSpacing: "0.02em",
            })}
          >
            アクティブアカウント率
          </span>
          <span
            className={css({
              fontSize: "xs",
              color: "fg.muted",
            })}
          >
            ログイン中セッション基準
          </span>
        </HStack>

        <HStack gap={3} alignItems="baseline">
          <span
            className={css({
              fontSize: "3xl",
              fontWeight: "bold",
              lineHeight: "1",
              letterSpacing: "-0.02em",
            })}
          >
            {activeAuth.toLocaleString()}
          </span>
          <span
            className={css({
              fontSize: "sm",
              color: "fg.muted",
            })}
          >
            / {totalAuth.toLocaleString()} アカウント
          </span>
          <span
            className={css({
              ml: "auto",
              fontSize: "sm",
              fontWeight: "semibold",
              color: "#059669",
            })}
          >
            {pct}%
          </span>
        </HStack>

        <div
          className={css({
            w: "full",
            h: "8px",
            borderRadius: "full",
            overflow: "hidden",
            bg: { base: "#F4F4F5", _dark: "#27272A" },
          })}
        >
          <div
            className={css({
              h: "full",
              borderRadius: "full",
              transition: "width 300ms ease",
            })}
            style={{
              width: `${Math.max(2, pct)}%`,
              background:
                "linear-gradient(90deg, #10B981 0%, #06B6D4 100%)",
            }}
          />
        </div>

        <HStack gap={4} justify="space-between">
          <Legend dotColor="#10B981" label="稼働中" value={activeAuth} />
          <Legend dotColor="#D4D4D8" label="未ログイン" value={inactive} />
        </HStack>
      </VStack>
    </div>
  );
}

function Legend({
  dotColor,
  label,
  value,
}: {
  dotColor: string;
  label: string;
  value: number;
}) {
  return (
    <HStack gap={2} alignItems="center">
      <span
        className={css({
          w: "8px",
          h: "8px",
          borderRadius: "full",
        })}
        style={{ background: dotColor }}
      />
      <span className={css({ fontSize: "xs", color: "fg.muted" })}>
        {label}
      </span>
      <span className={css({ fontSize: "xs", fontWeight: "semibold" })}>
        {value.toLocaleString()}
      </span>
    </HStack>
  );
}
