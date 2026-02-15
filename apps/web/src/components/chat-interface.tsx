"use client";

import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { MicIcon, PaperclipIcon, SendIcon } from "lucide-react";
import { useState } from "react";
import { css } from "styled-system/css";
import { Box, Flex, VStack } from "styled-system/jsx";

interface Message {
  id: string;
  type: "user" | "ai";
  content: string;
  timestamp: Date;
}

interface ChatInterfaceProps {
  messages?: Message[];
  onSendMessage?: (message: string) => void;
  placeholder?: string;
  isLoading?: boolean;
}

export function ChatInterface({
  messages = [],
  onSendMessage,
  placeholder = "メッセージを入力してください...",
  isLoading = false,
}: ChatInterfaceProps) {
  const [inputValue, setInputValue] = useState("");

  const handleSend = () => {
    if (inputValue.trim() && onSendMessage) {
      onSendMessage(inputValue);
      setInputValue("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Flex direction="column" gap={4} h="full">
      {/* メッセージ表示エリア */}
      <VStack
        gap={4}
        flex={1}
        overflowY="auto"
        px={4}
        py={4}
        className={css({
          scrollbarWidth: "thin",
        })}
      >
        {messages.map((message) => (
          <Flex
            key={message.id}
            justify={message.type === "user" ? "flex-end" : "flex-start"}
            w="full"
          >
            <Box
              maxW="70%"
              className={css({
                bg: message.type === "user" ? "gray.100" : "#EBF8FF",
                borderRadius: message.type === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                p: 4,
                boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
              })}
            >
              <Text
                className={css({
                  color: "text.primary",
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                })}
              >
                {message.content}
              </Text>
            </Box>
          </Flex>
        ))}

        {/* ローディングインジケーター */}
        {isLoading && (
          <Flex justify="flex-start" w="full">
            <Box
              className={css({
                bg: "#EBF8FF",
                borderRadius: "16px 16px 16px 4px",
                p: 4,
                display: "flex",
                gap: 1,
              })}
            >
              <span
                className={css({
                  w: 2,
                  h: 2,
                  borderRadius: "full",
                  bg: "brand.DEFAULT",
                  animation: "bounce 1.4s infinite ease-in-out both",
                  animationDelay: "0s",
                })}
              />
              <span
                className={css({
                  w: 2,
                  h: 2,
                  borderRadius: "full",
                  bg: "brand.DEFAULT",
                  animation: "bounce 1.4s infinite ease-in-out both",
                  animationDelay: "0.2s",
                })}
              />
              <span
                className={css({
                  w: 2,
                  h: 2,
                  borderRadius: "full",
                  bg: "brand.DEFAULT",
                  animation: "bounce 1.4s infinite ease-in-out both",
                  animationDelay: "0.4s",
                })}
              />
            </Box>
          </Flex>
        )}
      </VStack>

      {/* 入力エリア */}
      <Box
        className={css({
          borderTop: "1px solid",
          borderColor: "gray.200",
          pt: 4,
          px: 4,
        })}
      >
        <Flex gap={2} align="flex-end">
          <Flex
            flex={1}
            direction="column"
            className={css({
              bg: "gray.50",
              borderRadius: "button",
              p: 3,
              border: "1px solid",
              borderColor: "gray.200",
              transition: "all 0.2s ease",
              _focusWithin: {
                borderColor: "brand.DEFAULT",
                boxShadow: "0 0 0 3px rgba(47, 128, 237, 0.1)",
              },
            })}
          >
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={placeholder}
              rows={3}
              className={css({
                w: "full",
                bg: "transparent",
                border: "none",
                outline: "none",
                resize: "none",
                color: "text.primary",
                fontSize: "sm",
                fontFamily: "inherit",
                _placeholder: {
                  color: "text.muted",
                },
              })}
            />
            <Flex gap={2} justify="flex-end" mt={2}>
              <Button variant="ghost" size="sm">
                <PaperclipIcon size={18} />
              </Button>
              <Button variant="ghost" size="sm">
                <MicIcon size={18} />
              </Button>
            </Flex>
          </Flex>
          <Button
            onClick={handleSend}
            disabled={!inputValue.trim() || isLoading}
            className={css({
              background: "brand.gradient",
              color: "white",
              px: 6,
              py: 6,
              borderRadius: "button",
              transition: "all 0.2s ease",
              _hover: {
                transform: "scale(1.05)",
                boxShadow: "cardHover",
              },
              _disabled: {
                opacity: 0.5,
                cursor: "not-allowed",
                transform: "none",
              },
            })}
          >
            <SendIcon size={20} />
          </Button>
        </Flex>
      </Box>
    </Flex>
  );
}
