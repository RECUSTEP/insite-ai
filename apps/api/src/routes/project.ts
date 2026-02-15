import { projectGuard } from "./_factory";
import { zValidator } from "@hono/zod-validator";
import { projects } from "@repo/db/schema";
import { z } from "zod";

const getProjectHandler = projectGuard.createHandlers(async (c) => {
  const { projectId } = c.var.session;
  const projectResult = await c.var.projectUseCase.getProject({ projectId });
  if (!projectResult.ok) {
    return c.json({ error: projectResult.val }, 400);
  }
  const apiUsageResult = await c.var.apiUsageUseCase.getMonthlyApiUsageCount({ projectId });
  if (!apiUsageResult.ok) {
    return c.json({ error: apiUsageResult.val }, 400);
  }
  return c.json({
    projectId: projectResult.val.projectId,
    name: projectResult.val.name,
    apiUsageLimit: projectResult.val.apiUsageLimit,
    apiUsageCount: apiUsageResult.val,
    seoAddonEnabled: projectResult.val.seoAddonEnabled ?? false,
  });
});

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

export const createProjectSchema = z.object({
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
});

const createProjectHandler = projectGuard.createHandlers(
  zValidator("json", createProjectSchema),
  async (c) => {
    const { authId } = c.var.session;
    const body = c.req.valid("json");
    const result = await c.var.projectUseCase.createProject({
      ...body,
      authId,
      apiUsageLimit: 1000,
    });
    if (!result.ok) {
      return c.json({ error: result.val }, 400);
    }
    return c.json(result.val);
  },
);

export const deleteProjectSchema = createProjectSchema.pick({ projectId: true });
const deleteProjectHandler = projectGuard.createHandlers(
  zValidator("param", deleteProjectSchema),
  async (c) => {
    const authId = c.var.session.authId;
    const { projectId } = c.req.valid("param");

    // 削除対象のプロジェクトが認証者のものか
    const projectsResult = await c.var.projectUseCase.getByAuthId(authId);
    if (!projectsResult.ok) {
      return c.json({ error: projectsResult.val }, 500);
    }
    const isAuthedProject = projectsResult.val.reduce(
      (arr, cur) => arr || cur.projectId === projectId,
      false,
    );
    if (!isAuthedProject) {
      return c.json({ error: "権限のないプロジェクトの削除はできません" }, 403);
    }

    if (projectsResult.val.length <= 1) {
      return c.json({ error: "全てのプロジェクトを削除することはできません" }, 400);
    }

    const result = await c.var.projectUseCase.deleteProject({
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
  .post("/", ...createProjectHandler)
  .delete("/:projectId", ...deleteProjectHandler);
