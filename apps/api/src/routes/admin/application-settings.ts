import { zValidator } from "@hono/zod-validator";
import type { SaveApplicationSettingInput } from "@repo/module/service";
import { z } from "zod";
import { adminGuard } from "./_factory";

export const applicationSettingSchema = z.object({
  openAiApiKey: z.string().optional(),
  chatGptModel: z.string().optional(),
});

function toUseCase(value: z.infer<typeof applicationSettingSchema>): SaveApplicationSettingInput {
  return Object.entries(value).map(([key, value]) => ({ key, value: value ?? "" }));
}

function toResponse(value: SaveApplicationSettingInput): z.infer<typeof applicationSettingSchema> {
  const ret = value.reduce<Record<string, string>>((acc, { key, value }) => {
    acc[key] = value;
    return acc;
  }, {});
  return applicationSettingSchema.parse(ret);
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
