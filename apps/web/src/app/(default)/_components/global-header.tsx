"use client";

import { Button } from "@/components/ui/button";
import { useUiMode } from "@/contexts/ui-mode-context";
import { BellIcon, LayoutGridIcon, ListIcon } from "lucide-react";
import Link from "next/link";
import { css } from "styled-system/css";
import { Box, Flex } from "styled-system/jsx";

export function GlobalHeader() {
  const { mode, setMode } = useUiMode();

  return (
    <Box
      className={css({
        position: "fixed",
        top: { base: 12, md: 0 },
        left: 0,
        right: 0,
        zIndex: 40,
        bg: "bg.card",
        borderBottom: "1px solid",
        borderColor: "gray.200",
        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
      })}
    >
      <Flex
        justify={{ base: "center", md: "space-between" }}
        align="center"
        px={{ base: 4, md: 6 }}
        py={3}
        position="relative"
        className={css({
          maxW: "100%",
          mx: "auto",
        })}
      >
        {/* 左側：お知らせ（スマホのみ）/ INSITE AI（PCのみ） */}
        <Box
          position={{ base: "absolute", md: "static" }}
          left={{ base: 4, md: "auto" }}
          w={{ base: "auto", md: "200px" }}
          display="flex"
          alignItems="center"
        >
          <Box display={{ base: "block", md: "none" }}>
            <Link href="/announce">
              <Button
                size="sm"
                variant="ghost"
                className={css({
                  gap: 2,
                  _hover: {
                    bg: "gray.100",
                  },
                })}
              >
                <BellIcon size={18} />
              </Button>
            </Link>
          </Box>
          
          {/* 左側：INSITE AI（PCのみ） */}
          <Box display={{ base: "none", md: "block" }}>
            <Link href="/home">
              <span
                className={css({
                  fontSize: "xl",
                  fontWeight: 700,
                  background: "brand.gradient",
                  backgroundClip: "text",
                  color: "transparent",
                  cursor: "pointer",
                  transition: "opacity 0.2s ease",
                  _hover: {
                    opacity: 0.8,
                  },
                })}
                style={{
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                INSITE AI
              </span>
            </Link>
          </Box>
        </Box>

        {/* 中央：モード切り替えボタン */}
        <Flex gap={2} align="center" justify="center" flex={1}>
          <Button
            size="sm"
            variant={mode === "focus" ? "solid" : "outline"}
            onClick={() => setMode("focus")}
            className={css({
              transition: "all 0.2s ease",
            })}
          >
            <ListIcon size={16} />
            <Box display={{ base: "none", sm: "block" }}>PCモード</Box>
          </Button>
          <Button
            size="sm"
            variant={mode === "browse" ? "solid" : "outline"}
            onClick={() => setMode("browse")}
            className={css({
              transition: "all 0.2s ease",
            })}
          >
            <LayoutGridIcon size={16} />
            <Box display={{ base: "none", sm: "block" }}>スマホモード</Box>
          </Button>
        </Flex>

        {/* 右側：お知らせボタン（PCのみ） */}
        <Box w="200px" display={{ base: "none", md: "flex" }} justifyContent="flex-end">
          <Link href="/announce">
            <Button
              size="sm"
              variant="ghost"
              className={css({
                gap: 2,
                _hover: {
                  bg: "gray.100",
                },
              })}
            >
              <BellIcon size={18} />
              お知らせ
            </Button>
          </Link>
        </Box>
      </Flex>
    </Box>
  );
}
