"use client";

import { Button } from "@/components/ui/button";
import { BellIcon } from "lucide-react";
import Link from "next/link";
import { css } from "styled-system/css";
import { Box, Flex } from "styled-system/jsx";

export function GlobalHeader() {
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
        justify="flex-end"
        align="center"
        px={4}
        py={3}
        className={css({
          maxW: "100%",
          mx: "auto",
        })}
      >
        {/* お知らせボタン */}
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
            <Box display={{ base: "none", md: "inline" }}>お知らせ</Box>
          </Button>
        </Link>
      </Flex>
    </Box>
  );
}
