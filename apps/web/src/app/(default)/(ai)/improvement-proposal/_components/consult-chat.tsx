"use client";

import { toaster } from "@/app/_components/toast";
import { MarkdownRenderer } from "@/components/markdown";
import { Button } from "@/components/ui/button";
import { PROJECT_TAG } from "@/lib/tags";
import { fileUpload } from "@repo/configuration";
import { ImageIcon, PaperclipIcon, PlusIcon, SendIcon, XIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { css } from "styled-system/css";
import { Box, Flex, Stack } from "styled-system/jsx";
import { revalidateTagAction } from "../../../_action/revalidate";

const { acceptMimeTypes, maxFileSize } = fileUpload;

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  hasImage?: boolean;
  timestamp: number;
};

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  image?: string; // data URL (not persisted)
  hasImage?: boolean;
  loading?: boolean;
  timestamp: number;
};

async function* readStream(stream: ReadableStream<Uint8Array>) {
  const decoder = new TextDecoder("utf-8");
  const reader = stream.getReader();
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    yield decoder.decode(value);
  }
}

const WELCOME_MESSAGE: Message = {
  id: "welcome",
  role: "assistant",
  content:
    "こんにちは！AIコンサルタントです。\n\n集客・SNS運用・店舗改善など、どのようなことでもお気軽にご相談ください。画像（Instagramの投稿・競合店の写真など）を添付していただくと、より具体的なアドバイスが可能です。",
  timestamp: 0,
};

function msgsToChatMessages(messages: Message[]): ChatMessage[] {
  return messages
    .filter((m) => !m.loading)
    .map((m) => ({
      role: m.role,
      content: m.content || (m.hasImage ? "（画像を送信）" : ""),
      hasImage: m.hasImage,
      timestamp: m.timestamp,
    }));
}

type Props = {
  projectId?: string;
  selectedSessionId?: string | null;
  onSessionCreated?: (sessionId: string) => void;
};

