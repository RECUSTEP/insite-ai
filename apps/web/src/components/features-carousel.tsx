"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
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

  const goNext = () => setActiveIndex((prev) => (prev + 1) % features.length);
  const goPrev = () =>
    setActiveIndex((prev) => (prev - 1 + features.length) % features.length);

  useEffect(() => {
    const timer = setInterval(goNext, 6000);
    return () => clearInterval(timer);
  }, []);

  const current = features[activeIndex];

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
        })}
      >
        <AnimatePresence mode="wait">
          <motion.span
            key={activeIndex}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className={css({ display: "block" })}
          >
            {String(activeIndex + 1).padStart(2, "0")}
          </motion.span>
        </AnimatePresence>
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
            <motion.div
              className={css({
                position: "absolute",
                top: 0,
                left: 0,
                w: "full",
                bg: current.color,
              })}
              animate={{
                height: `${((activeIndex + 1) / features.length) * 100}%`,
              }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            />
          </Box>
        </Flex>

        {/* 中央 - メインコンテンツ */}
        <VStack
          gap={8}
          align="stretch"
          flex={1}
          className={css({
            pl: { base: 0, md: 8 },
            py: 12,
          })}
        >
          {/* タイトル */}
          <Box className={css({ minH: "80px" })}>
            <AnimatePresence mode="wait">
              <motion.h3
                key={activeIndex}
                className={css({
                  fontSize: { base: "3xl", md: "4xl" },
                  fontWeight: 700,
                  color: current.color,
                  lineHeight: 1.2,
                })}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                {current.title.split(" ").map((word, i) => (
                  <motion.span
                    key={i}
                    className={css({ display: "inline-block", mr: "0.3em" })}
                    variants={{
                      hidden: { opacity: 0, y: 20 },
                      visible: {
                        opacity: 1,
                        y: 0,
                        transition: {
                          duration: 0.5,
                          delay: i * 0.05,
                          ease: [0.22, 1, 0.36, 1],
                        },
                      },
                      exit: {
                        opacity: 0,
                        y: -10,
                        transition: { duration: 0.2, delay: i * 0.02 },
                      },
                    }}
                  >
                    {word}
                  </motion.span>
                ))}
              </motion.h3>
            </AnimatePresence>
          </Box>

          {/* 説明文 */}
          <Box className={css({ minH: "120px" })}>
            <AnimatePresence mode="wait">
              <motion.p
                key={activeIndex}
                className={css({
                  fontSize: "md",
                  color: "text.secondary",
                  lineHeight: 1.9,
                  letterSpacing: "0.3px",
                })}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4, delay: 0.2 }}
              >
                {current.description}
              </motion.p>
            </AnimatePresence>
          </Box>

          {/* ナビゲーション */}
          <Flex gap={4} align="center" justify="flex-end">
            <motion.button
              type="button"
              onClick={goPrev}
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
                _hover: {
                  bg: "gray.100",
                  borderColor: current.color,
                },
              })}
              whileTap={{ scale: 0.95 }}
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
            </motion.button>

            <motion.button
              type="button"
              onClick={goNext}
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
                _hover: {
                  bg: "gray.100",
                  borderColor: current.color,
                },
              })}
              whileTap={{ scale: 0.95 }}
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
            </motion.button>
          </Flex>
        </VStack>
      </Flex>
    </Box>
  );
}
