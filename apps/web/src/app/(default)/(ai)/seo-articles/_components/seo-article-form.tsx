"use client";

import { SectionTitle } from "@/app/(default)/_components/section-title";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import { toaster } from "@/app/_components/toast";
import { Form, GenerateButton, Output, Root } from "../../_components/form-fields";
import { Stack } from "styled-system/jsx";
import { useState } from "react";

export function SeoArticleForm() {
  const [instruction, setInstruction] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [suggestLoading, setSuggestLoading] = useState(false);

  const handleSuggest = async () => {
    setSuggestLoading(true);
    setSuggestions([]);
    try {
      const res = await fetch("/api/seo-suggest-keywords", { method: "POST" });
      if (!res.ok) throw new Error("Failed to fetch");
      const data = (await res.json()) as { keywords?: string[]; suggestions?: string };
      if (Array.isArray(data.keywords)) {
        setSuggestions(data.keywords);
      } else if (typeof data.suggestions === "string") {
        setSuggestions([data.suggestions]);
      }
    } catch {
      toaster.error({
        title: "エラー",
        description: "キーワードの取得に失敗しました",
      });
    } finally {
      setSuggestLoading(false);
    }
  };

  const handleKeywordClick = (keyword: string) => {
    setInstruction((prev) => (prev ? `${prev} ${keyword}` : keyword));
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
              <Button type="button" variant="outline" onClick={handleSuggest} loading={suggestLoading}>
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
      </Root>
    </Stack>
  );
}
