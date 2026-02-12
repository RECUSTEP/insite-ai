import { zValidator } from "@hono/zod-validator";
import type { SaveHelpInput } from "@repo/module/service";
import { z } from "zod";
import { adminGuard } from "./_factory";

export const helpSchema = z.object({
  market: z.string().optional(),
  competitor: z.string().optional(),
  account: z.string().optional(),
  insight: z.string().optional(),
  improvement: z.string().optional(),
  "improvement-no-image": z.string().optional(),
  "feed-post": z.string().optional(),
  "reel-and-stories": z.string().optional(),
  profile: z.string().optional(),
  "google-map": z.string().optional(),
  "google-map-no-image": z.string().optional(),
});

function toUseCase(value: z.infer<typeof helpSchema>): SaveHelpInput {
  return Object.entries(value).map(([aiType, text]) => ({ aiType, text: text ?? "" }));
}

function toResponse(value: SaveHelpInput): z.infer<typeof helpSchema> {
  const ret = value.reduce<Record<string, string>>((acc, { aiType, text }) => {
    acc[aiType] = text;
    return acc;
  }, {});
  return helpSchema.parse(ret);
}

const saveHelpHandler = adminGuard.createHandlers(zValidator("json", helpSchema), async (c) => {
  const result = await c.var.helpUseCase.saveHelp(toUseCase(c.req.valid("json")));
  if (!result.ok) {
    return c.json({ error: result.val }, 500);
  }
  return c.json(toResponse(result.val));
});

const getHelpHandler = adminGuard.createHandlers(async (c) => {
  const result = await c.var.helpUseCase.getHelp();
  if (!result.ok) {
    return c.json({ error: result.val }, 500);
  }
  return c.json(toResponse(result.val));
});

export const route = adminGuard
  .createApp()
  .put("/", ...saveHelpHandler)
  .get("/", ...getHelpHandler);
