import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { projectGuard } from "./_factory";
import { InstructionGuideSelect } from "@repo/module/schema";

const formNameSchema = z.union([
  z.literal("improvement"),
  z.literal("improvement-no-image"),
  z.literal("feed-post"),
  z.literal("reel-and-stories"),
  z.literal("profile"),
  z.literal("google-map"),
  z.literal("google-map-no-image"),
]);

const findInstructionGuideSchema = z.object({
  formNames: z.array(formNameSchema),
});

const resSchema = z.record(formNameSchema, z.string());

function toResponse(value: InstructionGuideSelect[]): z.infer<typeof resSchema> {
  const ret = value.reduce<Record<string, string>>((acc, { formName, text }) => {
    acc[formName] = text;
    return acc;
  }, {});
  return resSchema.parse(ret);
}

const findHandler = projectGuard.createHandlers(
  zValidator("json", findInstructionGuideSchema),
  async (c) => {
    const { formNames } = c.req.valid("json");
    const result = await c.var.instructionGuideUsecase.get(formNames);
    if (!result.ok) {
      return c.json({ error: result.val }, 500);
    }
    return c.json(toResponse(result.val));
  },
);

export const route = projectGuard.createApp().post("/", ...findHandler);
