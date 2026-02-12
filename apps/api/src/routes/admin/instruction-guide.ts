import { zValidator } from "@hono/zod-validator";
import type { SaveInstructionGuideInput } from "@repo/module/service";
import { z } from "zod";
import { adminGuard } from "./_factory";

export const saveInstructionGuideSchema = z.object({
  improvement: z.string().optional(),
  "improvement-no-image": z.string().optional(),
  "feed-post": z.string().optional(),
  "reel-and-stories": z.string().optional(),
  profile: z.string().optional(),
  "google-map": z.string().optional(),
  "google-map-no-image": z.string().optional(),
});

function toUseCase(value: z.infer<typeof saveInstructionGuideSchema>): SaveInstructionGuideInput {
  return Object.entries(value).map(([formName, text]) => ({ formName, text: text ?? "" }));
}

function toResponse(value: SaveInstructionGuideInput): z.infer<typeof saveInstructionGuideSchema> {
  const ret = value.reduce<Record<string, string>>((acc, { formName, text }) => {
    acc[formName] = text;
    return acc;
  }, {});
  return saveInstructionGuideSchema.parse(ret);
}

const saveHandler = adminGuard.createHandlers(
  zValidator("json", saveInstructionGuideSchema),
  async (c) => {
    const result = await c.var.instructionGuideUsecase.save(toUseCase(c.req.valid("json")));
    if (!result.ok) {
      return c.json({ error: result.val }, 500);
    }
    return c.json(toResponse(result.val));
  },
);

const getHandler = adminGuard.createHandlers(async (c) => {
  const result = await c.var.instructionGuideUsecase.getAll();
  if (!result.ok) {
    return c.json({ error: result.val }, 500);
  }
  return c.json(toResponse(result.val));
});

export const route = adminGuard
  .createApp()
  .put("/", ...saveHandler)
  .get("/", ...getHandler);
