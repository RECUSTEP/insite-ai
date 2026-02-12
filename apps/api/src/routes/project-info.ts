import { zValidator } from "@hono/zod-validator";
import { ProjectInfoUseCaseError } from "@repo/module/error";
import { z } from "zod";
import { projectGuard } from "./_factory";

const getProjectHandler = projectGuard.createHandlers(async (c) => {
  const { projectId } = c.var.session;
  const result = await c.var.projectInfoUseCase.getProjectInfo({ projectId });
  if (!result.ok) {
    return c.json(
      { error: result.val },
      result.val === ProjectInfoUseCaseError.ProjectInfoNotFound ? 404 : 400,
    );
  }
  return c.json(result.val);
});

export const projectInfoSchema = z.object({
  businessType: z.string().optional(),
  address: z.string().optional(),
  nearestStation: z.string().optional(),
  concept: z.string().optional(),
  strength: z.string().optional(),
  targetAge: z.string().optional(),
  targetGender: z.string().optional(),
  targetArea: z.string().optional(),
  targetAttribute: z.string().optional(),
  targetConcern: z.string().optional(),
  existingCustomerAnalysis: z.string().optional(),
});

const saveProjectHandler = projectGuard.createHandlers(
  zValidator("json", projectInfoSchema),
  async (c) => {
    const { projectId } = c.var.session;
    const result = await c.var.projectInfoUseCase.saveProjectInfo({
      ...c.req.valid("json"),
      projectId,
    });
    if (!result.ok) {
      return c.json({ error: result.val }, 400);
    }
    return c.json(result.val);
  },
);

export const route = projectGuard
  .createApp()
  .get("/", ...getProjectHandler)
  .put("/", ...saveProjectHandler);
