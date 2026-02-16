"use client";

import { useState, useEffect } from "react";
import { css } from "styled-system/css";
import { Box, Flex, VStack } from "styled-system/jsx";

interface Feature {
  title: string;
  description: string;
  color: string;
}

interface FeaturesCarouselProps {
  features: Feature[];
}

export function FeaturesCarousel({ features }: FeaturesCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const goNext = () => {
    if (isAnimating || features.length === 0) return;
    setIsAnimating(true);
    setActiveIndex((prev) => (prev + 1) % features.length);
    setTimeout(() => setIsAnimating(false), 600);
  };

  const goPrev = () => {
    if (isAnimating || features.length === 0) return;
    setIsAnimating(true);
    setActiveIndex((prev) => (prev - 1 + features.length) % features.length);
    setTimeout(() => setIsAnimating(false), 600);
  };

  useEffect(() => {
    if (features.length === 0) return;
    const timer = setInterval(goNext, 6000);
    return () => clearInterval(timer);
  }, [isAnimating, features.length]);

  const current = features[activeIndex];

  if (!current) {
    return null;
  }

  return (
    <Box
      className={css({
        position: "relative",
        w: "full",
        maxW: "1100px",
        mx: "auto",
      })}
    >
      {/* 大きなインデックス番号 */}
      <Box
        className={css({
          position: "absolute",
          left: { base: "-20px", md: "-32px" },
          top: "50%",
          transform: "translateY(-50%)",
          fontSize: { base: "12rem", md: "20rem" },
          fontWeight: 700,
          color: "gray.100",
          userSelect: "none",
          pointerEvents: "none",
          lineHeight: 1,
          letterSpacing: "-0.05em",
          transition: "opacity 0.6s ease",
        })}
        key={activeIndex}
      >
        {String(activeIndex + 1).padStart(2, "0")}
      </Box>

      {/* メインコンテンツ */}
      <Flex gap={8} align="stretch" direction={{ base: "column", md: "row" }}>
        {/* 左カラム - 縦テキスト */}
        <Flex
          direction="column"
          align="center"
          justify="center"
          className={css({
            display: { base: "none", md: "flex" },
            borderRight: "1px solid",
            borderColor: "gray.200",
            pr: 8,
          })}
        >
          <span
            className={css({
              fontSize: "xs",
              fontWeight: 600,
              color: "text.muted",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              writingMode: "vertical-rl",
            })}
          >
            Features
          </span>

          {/* 縦プログレスライン */}
          <Box
            className={css({
              position: "relative",
              h: "128px",
              w: "1px",
              bg: "gray.200",
              mt: 8,
            })}
          >
            <div
              className={css({
                position: "absolute",
                top: 0,
                left: 0,
                w: "full",
                bg: current.color,
                transition: "height 0.5s ease",
              })}
              style={{
                height: `${((activeIndex + 1) / features.length) * 100}%`,
              }}
            />
          </Box>
        </Flex>

        {/* 中央 - メインコンテンツ */}
        <VStack
          gap={8}
          alignItems="stretch"
          flex={1}
          className={css({
            pl: { base: 0, md: 8 },
            py: 12,
          })}
        >
          {/* タイトル */}
          <Box className={css({ minH: "80px" })}>
            <h3
              key={activeIndex}
              className={css({
                fontSize: { base: "3xl", md: "4xl" },
                fontWeight: 700,
                color: current.color,
                lineHeight: 1.2,
                animation: "fadeIn 0.6s ease",
              })}
            >
              {current.title}
            </h3>
          </Box>

          {/* 説明文 */}
          <Box className={css({ minH: "120px" })}>
            <p
              key={`desc-${activeIndex}`}
              className={css({
                fontSize: "md",
                color: "text.secondary",
                lineHeight: 1.9,
                letterSpacing: "0.3px",
                animation: "fadeIn 0.6s ease 0.2s both",
              })}
            >
              {current.description}
            </p>
          </Box>

          {/* ナビゲーション */}
          <Flex gap={4} align="center" justify="flex-end">
            <button
              type="button"
              onClick={goPrev}
              disabled={isAnimating}
              className={css({
                position: "relative",
                w: 12,
                h: 12,
                borderRadius: "full",
                border: "1px solid",
                borderColor: "gray.300",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                transition: "all 0.2s",
                bg: "white",
                _hover: {
                  bg: "gray.100",
                  borderColor: current.color,
                },
                _disabled: {
                  opacity: 0.5,
                  cursor: "not-allowed",
                },
              })}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 16 16"
                fill="none"
                className={css({ color: "text.primary" })}
              >
                <path
                  d="M10 12L6 8L10 4"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            <button
              type="button"
              onClick={goNext}
              disabled={isAnimating}
              className={css({
                position: "relative",
                w: 12,
                h: 12,
                borderRadius: "full",
                border: "1px solid",
                borderColor: "gray.300",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                transition: "all 0.2s",
                bg: "white",
                _hover: {
                  bg: "gray.100",
                  borderColor: current.color,
                },
                _disabled: {
                  opacity: 0.5,
                  cursor: "not-allowed",
                },
              })}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 16 16"
                fill="none"
                className={css({ color: "text.primary" })}
              >
                <path
                  d="M6 4L10 8L6 12"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </Flex>
        </VStack>
      </Flex>
    </Box>
  );
}
