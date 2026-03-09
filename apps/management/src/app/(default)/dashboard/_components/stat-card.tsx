"use client";

import { css } from "styled-system/css";
import { VStack } from "styled-system/jsx";

type StatCardProps = {
  label: string;
  value: number;
};

export function StatCard({ label, value }: StatCardProps) {
  return (
    <div
      className={css({
        p: 4,
        borderRadius: "lg",
        border: "1px solid",
        borderColor: { base: "#E4E4E7", _dark: "#27272A" },
        bg: { base: "white", _dark: "#18181B" },
      })}
    >
      <VStack gap={1} alignItems="flex-start">
        <span
          className={css({
            fontSize: "sm",
            color: "fg.muted",
          })}
        >
          {label}
        </span>
        <span
          className={css({
            fontSize: "2xl",
            fontWeight: "bold",
          })}
        >
          {value.toLocaleString()}
        </span>
      </VStack>
    </div>
  );
}
