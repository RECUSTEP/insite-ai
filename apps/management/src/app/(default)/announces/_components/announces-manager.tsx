"use client";

import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { css } from "styled-system/css";
import { Box, Flex, VStack } from "styled-system/jsx";
import { saveAnnounce, deleteAnnounce } from "../_actions/announce";

type Announce = {
  id: number;
  title: string;
  content: string;
  createdAt: number;
  updatedAt: number;
};

interface AnnouncesManagerProps {
  initialAnnounces: Announce[];
}

export function AnnouncesManager({ initialAnnounces }: AnnouncesManagerProps) {
  const [announces, setAnnounces] = useState<Announce[]>(initialAnnounces);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({ title: "", content: "" });

  const handleStartCreate = () => {
    setIsCreating(true);
    setEditingId(null);
    setFormData({ title: "", content: "" });
  };

  const handleStartEdit = (announce: Announce) => {
    setEditingId(announce.id);
    setIsCreating(false);
    setFormData({ title: announce.title, content: announce.content });
  };

  const handleCancel = () => {
    setIsCreating(false);
    setEditingId(null);
    setFormData({ title: "", content: "" });
  };

  const handleSave = async () => {
    if (!formData.title.trim() || !formData.content.trim()) {
      alert("タイトルと内容を入力してください");
      return;
    }

    try {
      const result = await saveAnnounce({
        id: editingId ?? undefined,
        title: formData.title,
        content: formData.content,
      });

      if (editingId) {
        // 更新
        setAnnounces(announces.map((a) => (a.id === editingId ? result : a)));
        alert("お知らせを更新しました");
      } else {
        // 新規作成
        setAnnounces([result, ...announces]);
        alert("お知らせを作成しました");
      }

      handleCancel();
    } catch (error) {
      alert("保存に失敗しました");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("このお知らせを削除しますか？")) {
      return;
    }

    try {
      await deleteAnnounce(id);
      setAnnounces(announces.filter((a) => a.id !== id));
      alert("お知らせを削除しました");
    } catch (error) {
      alert("削除に失敗しました");
    }
  };

  return (
    <VStack gap={6} alignItems="stretch">
      {/* 新規作成ボタン */}
      {!isCreating && !editingId && (
        <Button onClick={handleStartCreate}>新規お知らせを作成</Button>
      )}

      {/* 作成/編集フォーム */}
      {(isCreating || editingId) && (
        <Box
          className={css({
            p: 6,
            borderRadius: "md",
            border: "1px solid",
            borderColor: "gray.200",
            bg: "gray.50",
          })}
        >
          <VStack gap={4} alignItems="stretch">
            <Field.Root>
              <Field.Label>タイトル</Field.Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="お知らせのタイトル"
              />
            </Field.Root>

            <Field.Root>
              <Field.Label>内容（Markdown形式）</Field.Label>
              <Textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="お知らせの内容をMarkdown形式で入力"
                rows={10}
                resize="vertical"
              />
            </Field.Root>

            <Flex gap={2}>
              <Button onClick={handleSave}>
                {editingId ? "更新" : "作成"}
              </Button>
              <Button variant="outline" onClick={handleCancel}>
                キャンセル
              </Button>
            </Flex>
          </VStack>
        </Box>
      )}

      {/* お知らせ一覧 */}
      <VStack gap={4} alignItems="stretch">
        <Text size="lg" fontWeight="semibold">
          お知らせ一覧
        </Text>

        {announces.length === 0 ? (
          <Text color="gray.500">お知らせがありません</Text>
        ) : (
          announces.map((announce) => (
            <Box
              key={announce.id}
              className={css({
                p: 4,
                borderRadius: "md",
                border: "1px solid",
                borderColor: "gray.200",
                bg: "white",
              })}
            >
              <VStack gap={2} alignItems="stretch">
                <Flex justify="space-between" align="center">
                  <Text size="lg" fontWeight="semibold">
                    {announce.title}
                  </Text>
                  <Flex gap={2}>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleStartEdit(announce)}
                      disabled={isCreating || editingId !== null}
                    >
                      編集
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(announce.id)}
                      disabled={isCreating || editingId !== null}
                    >
                      削除
                    </Button>
                  </Flex>
                </Flex>

                <Text
                  className={css({
                    fontSize: "sm",
                    color: "gray.600",
                    whiteSpace: "pre-wrap",
                    maxH: "200px",
                    overflow: "auto",
                  })}
                >
                  {announce.content.substring(0, 200)}
                  {announce.content.length > 200 && "..."}
                </Text>

                <Text fontSize="xs" color="gray.500">
                  作成日時: {new Date(announce.createdAt).toLocaleString("ja-JP")}
                </Text>
              </VStack>
            </Box>
          ))
        )}
      </VStack>
    </VStack>
  );
}
