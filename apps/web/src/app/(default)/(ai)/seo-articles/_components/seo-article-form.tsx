"use client";

import { SectionTitle } from "@/app/(default)/_components/section-title";
import { toaster } from "@/app/_components/toast";
import { MarkdownRenderer } from "@/components/markdown";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import { useCallback, useEffect, useState } from "react";
import { Stack } from "styled-system/jsx";
import { Form, GenerateButton, Output, Root } from "../../_components/form-fields";

type SeoHistory = {
  id: string;
  aiType: string;
  output: { output: string };
  createdAt: number;
  revisionParentId: string | null;
  version: number;
};

export function SeoArticleForm() {
  const [instruction, setInstruction] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [suggestLoading, setSuggestLoading] = useState(false);
  const [histories, setHistories] = useState<SeoHistory[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [selectedHistoryId, setSelectedHistoryId] = useState("");
  const [revisionInstruction, setRevisionInstruction] = useState("");
  const [revising, setRevising] = useState(false);
  const [revisedOutput, setRevisedOutput] = useState("");

  const fetchSeoHistories = useCallback(async () => {
    setHistoryLoading(true);
    try {
      const res = await fetch("/api/history");
      if (!res.ok) {
        throw new Error("Failed to fetch history");
      }
      const data = (await res.json()) as SeoHistory[];
      const filtered = data
        .filter((v) => v.aiType === "seo-article" && typeof v.output?.output === "string")
        .sort((a, b) => b.createdAt - a.createdAt);
      setHistories(filtered);
      setSelectedHistoryId((prev) => prev || filtered[0]?.id || "");
    } catch {
      toaster.error({
        title: "エラー",
        description: "履歴の取得に失敗しました",
      });
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSeoHistories().catch(() => undefined);
  }, [fetchSeoHistories]);

  const handleSuggest = async () => {
    setSuggestLoading(true);
    setSuggestions([]);
    try {
      const res = await fetch("/api/seo-suggest-keywords", { method: "POST" });
      if (!res.ok) {
        if (res.status === 403) {
          const data = (await res.json()) as { error?: string };
          toaster.error({
            title: "エラー",
            description: data.error ?? "SEO/AIO記事生成機能は有効化されていません。",
          });
          return;
        }
        throw new Error("Failed to fetch");
      }
      const data = (await res.json()) as { keywords?: string[]; suggestions?: string };
      if (Array.isArray(data.keywords)) {
        setSuggestions(data.keywords);
      } else if (typeof data.suggestions === "string") {
        setSuggestions([data.suggestions]);
      }
    } catch (error) {
      toaster.error({
        title: "エラー",
        description: error instanceof Error ? error.message : "キーワードの取得に失敗しました",
      });
    } finally {
      setSuggestLoading(false);
    }
  };

  const handleKeywordClick = (keyword: string) => {
    setInstruction((prev) => (prev ? `${prev} ${keyword}` : keyword));
  };

  const handleRevise = async () => {
    if (!selectedHistoryId) {
      toaster.error({
        title: "エラー",
        description: "修正対象の記事を選択してください",
      });
      return;
    }
    if (!revisionInstruction.trim()) {
      toaster.error({
        title: "エラー",
        description: "修正指示を入力してください",
      });
      return;
    }
    setRevising(true);
    try {
      const res = await fetch("/api/seo-article-revise", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          historyId: selectedHistoryId,
          revisionInstruction,
        }),
      });
      const data = (await res.json()) as { output?: string; error?: string };
      if (!res.ok) {
        if (res.status === 403) {
          throw new Error(data.error ?? "SEO/AIO記事生成機能は有効化されていません。");
        }
        throw new Error(data.error ?? "修正に失敗しました");
      }
      setRevisedOutput(data.output ?? "");
      toaster.success({
        title: "修正完了",
        description: "記事を修正しました（クレジットを1消費）",
      });
      await fetchSeoHistories();
    } catch (error) {
      toaster.error({
        title: "エラー",
        description: error instanceof Error ? error.message : "修正に失敗しました",
      });
    } finally {
      setRevising(false);
    }
  };

  return (
    <Stack gap="12">
      <Root option={{ type: "seo-article" }}>
        <Form>
          <Stack gap="4">
            <SectionTitle>キーワード・指示</SectionTitle>
            <Field.Root>
              <Textarea
                name="instruction"
                rows={3}
                resize="none"
                placeholder="キーワードを入力（例: 〇〇 目標文字数: 1000字）"
                value={instruction}
                onChange={(e) => setInstruction(e.target.value)}
                required
              />
            </Field.Root>
            <Stack gap="2" direction="row" flexWrap="wrap">
              <Button
                type="button"
                variant="outline"
                onClick={handleSuggest}
                loading={suggestLoading}
              >
                キーワードを提案
              </Button>
              <GenerateButton>記事を生成</GenerateButton>
            </Stack>
            {suggestions.length > 0 && (
              <Stack gap="2">
                <SectionTitle>提案キーワード（クリックで追加）</SectionTitle>
                <Stack direction="row" gap="2" flexWrap="wrap">
                  {suggestions.map((kw) => (
                    <Button
                      key={kw}
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => handleKeywordClick(kw)}
                    >
                      {kw}
                    </Button>
                  ))}
                </Stack>
              </Stack>
            )}
          </Stack>
        </Form>
        <Stack gap="4">
          <SectionTitle>生成結果</SectionTitle>
          <Output />
        </Stack>
        <Stack gap="4">
          <SectionTitle>生成済み記事の修正</SectionTitle>
          <Field.Root>
            <Field.Label>修正対象の記事</Field.Label>
            <select
              value={selectedHistoryId}
              onChange={(e) => setSelectedHistoryId(e.target.value)}
              disabled={historyLoading}
            >
              <option value="">選択してください</option>
              {histories.map((history) => (
                <option key={history.id} value={history.id}>
                  {new Date(history.createdAt).toLocaleString()} / v{history.version}
                </option>
              ))}
            </select>
          </Field.Root>
          <Field.Root>
            <Field.Label>修正指示</Field.Label>
            <Textarea
              rows={4}
              resize="none"
              placeholder="例: 『具体的な実践方法』セクションを初心者向けに、手順を3ステップで分かりやすくして"
              value={revisionInstruction}
              onChange={(e) => setRevisionInstruction(e.target.value)}
            />
          </Field.Root>
          <Stack direction="row" gap="2">
            <Button
              type="button"
              variant="outline"
              onClick={fetchSeoHistories}
              loading={historyLoading}
            >
              履歴を更新
            </Button>
            <Button type="button" onClick={handleRevise} loading={revising}>
              選択記事を修正
            </Button>
          </Stack>
          {revisedOutput ? (
            <Stack gap="2">
              <SectionTitle>修正結果</SectionTitle>
              <MarkdownRenderer>{revisedOutput}</MarkdownRenderer>
            </Stack>
          ) : null}
        </Stack>
      </Root>
    </Stack>
  );
}
