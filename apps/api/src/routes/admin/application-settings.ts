import { zValidator } from "@hono/zod-validator";
import type { SaveApplicationSettingInput } from "@repo/module/service";
import { z } from "zod";
import { META_SETTING_KEYS } from "../../libs/meta-feature-flags";
import { adminGuard } from "./_factory";

const metaFlagSchema = z.enum(["true", "false"]);

export const applicationSettingSchema = z.object({
  openAiApiKey: z.string().optional(),
  chatGptModel: z.string().optional(),
  /** Instagram / Threads インサイト分析（分析AI）の表示・API利用 */
  [META_SETTING_KEYS.insight]: metaFlagSchema.optional(),
  /** Meta 連携チャット機能 */
  [META_SETTING_KEYS.socialChat]: metaFlagSchema.optional(),
  /** Instagram / Threads アカウント連携（OAuth 等） */
  [META_SETTING_KEYS.accountLink]: metaFlagSchema.optional(),
});

const metaFlagDefaults = {
  [META_SETTING_KEYS.insight]: "false" as const,
  [META_SETTING_KEYS.socialChat]: "false" as const,
  [META_SETTING_KEYS.accountLink]: "false" as const,
};

function toUseCase(value: z.infer<typeof applicationSettingSchema>): SaveApplicationSettingInput {
  return Object.entries(value).map(([key, v]) => {
    if (key in metaFlagDefaults) {
      return { key, value: v === "true" ? "true" : "false" };
    }
    return { key, value: v ?? "" };
  });
}

function toResponse(value: SaveApplicationSettingInput): z.infer<typeof applicationSettingSchema> {
  const ret = value.reduce<Record<string, string>>((acc, { key, value: v }) => {
    acc[key] = v;
    return acc;
  }, {});
  const merged: Record<string, string> = { ...metaFlagDefaults, ...ret };
  return applicationSettingSchema.parse({
    openAiApiKey: merged.openAiApiKey,
    chatGptModel: merged.chatGptModel,
    [META_SETTING_KEYS.insight]: merged[META_SETTING_KEYS.insight] === "true" ? "true" : "false",
    [META_SETTING_KEYS.socialChat]:
      merged[META_SETTING_KEYS.socialChat] === "true" ? "true" : "false",
    [META_SETTING_KEYS.accountLink]:
      merged[META_SETTING_KEYS.accountLink] === "true" ? "true" : "false",
  });
}

const saveApplicationSettingHandler = adminGuard.createHandlers(
  zValidator("json", applicationSettingSchema),
  async (c) => {
    const result = await c.var.applicationSettingUseCase.saveApplicationSetting(
      toUseCase(c.req.valid("json")),
    );
    if (!result.ok) {
      return c.json({ error: result.val }, 500);
    }
    return c.json(toResponse(result.val));
  },
);

const getApplicationSettingHandler = adminGuard.createHandlers(async (c) => {
  const result = await c.var.applicationSettingUseCase.getApplicationSetting();
  if (!result.ok) {
    return c.json({ error: result.val }, 500);
  }
  return c.json(toResponse(result.val));
});

export const route = adminGuard
  .createApp()
  .put("/", ...saveApplicationSettingHandler)
  .get("/", ...getApplicationSettingHandler);