export function ConsultChat({ projectId, selectedSessionId, onSessionCreated }: Props) {
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sessionLoading, setSessionLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Load session when selectedSessionId changes
  useEffect(() => {
    if (!selectedSessionId) return;
    if (selectedSessionId === currentSessionId) return;

    setSessionLoading(true);
    fetch(`/api/chat-sessions/${selectedSessionId}`)
      .then((res) => {
        if (!res.ok) throw new Error("セッションの読み込みに失敗しました");
        return res.json() as Promise<{ id: string; messages: ChatMessage[] }>;
      })
      .then((data) => {
        const restored: Message[] = data.messages.map((m, i) => ({
          id: `restored-${i}`,
          role: m.role,
          content: m.content,
          hasImage: m.hasImage,
          timestamp: m.timestamp,
        }));
        setMessages(restored.length ? restored : [WELCOME_MESSAGE]);
        setCurrentSessionId(data.id);
      })
      .catch((e) => {
        toaster.error({ title: "エラー", description: e.message });
      })
      .finally(() => setSessionLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSessionId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > maxFileSize) {
      toaster.error({ title: "エラー", description: "ファイルサイズが大きすぎます" });
      return;
    }
    setImage(file);
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setImage(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleNewChat = () => {
    setMessages([WELCOME_MESSAGE]);
    setCurrentSessionId(null);
    setInput("");
    handleRemoveImage();
  };

  const handleSubmit = async () => {
    const trimmed = input.trim();
    if (!trimmed && !image) return;
    if (loading) return;

    const userMsgId = crypto.randomUUID();
    const aiMsgId = crypto.randomUUID();
    const now = Date.now();

    const userMsg: Message = {
      id: userMsgId,
      role: "user",
      content: trimmed,
      image: imagePreview ?? undefined,
      hasImage: !!image,
      timestamp: now,
    };
    const aiMsg: Message = {
      id: aiMsgId,
      role: "assistant",
      content: "",
      loading: true,
      timestamp: now + 1,
    };

    const currentMessages = [...messages, userMsg];
    setMessages([...currentMessages, aiMsg]);
    setInput("");
    setImage(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    setLoading(true);

    let finalContent = "";
    try {
      const type = image ? "improvement" : "improvement-no-image";
      const form = new FormData();
      form.append("instruction", trimmed);
      if (image) form.append("images", image);

      // Build conversation history (exclude loading messages and welcome, limit to last 20)
      const history = currentMessages
        .filter((m) => m.id !== "welcome" && !m.loading)
        .slice(-20)
        .map((m) => ({
          role: m.role as "user" | "assistant",
          content: m.content || (m.hasImage ? "（画像を送信）" : ""),
        }));
      form.append("conversationHistory", JSON.stringify(history));

      const response = await fetch(`/api/analysis?type=${type}`, {
        method: "POST",
        body: form,
      });

      if (!response.ok || !response.body) {
        throw new Error("エラーが発生しました。");
      }

      revalidateTagAction(PROJECT_TAG);

      for await (const chunk of readStream(response.body)) {
        finalContent += chunk;
        setMessages((prev) =>
          prev.map((m) => (m.id === aiMsgId ? { ...m, content: finalContent, loading: false } : m))
        );
      }

      // Persist to DB
      const aiMsgPersisted: Message = {
        id: aiMsgId,
        role: "assistant",
        content: finalContent,
        timestamp: Date.now(),
      };
      const allMessages = [...currentMessages, aiMsgPersisted];
      const chatMessages = msgsToChatMessages(allMessages);

      if (!currentSessionId) {
        // Create new session
        const title = trimmed.slice(0, 35) + (trimmed.length > 35 ? "…" : "");
        const res = await fetch("/api/chat-sessions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title, messages: chatMessages }),
        });
        if (res.ok) {
          const session = (await res.json()) as { id: string };
          setCurrentSessionId(session.id);
          onSessionCreated?.(session.id);
        }
      } else {
        // Update existing session
        await fetch(`/api/chat-sessions/${currentSessionId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: chatMessages }),
        });
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : "エラーが発生しました。";
      toaster.error({ title: "エラー", description: msg });
      setMessages((prev) => prev.filter((m) => m.id !== aiMsgId));
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const adjustTextarea = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  };

  return (
    <Flex
      direction="column"
      className={css({
        h: "calc(100vh - 200px)",
        minH: "500px",
        bg: "bg.card",
        border: "1px solid",
        borderColor: { base: "#E4E4E7", _dark: "#27272A" },
        borderRadius: "16px",
        overflow: "hidden",
      })}
    >
      {/* Header */}
      <Flex
        justify="flex-end"
        align="center"
        px={4}
        py={2}
        className={css({
          borderBottom: "1px solid",
          borderColor: { base: "#E4E4E7", _dark: "#27272A" },
          bg: { base: "#FAFAFA", _dark: "#18181B" },
        })}
      >
        {sessionLoading && (
          <span className={css({ fontSize: "xs", color: "text.muted", mr: "auto" })}>
            読み込み中...
          </span>
        )}
        <Button
          size="xs"
          variant="ghost"
          onClick={handleNewChat}
          className={css({
            color: "text.muted",
            fontSize: "xs",
            gap: 1,
            _hover: { color: "text.secondary", bg: { base: "#F4F4F5", _dark: "#27272A" } },
          })}
        >
          <PlusIcon size={12} />
          新しい会話
        </Button>
      </Flex>

      {/* Chat messages area */}
      <Box
        flex="1"
        overflowY="auto"
        px={4}
        py={6}
        className={css({
          scrollbarWidth: "thin",
          scrollbarColor: { base: "#E4E4E7 transparent", _dark: "#27272A transparent" },
        })}
      >
        <Stack gap={4} maxW="640px" mx="auto">
          {messages.map((msg) => (
            <Flex
              key={msg.id}
              direction="column"
              align={msg.role === "user" ? "flex-end" : "flex-start"}
              gap={1}
            >
              {/* Label */}
              <span
                className={css({
                  fontSize: "xs",
                  color: "text.muted",
                  px: 1,
                })}
              >
                {msg.role === "user" ? "あなた" : "AI コンサルタント"}
              </span>

              {/* Image preview (user, current session) */}
              {msg.image && (
                <img
                  src={msg.image}
                  alt="添付画像"
                  className={css({
                    maxW: "200px",
                    maxH: "200px",
                    borderRadius: "12px",
                    objectFit: "cover",
                    border: "1px solid",
                    borderColor: { base: "#E4E4E7", _dark: "#27272A" },
                  })}
                />
              )}
              {/* Image indicator for persisted messages */}
              {!msg.image && msg.hasImage && msg.role === "user" && (
                <span
                  className={css({
                    fontSize: "xs",
                    color: "text.muted",
                    px: 1,
                  })}
                >
                  （画像あり）
                </span>
              )}

              {/* Bubble */}
              {(msg.content || msg.loading) && (
                <Box
                  maxW="80%"
                  px={4}
                  py={3}
                  className={css({
                    borderRadius:
                      msg.role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                    bg:
                      msg.role === "user"
                        ? { base: "#09090B", _dark: "#FAFAFA" }
                        : { base: "#F4F4F5", _dark: "#27272A" },
                    color:
                      msg.role === "user"
                        ? { base: "#FAFAFA", _dark: "#09090B" }
                        : "text.primary",
                    fontSize: "sm",
                    lineHeight: 1.7,
                  })}
                >
                  {msg.loading ? (
                    <Flex gap={1} align="center" h={5}>
                      {[0, 1, 2].map((i) => (
                        <Box
                          key={i}
                          w={1.5}
                          h={1.5}
                          borderRadius="full"
                          bg="text.muted"
                          className={css({
                            animation: "bounce 1.2s ease infinite",
                            animationDelay: `${i * 0.2}s`,
                          })}
                        />
                      ))}
                    </Flex>
                  ) : msg.role === "assistant" ? (
                    <MarkdownRenderer>{msg.content}</MarkdownRenderer>
                  ) : (
                    <span style={{ whiteSpace: "pre-wrap" }}>{msg.content}</span>
                  )}
                </Box>
              )}
            </Flex>
          ))}
          <div ref={messagesEndRef} />
        </Stack>
      </Box>

      {/* Input area */}
      <Box
        className={css({
          borderTop: "1px solid",
          borderColor: { base: "#E4E4E7", _dark: "#27272A" },
          bg: "bg.base",
          px: 4,
          py: 3,
        })}
      >
        <Stack gap={2} maxW="640px" mx="auto">
          {/* Image preview */}
          {imagePreview && (
            <Flex align="center" gap={2}>
              <img
                src={imagePreview}
                alt="添付プレビュー"
                className={css({
                  w: 12,
                  h: 12,
                  objectFit: "cover",
                  borderRadius: "8px",
                  border: "1px solid",
                  borderColor: { base: "#E4E4E7", _dark: "#27272A" },
                })}
              />
              <span className={css({ fontSize: "xs", color: "text.secondary", flex: 1 })}>
                {image?.name}
              </span>
              <Button size="sm" variant="ghost" onClick={handleRemoveImage} px={1}>
                <XIcon size={14} />
              </Button>
            </Flex>
          )}

          {/* Input row */}
          <Flex gap={2} align="flex-end">
            {/* Image attach button */}
            <Button
              size="sm"
              variant="ghost"
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className={css({
                flexShrink: 0,
                color: imagePreview ? "brand.DEFAULT" : "text.secondary",
                _hover: { color: "text.primary", bg: { base: "#F4F4F5", _dark: "#27272A" } },
              })}
              title="画像を添付"
            >
              {imagePreview ? <PaperclipIcon size={18} /> : <ImageIcon size={18} />}
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept={acceptMimeTypes.join(",")}
              style={{ display: "none" }}
              onChange={handleImageSelect}
            />

            {/* Textarea */}
            <Box flex={1} position="relative">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  adjustTextarea();
                }}
                onKeyDown={handleKeyDown}
                placeholder="相談内容を入力... (Shift+Enter で改行)"
                rows={1}
                className={css({
                  w: "full",
                  resize: "none",
                  bg: { base: "#F4F4F5", _dark: "#27272A" },
                  border: "1px solid",
                  borderColor: { base: "#E4E4E7", _dark: "#3F3F46" },
                  borderRadius: "12px",
                  px: 3,
                  py: 2.5,
                  fontSize: "sm",
                  color: "text.primary",
                  outline: "none",
                  lineHeight: 1.6,
                  _focus: {
                    borderColor: "brand.DEFAULT",
                    bg: { base: "#FFFFFF", _dark: "#18181B" },
                  },
                  _placeholder: { color: "text.muted" },
                  transition: "border-color 0.15s ease, background 0.15s ease",
                })}
              />
            </Box>

            {/* Send button */}
            <Button
              size="sm"
              type="button"
              onClick={handleSubmit}
              loading={loading}
              disabled={!input.trim() && !image}
              className={css({
                flexShrink: 0,
                bg: { base: "#09090B", _dark: "#FAFAFA" },
                color: { base: "#FAFAFA", _dark: "#09090B" },
                borderRadius: "10px",
                w: 9,
                h: 9,
                p: 0,
                _hover: {
                  opacity: 0.85,
                },
                _disabled: {
                  opacity: 0.4,
                  cursor: "not-allowed",
                },
              })}
            >
              <SendIcon size={16} />
            </Button>
          </Flex>

          <span className={css({ fontSize: "xs", color: "text.muted", textAlign: "center" })}>
            Enter で送信 · Shift+Enter で改行 · 画像添付で詳細なアドバイスが可能
          </span>
        </Stack>
      </Box>
    </Flex>
  );
}
