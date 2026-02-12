import { zValidator } from "@hono/zod-validator";
import { AnalysisHistoryUseCaseError, CommonUseCaseError } from "@repo/module/error";
import { z } from "zod";
import { projectGuard } from "./_factory";

export const analysisHistorySchema = z.object({
  id: z.string(),
  projectId: z.string(),
  aiType: z.union([
    z.literal("market"),
    z.literal("competitor"),
    z.literal("account"),
    z.literal("insight"),
    z.literal("improvement"),
    z.literal("improvement-no-image"),
    z.literal("writing"),
    z.literal("writing-no-image"),
    z.literal("feed-post"),
    z.literal("reel-and-stories"),
    z.literal("profile"),
    z.literal("google-map"),
    z.literal("google-map-no-image"),
  ]),
  input: z.object({
    image: z.string().optional(),
    instruction: z.string().optional(),
  }),
  output: z.object({
    output: z.string(),
  }),
  createdAt: z.number(),
});

const getAnalysisHistorySchema = analysisHistorySchema.pick({ id: true });

const getAnalysisHistoryHandler = projectGuard.createHandlers(
  zValidator("param", getAnalysisHistorySchema),
  async (c) => {
    const { id } = c.req.valid("param");
    const result = await c.var.analysisHistoryUseCase.getAnalysisHistory({ id });
    if (!result.ok) {
      if (result.val === AnalysisHistoryUseCaseError.AnalysisHistoryNotFound) {
        return c.json({ error: result.val }, 404);
      }
      return c.json({ error: result.val }, 400);
    }
    if (result.val.projectId !== c.var.session.projectId) {
      return c.json({ error: AnalysisHistoryUseCaseError.AnalysisHistoryNotFound }, 404);
    }
    return c.json(analysisHistorySchema.parse(result.val));
  },
);

const getAnalysisHistoriesHandler = projectGuard.createHandlers(async (c) => {
  const { projectId } = c.var.session;
  const historiesResult = await c.var.analysisHistoryUseCase.getAnalysisHistories({ projectId });

  if (!historiesResult.ok) {
    return c.json({ error: CommonUseCaseError.UnknownError }, 400);
  }
  return c.json(historiesResult.val.map((history) => analysisHistorySchema.parse(history)));
});

export const route = projectGuard
  .createApp()
  .get("/:id", ...getAnalysisHistoryHandler)
  .get("/", ...getAnalysisHistoriesHandler);
