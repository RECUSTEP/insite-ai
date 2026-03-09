import { Text } from "@/components/ui/text";
import { createClient } from "@/lib/api";
import { cookies } from "next/headers";
import { css } from "styled-system/css";
import { Box, VStack } from "styled-system/jsx";
import { SavePromptForm } from "./_components/save-prompt-form";

const PLACEHOLDER_DOCS = [
  "## 利用可能なプレースホルダー（プロンプトに記述すると実行時に置換）",
  "",
  "- ${storeName} - 店舗名",
  "- ${instagramTemplate} - テンプレート文章（User画面のInstagram設定）",
  "- ${instagramKeyword1} - キーワード1",
  "- ${instagramKeyword2} - キーワード2",
  "- ${instagramKeyword3} - キーワード3",
  "- ${businessType} - 業種",
  "- ${concept} - お店のコンセプト",
  "- ${strength} - 自社の強み・差別化ポイント",
  "- ${instruction} - ユーザーの指示（フォーム入力）",
  "- ${images} - 画像の説明（画像ありの場合は自動挿入）",
].join("\n");

export default async function Page() {
  const client = createClient();
  const response = await client.admin.prompts.$get(
    {},
    {
      headers: {
        cookie: cookies().toString(),
      },
    },
  );

  if (!response.ok) {
    throw new Error("Failed to fetch help info");
  }
  const defaultValue = await response.json();

  return (
    <VStack w="full" maxW="full" py="6" gap="8" alignItems="stretch">
      <Text as="h1" size="xl">
        プロンプト設定
      </Text>
      <Box
        className={css({
          p: 4,
          borderRadius: "12px",
          bg: { base: "#F4F4F5", _dark: "#27272A" },
          border: "1px solid",
          borderColor: { base: "#E4E4E7", _dark: "#3F3F46" },
          fontSize: "xs",
          color: "text.secondary",
          whiteSpace: "pre-wrap",
          fontFamily: "mono",
        })}
      >
        <Text as="strong" fontSize="sm" color="text.primary" mb={2} display="block">
          ライティングAI（Instagram）用プレースホルダー
        </Text>
        <Text fontSize="xs" color="text.secondary" mb={2} display="block">
          フィード投稿・リール・プロフィールのプロンプトに上記プレースホルダーを記述すると、
          User画面のプロジェクト設定（テンプレート文章・キーワード1〜3）の値が自動で反映されます。
        </Text>
        {PLACEHOLDER_DOCS}
      </Box>
      <SavePromptForm defaultValue={defaultValue} />
    </VStack>
  );
}
