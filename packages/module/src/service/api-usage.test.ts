import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { initDb } from "../../test/utils";
import { ApiUsageUseCaseError } from "../error";
import { ApiUsageUseCase } from "./api-usage";
import { ProjectUseCase } from "./project";

describe("ApiUsageUseCase", () => {
  let client: Awaited<ReturnType<typeof initDb>>[0];
  let db: Awaited<ReturnType<typeof initDb>>[1];
  let usecase: ApiUsageUseCase<"libsql">;

  const defaultProject = {
    name: "test",
    managerName: "test",
    ownerName: "test",
    projectId: "test",
    projectPass: "test",
    apiUsageLimit: 100,
  };

  beforeEach(async () => {
    vi.useFakeTimers();
    [client, db] = await initDb();
    usecase = new ApiUsageUseCase(db);
    const projectUseCase = new ProjectUseCase(db);
    await projectUseCase.createProject(defaultProject);
  });

  afterEach(() => {
    vi.useRealTimers();
    client.close();
  });

  it("API利用履歴が作成できる", async () => {
    const result = await usecase.createApiUsage({ projectId: defaultProject.projectId });
    expect(result.ok).toBe(true);
    expect(result.unwrap().projectId).toBe(defaultProject.projectId);
    expect(result.unwrap().usedAt).toBeDefined();
  });

  it("複数のAPI利用履歴が作成できる", async () => {
    for (let i = 0; i < 10; i++) {
      await usecase.createApiUsage({ projectId: defaultProject.projectId });
    }
    const result = await usecase.getMonthlyApiUsageCount({ projectId: defaultProject.projectId });
    expect(result.ok).toBe(true);
    expect(result.val).toBe(10);
  });

  it("月間のAPI利用回数が取得できる", async () => {
    const result = await usecase.getMonthlyApiUsageCount({ projectId: defaultProject.projectId });
    expect(result.ok).toBe(true);
    expect(result.val).toBe(0);
  });

  it("存在しないプロジェクトIDでAPI利用履歴を作成するとエラー", async () => {
    const result = await usecase.createApiUsage({ projectId: "invalid" });
    expect(result.ok).toBe(false);
    expect(result.val).toBe(ApiUsageUseCaseError.ProjectNotFound);
  });

  it("存在しないプロジェクトIDで月間のAPI利用回数を取得すると0", async () => {
    const result = await usecase.getMonthlyApiUsageCount({ projectId: "invalid" });
    expect(result.ok).toBe(true);
    expect(result.val).toBe(0);
  });

  it("月をまたいでAPI利用履歴を作成すると月間のAPI利用回数がリセットされる", async () => {
    const d = new Date("2024-08-31T23:59:59.999+0900");
    vi.setSystemTime(d);
    await usecase.createApiUsage({ projectId: defaultProject.projectId });
    await usecase.getMonthlyApiUsageCount({ projectId: defaultProject.projectId });
    const result = await usecase.getMonthlyApiUsageCount({ projectId: defaultProject.projectId });
    expect(result.ok).toBe(true);
    expect(result.val).toBe(1);
    vi.setSystemTime(new Date(d.getTime() + 1));
    const result2 = await usecase.getMonthlyApiUsageCount({ projectId: defaultProject.projectId });
    expect(result2.ok).toBe(true);
    expect(result2.val).toBe(0);
  });
});
