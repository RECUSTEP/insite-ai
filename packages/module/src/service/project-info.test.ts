import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { initDb } from "../../test/utils";
import { ProjectInfoUseCaseError } from "../error";
import type { ProjectInfoInsert, ProjectInsert } from "../schema";
import { ProjectUseCase } from "./project";
import { ProjectInfoUseCase } from "./project-info";

describe("ProjectInfoUseCase", () => {
  let client: Awaited<ReturnType<typeof initDb>>[0];
  let db: Awaited<ReturnType<typeof initDb>>[1];
  let usecase: ProjectInfoUseCase<"libsql">;

  const defaultProject: ProjectInsert = {
    name: "test",
    managerName: "test",
    ownerName: "test",
    projectId: "test",
    projectPass: "test",
    apiUsageLimit: 100,
  };

  beforeEach(async () => {
    [client, db] = await initDb();
    usecase = new ProjectInfoUseCase(db);
    const projectUseCase = new ProjectUseCase(db);
    await projectUseCase.createProject(defaultProject);
  });

  afterEach(() => {
    client.close();
  });

  const projectInfo: ProjectInfoInsert = {
    projectId: defaultProject.projectId,
    businessType: "test",
    address: "test",
    nearestStation: "test",
    concept: "test",
    strength: "test",
    targetAge: "test",
    targetGender: "test",
    targetArea: "test",
    targetAttribute: "test",
    targetConcern: "test",
    existingCustomerAnalysis: "test",
  };

  it("プロジェクト情報が保存できる", async () => {
    const result = await usecase.saveProjectInfo(projectInfo);
    expect(result.ok).toBe(true);
    expect(result.val).toMatchObject(projectInfo);
  });

  it("プロジェクト情報が更新できる", async () => {
    await usecase.saveProjectInfo(projectInfo);
    const updatedProjectInfo = await usecase.saveProjectInfo({
      ...projectInfo,
      businessType: "updated",
    });
    expect(updatedProjectInfo.ok).toBe(true);
    expect(updatedProjectInfo.val).toMatchObject({
      ...projectInfo,
      businessType: "updated",
    });
  });

  it("プロジェクト情報が取得できる", async () => {
    await usecase.saveProjectInfo(projectInfo);
    const result = await usecase.getProjectInfo({ projectId: projectInfo.projectId });
    expect(result.ok).toBe(true);
    expect(result.val).toMatchObject(projectInfo);
  });

  it("存在しないプロジェクトIDでプロジェクト情報を保存するとエラー", async () => {
    const result = await usecase.saveProjectInfo({ ...projectInfo, projectId: "notfound" });
    expect(result.ok).toBe(false);
    expect(result.val).toBe(ProjectInfoUseCaseError.ProjectNotFound);
  });

  it("存在しないプロジェクトIDでプロジェクト情報を取得するとエラー", async () => {
    const result = await usecase.getProjectInfo({ projectId: "notfound" });
    expect(result.ok).toBe(false);
    expect(result.val).toBe(ProjectInfoUseCaseError.ProjectInfoNotFound);
  });
});
