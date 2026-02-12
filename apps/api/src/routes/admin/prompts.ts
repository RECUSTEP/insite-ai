import { zValidator } from "@hono/zod-validator";
import type { SavePromptInput } from "@repo/module/service";
import { z } from "zod";
import { adminGuard } from "./_factory";

const jsonSchema = z.object({
  system: z.string().optional().default(""),
  user: z.string().optional().default(""),
});

export const promptSchema = z.object({
  market: jsonSchema.optional(),
  competitor: jsonSchema.optional(),
  account: jsonSchema.optional(),
  insight: jsonSchema.optional(),
  improvement: jsonSchema.optional(),
  "improvement-no-image": jsonSchema.optional(),
  "feed-post": jsonSchema.optional(),
  "reel-and-stories": jsonSchema.optional(),
  profile: jsonSchema.optional(),
  "google-map": jsonSchema.optional(),
  "google-map-no-image": jsonSchema.optional(),
});

function toUseCase(value: z.infer<typeof promptSchema>): SavePromptInput {
  return Object.entries(value).map(([aiType, prompt]) => ({
    aiType,
    user: prompt.user,
    system: prompt.system,
  }));
}

function toResponse(value: SavePromptInput): z.infer<typeof promptSchema> {
  const ret = value.reduce<Record<string, unknown>>((acc, { aiType, user, system }) => {
    acc[aiType] = { user, system };
    return acc;
  }, {});
  return promptSchema.parse(ret);
}

const savePromptHandler = adminGuard.createHandlers(zValidator("json", promptSchema), async (c) => {
  const result = await c.var.promptUseCase.savePrompt(toUseCase(c.req.valid("json")));
  if (!result.ok) {
    return c.json({ error: result.val }, 500);
  }
  return c.json(toResponse(result.val));
});

const getPromptHandler = adminGuard.createHandlers(async (c) => {
  const result = await c.var.promptUseCase.getPrompt();
  if (!result.ok) {
    return c.json({ error: result.val }, 500);
  }
  return c.json(toResponse(result.val));
});

export const route = adminGuard
  .createApp()
  .put("/", ...savePromptHandler)
  .get("/", ...getPromptHandler);
