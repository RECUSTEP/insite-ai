import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { initDb } from "../../test/utils";
import { ProjectUseCaseError } from "../error";
import type { ProjectInsert } from "../schema";
import { ProjectUseCase } from "./project";

describe("ProjectUseCase", () => {
  let client: Awaited<ReturnType<typeof initDb>>[0];
  let db: Awaited<ReturnType<typeof initDb>>[1];
  let usecase: ProjectUseCase<"libsql">;

  beforeEach(async () => {
    [client, db] = await initDb();
    usecase = new ProjectUseCase(db);
  });

  afterEach(() => {
    client.close();
  });

  const defaultProject: ProjectInsert = {
    name: "test",
    managerName: "test",
    ownerName: "test",
    projectId: "test",
    projectPass: "test",
    apiUsageLimit: 100,
  };

  it("createProjectでプロジェクトが作成できる", async () => {
    const project = await usecase.createProject(defaultProject);
    expect(project.ok).toBe(true);
    expect(project.val).toMatchObject(defaultProject);
  });

  it("updateProjectでプロジェクトが更新できる", async () => {
    await usecase.createProject(defaultProject);
    const updatedProject = await usecase.updateProject({
      ...defaultProject,
      name: "updated",
    });
    expect(updatedProject.ok).toBe(true);
    expect(updatedProject.val).toMatchObject({
      ...defaultProject,
      name: "updated",
    });
  });

  it("updateProjectで一部のプロパティだけ更新できる", async () => {
    await usecase.createProject(defaultProject);
    const updatedProject = await usecase.updateProject({
      projectId: defaultProject.projectId,
      name: "updated",
    });
    expect(updatedProject.ok).toBe(true);
    expect(updatedProject.val).toMatchObject({
      ...defaultProject,
      name: "updated",
    });
  });

  it("getProjectでプロジェクトが取得できる", async () => {
    await usecase.createProject(defaultProject);
    const project = await usecase.getProject({ projectId: defaultProject.projectId });
    expect(project.ok).toBe(true);
    expect(project.val).toMatchObject(defaultProject);
  });

  it("getProjectsでプロジェクトリストが取得できる", async () => {
    const projects = Array.from({ length: 10 }, (_, i) => ({
      ...defaultProject,
      projectId: `project-${i}`,
    }));
    await Promise.all(projects.map((project) => usecase.createProject(project)));
    const result1 = await usecase.getProjects({ limit: 5, offset: 0 });
    const result2 = await usecase.getProjects({ limit: 5, offset: 5 });
    expect(result1.ok).toBe(true);
    expect(result1.val).toMatchObject(projects.slice(0, 5));
    expect(result2.ok).toBe(true);
    expect(result2.val).toMatchObject(projects.slice(5, 10));
  });

  it("deleteProjectでプロジェクトが削除できる", async () => {
    await usecase.createProject(defaultProject);
    const project = await usecase.deleteProject({ projectId: defaultProject.projectId });
    expect(project.ok).toBe(true);
    expect(project.val).toBeNull();
  });

  it("重複したプロジェクトを作成するとエラーが返る", async () => {
    await usecase.createProject(defaultProject);
    const project = await usecase.createProject(defaultProject);
    expect(project.ok).toBe(false);
    expect(project.val).toBe(ProjectUseCaseError.ProjectAlreadyExists);
  });

  it("存在しないプロジェクトを取得するとエラーが返る", async () => {
    const project = await usecase.getProject({ projectId: "not-exists" });
    expect(project.ok).toBe(false);
    expect(project.val).toBe(ProjectUseCaseError.ProjectNotFound);
  });

  it("存在しないプロジェクトを更新するとエラーが返る", async () => {
    const project = await usecase.updateProject(defaultProject);
    expect(project.ok).toBe(false);
    expect(project.val).toBe(ProjectUseCaseError.ProjectNotFound);
  });

  it("存在しないプロジェクトを削除するとエラーが返る", async () => {
    const project = await usecase.deleteProject({ projectId: "not-exists" });
    expect(project.ok).toBe(false);
    expect(project.val).toBe(ProjectUseCaseError.ProjectNotFound);
  });

  it("countProjectsでプロジェクト数が取得できる", async () => {
    const projects = Array.from({ length: 10 }, (_, i) => ({
      ...defaultProject,
      projectId: `project-${i}`,
    }));
    await Promise.all(projects.map((project) => usecase.createProject(project)));
    const count = await usecase.countProjects();
    expect(count.ok).toBe(true);
    expect(count.val).toBe(10);
  });
});
