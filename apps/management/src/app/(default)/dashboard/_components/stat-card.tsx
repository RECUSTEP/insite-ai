"use client";

import { css } from "styled-system/css";
import { HStack, VStack } from "styled-system/jsx";

type Tone = "neutral" | "blue" | "violet" | "emerald" | "amber";

const TONE: Record<Tone, { accent: string; bg: string; ring: string }> = {
  neutral: { accent: "#71717A", bg: "rgba(113,113,122,0.08)", ring: "rgba(113,113,122,0.16)" },
  blue: { accent: "#2563EB", bg: "rgba(37,99,235,0.08)", ring: "rgba(37,99,235,0.16)" },
  violet: { accent: "#7C3AED", bg: "rgba(124,58,237,0.08)", ring: "rgba(124,58,237,0.16)" },
  emerald: { accent: "#059669", bg: "rgba(5,150,105,0.08)", ring: "rgba(5,150,105,0.16)" },
  amber: { accent: "#D97706", bg: "rgba(217,119,6,0.08)", ring: "rgba(217,119,6,0.16)" },
};

type StatCardProps = {
  label: string;
  value: number | string;
  sub?: string;
  tone?: Tone;
  icon?: React.ReactNode;
  formatter?: (v: number) => string;
};

export function StatCard({
  label,
  value,
  sub,
  tone = "neutral",
  icon,
  formatter,
}: StatCardProps) {
  const palette = TONE[tone];
  const display =
    typeof value === "number" ? (formatter ? formatter(value) : value.toLocaleString()) : value;

  return (
    <div
      className={css({
        p: 5,
        borderRadius: "xl",
        border: "1px solid",
        borderColor: { base: "#E4E4E7", _dark: "#27272A" },
        bg: { base: "white", _dark: "#18181B" },
        boxShadow: "0 1px 2px rgba(16,24,40,0.04)",
        transition: "box-shadow 120ms ease, transform 120ms ease",
        _hover: { boxShadow: "0 4px 12px rgba(16,24,40,0.06)" },
      })}
    >
      <VStack gap={3} alignItems="stretch">
        <HStack justify="space-between" alignItems="center">
          <span
            className={css({
              fontSize: "xs",
              fontWeight: "medium",
              color: "fg.muted",
              letterSpacing: "0.02em",
            })}
          >
            {label}
          </span>
          {icon ? (
            <span
              className={css({
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                w: "32px",
                h: "32px",
                borderRadius: "lg",
              })}
              style={{ background: palette.bg, color: palette.accent }}
            >
              {icon}
            </span>
          ) : null}
        </HStack>
        <span
          className={css({
            fontSize: "3xl",
            fontWeight: "bold",
            lineHeight: "1",
            letterSpacing: "-0.02em",
          })}
        >
          {display}
        </span>
        {sub ? (
          <span
            className={css({
              fontSize: "xs",
              color: "fg.muted",
            })}
          >
            {sub}
          </span>
        ) : null}
      </VStack>
    </div>
  );
}
