import { zValidator } from "@hono/zod-validator";
import { CommonUseCaseError, ProjectUseCaseError } from "@repo/module/error";
import { z } from "zod";
import { adminGuard } from "./_factory";

export const ErrorMessages = {
  ProjectNameRequired: "プロジェクト名を入力してください",
  ManagerNameRequired: "担当者名を入力してください",
  OwnerNameRequired: "オーナー名を入力してください",
  ProjectIdRequired: "プロジェクトIDを入力してください",
  ProjectPassRequired: "プロジェクトパスワードを入力してください",
  ApiUsageLimitRequired: "API使用可能回数を入力してください",
  ApiUsageLimitMustBeNumber: "API使用可能回数は数値で入力してください",
  ApiUsageLimitMustBeInteger: "API使用可能回数は整数で入力してください",
  ApiUsageLimitMustBeNonnegative: "API使用可能回数は0以上の値で入力してください",
  AuthIdRequired: "認証IDを入力してください",
};

export const projectSchema = z.object({
  id: z.number().optional(),
  name: z
    .string({ required_error: ErrorMessages.ProjectNameRequired })
    .min(1, ErrorMessages.ProjectNameRequired),
  managerName: z
    .string({ required_error: ErrorMessages.ManagerNameRequired })
    .min(1, ErrorMessages.ManagerNameRequired),
  ownerName: z
    .string({ required_error: ErrorMessages.OwnerNameRequired })
    .min(1, ErrorMessages.OwnerNameRequired),
  projectId: z
    .string({ required_error: ErrorMessages.ProjectIdRequired })
    .min(1, ErrorMessages.ProjectIdRequired),
  apiUsageLimit: z
    .number({
      required_error: ErrorMessages.ApiUsageLimitRequired,
      message: ErrorMessages.ApiUsageLimitMustBeNumber,
    })
    .int(ErrorMessages.ApiUsageLimitMustBeInteger)
    .nonnegative(ErrorMessages.ApiUsageLimitMustBeNonnegative),
  authId: z
    .string({
      required_error: ErrorMessages.AuthIdRequired,
    })
    .min(1, ErrorMessages.AuthIdRequired),
  seoAddonEnabled: z.boolean().optional(),
});

const createProjectHandler = adminGuard.createHandlers(
  zValidator("json", projectSchema),
  async (c) => {
    const result = await c.var.projectUseCase.createProject(c.req.valid("json"));
    if (!result.ok) {
      return c.json({ error: result.val }, 400);
    }
    return c.json(result.val);
  },
);

export const updateProjectSchema = projectSchema
  .omit({
    projectId: true,
    authId: true,
  })
  .partial();

const updateProjectHandler = adminGuard.createHandlers(
  zValidator("param", projectSchema.pick({ projectId: true })),
  zValidator("json", updateProjectSchema),
  async (c) => {
    const result = await c.var.projectUseCase.updateProject({
      projectId: c.req.valid("param").projectId,
      ...c.req.valid("json"),
    });
    if (!result.ok) {
      return c.json({ error: result.val }, 400);
    }
    return c.json(result.val);
  },
);

export const getProjectSchema = projectSchema.pick({ projectId: true });

const getProjectHandler = adminGuard.createHandlers(
  zValidator("param", getProjectSchema),
  async (c) => {
    const result = await c.var.projectUseCase.getProject(c.req.valid("param"));
    if (!result.ok) {
      return c.json(
        { error: result.val },
        result.val === ProjectUseCaseError.ProjectNotFound ? 404 : 400,
      );
    }
    return c.json(result.val);
  },
);

export const getProjectsSchema = z.object({
  offset: z.coerce.number().int().nonnegative(),
  limit: z.coerce.number().int().nonnegative(),
  searchText: z.string().optional(),
  searchColumnName: z.union([z.literal("projectName"), z.literal("ownerName")]).optional(),
});

const getProjectsHandler = adminGuard.createHandlers(
  zValidator("query", getProjectsSchema),
  async (c) => {
    const { offset, limit, searchText, searchColumnName } = c.req.valid("query");
    const result = await c.var.projectUseCase.getProjects({
      offset,
      limit,
      searchColumnName,
      searchText,
    });
    const count = await c.var.projectUseCase.countProjects({
      searchColumnName,
      searchText,
    });
    if (!result.ok || !count.ok) {
      return c.json({ error: CommonUseCaseError.UnknownError }, 400);
    }
    const hasNext = count.val > offset + limit;
    return c.json({ projects: result.val, hasNext });
  },
);

export const deleteProjectSchema = projectSchema.pick({ projectId: true });

const deleteProjectHandler = adminGuard.createHandlers(
  zValidator("param", deleteProjectSchema),
  async (c) => {
    const result = await c.var.projectUseCase.deleteProject(c.req.valid("param"));
    if (!result.ok) {
      return c.json({ error: result.val }, 400);
    }
    return c.json(result.val);
  },
);

export const route = adminGuard
  .createApp()
  .post("/", ...createProjectHandler)
  .patch("/:projectId", ...updateProjectHandler)
  .get("/:projectId", ...getProjectHandler)
  .get("/", ...getProjectsHandler)
  .delete("/:projectId", ...deleteProjectHandler);
