import type { SaveHelpInput } from "@repo/module/service";
import { z } from "zod";
import { projectGuard } from "./_factory";

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

function toResponse(value: SaveHelpInput): z.infer<typeof helpSchema> {
  const ret = value.reduce<Record<string, string>>((acc, { aiType, text }) => {
    acc[aiType] = text;
    return acc;
  }, {});
  return helpSchema.parse(ret);
}

const getHelpHandler = projectGuard.createHandlers(async (c) => {
  const result = await c.var.helpUseCase.getHelp();
  if (!result.ok) {
    return c.json({ error: result.val }, 500);
  }
  return c.json(toResponse(result.val));
});

export const route = projectGuard.createApp().get("/", ...getHelpHandler);
