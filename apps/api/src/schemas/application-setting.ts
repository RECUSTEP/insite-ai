import { z } from "zod";

export const CHAT_GPT_MODEL_OPTIONS = [
  {
    value: "gpt-5-mini",
    label: "GPT-5 mini（推奨・低コスト）",
  },
  {
    value: "gpt-5.4-mini",
    label: "GPT-5.4 mini（品質重視）",
  },
  {
    value: "gpt-5.6-terra",
    label: "GPT-5.6 Terra（高品質・高コスト）",
  },
  {
    value: "gpt-5.6-luna",
    label: "GPT-5.6 Luna（5.6系の低コスト版）",
  },
  {
    value: "gpt-5.6-sol",
    label: "GPT-5.6 Sol（最高品質・高コスト）",
  },
  {
    value: "gpt-4o-mini",
    label: "GPT-4o mini（既存設定の互換用）",
  },
] as const;

export const chatGptModelSchema = z.enum([
  "gpt-5-mini",
  "gpt-5.4-mini",
  "gpt-5.6-terra",
  "gpt-5.6-luna",
  "gpt-5.6-sol",
  "gpt-4o-mini",
]);

export type ChatGptModel = z.infer<typeof chatGptModelSchema>;

const metaFlagSchema = z.enum(["true", "false"]);

export const applicationSettingSchema = z.object({
  openAiApiKey: z.string().max(512).optional(),
  chatGptModel: chatGptModelSchema.optional(),
  metaInsightEnabled: metaFlagSchema.optional(),
  metaSocialChatEnabled: metaFlagSchema.optional(),
  metaAccountLinkEnabled: metaFlagSchema.optional(),
});

export const testOpenAiConnectionSchema = z.object({
  openAiApiKey: z.string().max(512).optional(),
  chatGptModel: chatGptModelSchema,
});
