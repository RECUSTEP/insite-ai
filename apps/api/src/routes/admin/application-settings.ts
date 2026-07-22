import { zValidator } from "@hono/zod-validator";
import type { SaveApplicationSettingInput } from "@repo/module/service";
import openAi from "openai";
import type { z } from "zod";
import { META_SETTING_KEYS } from "../../libs/meta-feature-flags";
import {
  applicationSettingSchema,
  chatGptModelSchema,
  testOpenAiConnectionSchema,
} from "../../schemas/application-setting";
import { adminGuard } from "./_factory";

const metaFlagDefaults = {
  [META_SETTING_KEYS.insight]: "false" as const,
  [META_SETTING_KEYS.socialChat]: "false" as const,
  [META_SETTING_KEYS.accountLink]: "false" as const,
};

function toUseCase(value: z.infer<typeof applicationSettingSchema>): SaveApplicationSettingInput {
  return Object.entries(value)
    .filter(([key, v]) => key !== "openAiApiKey" || Boolean(v?.trim()))
    .map(([key, v]) => {
      if (key in metaFlagDefaults) {
        return { key, value: v === "true" ? "true" : "false" };
      }
      return { key, value: v ?? "" };
    });
}

function toResponse(value: SaveApplicationSettingInput) {
  const ret = value.reduce<Record<string, string>>((acc, { key, value: v }) => {
    acc[key] = v;
    return acc;
  }, {});
  const merged: Record<string, string> = { ...metaFlagDefaults, ...ret };
  const parsedModel = chatGptModelSchema.safeParse(merged.chatGptModel);
  return applicationSettingSchema.parse({
    // APIキーは保存済みでもブラウザへ返さない。
    openAiApiKey: "",
    chatGptModel: parsedModel.success ? parsedModel.data : "gpt-4o-mini",
    [META_SETTING_KEYS.insight]: merged[META_SETTING_KEYS.insight] === "true" ? "true" : "false",
    [META_SETTING_KEYS.socialChat]:
      merged[META_SETTING_KEYS.socialChat] === "true" ? "true" : "false",
    [META_SETTING_KEYS.accountLink]:
      merged[META_SETTING_KEYS.accountLink] === "true" ? "true" : "false",
  });
}

function getOpenAiErrorStatus(error: unknown): number | undefined {
  if (!error || typeof error !== "object" || !("status" in error)) {
    return undefined;
  }
  return typeof error.status === "number" ? error.status : undefined;
}

function getOpenAiErrorMetadata(error: unknown) {
  if (!error || typeof error !== "object") {
    return {};
  }
  const code = "code" in error && typeof error.code === "string" ? error.code : undefined;
  const requestId =
    "request_id" in error && typeof error.request_id === "string" ? error.request_id : undefined;
  return { code, requestId };
}

function getConnectionFailureMessage(status: number | undefined): string {
  if (status === 401) {
    return "OpenAI APIキーを認証できませんでした。キーを確認してください。";
  }
  if (status === 403 || status === 404) {
    return "このAPIキーでは選択したモデルを利用できません。別のモデルを選択してください。";
  }
  if (status === 429) {
    return "OpenAI APIの利用上限に達しているため確認できませんでした。利用状況を確認してください。";
  }
  return "OpenAIへの接続を確認できませんでした。時間を置いて再度お試しください。";
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

const testOpenAiConnectionHandler = adminGuard.createHandlers(
  zValidator("json", testOpenAiConnectionSchema),
  async (c) => {
    const input = c.req.valid("json");
    let apiKey = input.openAiApiKey?.trim();

    if (!apiKey) {
      const settings = await c.var.applicationSettingUseCase.getApplicationSetting();
      if (!settings.ok) {
        return c.json({ ok: false as const, error: "保存済み設定を取得できませんでした。" }, 500);
      }
      apiKey = settings.val.find((setting) => setting.key === "openAiApiKey")?.value.trim();
    }

    if (!apiKey) {
      return c.json({ ok: false as const, error: "保存済みのOpenAI APIキーがありません。" }, 422);
    }

    try {
      const client = new openAi({ apiKey });
      await client.models.retrieve(input.chatGptModel);
      return c.json({ ok: true as const, model: input.chatGptModel });
    } catch (error) {
      const status = getOpenAiErrorStatus(error);
      console.error(
        JSON.stringify({
          message: "OpenAI connection test failed",
          status,
          ...getOpenAiErrorMetadata(error),
        }),
      );
      return c.json({ ok: false as const, error: getConnectionFailureMessage(status) }, 422);
    }
  },
);

export const route = adminGuard
  .createApp()
  .put("/", ...saveApplicationSettingHandler)
  .get("/", ...getApplicationSettingHandler)
  .post("/test-openai", ...testOpenAiConnectionHandler);
