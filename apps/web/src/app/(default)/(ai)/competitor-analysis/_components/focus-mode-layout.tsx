"use client";

import { css } from "styled-system/css";
import { Box, Flex } from "styled-system/jsx";

interface FocusModeLayoutProps {
  children: React.ReactNode;
}

export function FocusModeLayout({ children }: FocusModeLayoutProps) {
  return (
    <Flex
      direction="column"
      align="center"
      justify="flex-start"
      minH="calc(100vh - 200px)"
      px={4}
      py={8}
      className={css({
        animation: "slideIn 0.3s ease",
      })}
    >
      <Box
        maxW="800px"
        w="full"
        className={css({
          bg: "bg.card",
          borderRadius: "card",
          boxShadow: "card",
          p: { base: 4, md: 8 },
        })}
      >
        {children}
      </Box>
    </Flex>
  );
}
