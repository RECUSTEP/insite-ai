import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { initDb } from "../../test/utils";
import { AnalysisHistoryUseCaseError } from "../error";
import type { AnalysisHistoryInsert } from "../schema";
import { AnalysisHistoryUseCase } from "./analysis-history";
import { ProjectUseCase } from "./project";

describe("AnalysisHistoryUseCase", () => {
  let client: Awaited<ReturnType<typeof initDb>>[0];
  let db: Awaited<ReturnType<typeof initDb>>[1];
  let usecase: AnalysisHistoryUseCase<"libsql">;
  let projectUseCase: ProjectUseCase<"libsql">;

  beforeEach(async () => {
    [client, db] = await initDb();
    usecase = new AnalysisHistoryUseCase(db);
    projectUseCase = new ProjectUseCase(db);
  });

  afterEach(() => {
    client.close();
  });

  const defaultProject = {
    name: "test",
    managerName: "test",
    ownerName: "test",
    projectId: "test",
    projectPass: "test",
    apiUsageLimit: 100,
  };

  const analysisHistory = {
    projectId: defaultProject.projectId,
    aiType: "test",
    input: JSON.parse(
      JSON.stringify({
        image: "test",
        instruction: undefined,
      }),
    ),
    output: {
      output: "test",
    },
    createdAt: Date.now(),
  } satisfies AnalysisHistoryInsert;

  it("createAnalysisHistoryで分析履歴が作成できる", async () => {
    await projectUseCase.createProject(defaultProject);
    const result = await usecase.createAnalysisHistory(analysisHistory);
    expect(result.ok).toBe(true);
    expect(result.val).toMatchObject(analysisHistory);
  });

  it("createAnalysisHistoryで存在しないプロジェクトの場合エラー", async () => {
    const result = await usecase.createAnalysisHistory(analysisHistory);
    expect(result.ok).toBe(false);
    expect(result.val).toBe(AnalysisHistoryUseCaseError.ProjectNotFound);
  });

  it("getAnalysisHistoryで分析履歴が取得できる", async () => {
    await projectUseCase.createProject(defaultProject);
    const created = await usecase.createAnalysisHistory(analysisHistory);
    const result = await usecase.getAnalysisHistory({ id: created.unwrap().id });
    expect(result.ok).toBe(true);
    expect(result.val).toMatchObject(analysisHistory);
  });

  it("getAnalysisHistoryで存在しない分析履歴の場合エラー", async () => {
    const result = await usecase.getAnalysisHistory({ id: "" });
    expect(result.ok).toBe(false);
    expect(result.val).toBe(AnalysisHistoryUseCaseError.AnalysisHistoryNotFound);
  });

  it("getAnalysisHistoriesで分析履歴一覧が取得できる", async () => {
    await projectUseCase.createProject(defaultProject);
    await usecase.createAnalysisHistory(analysisHistory);
    const result = await usecase.getAnalysisHistories({
      projectId: defaultProject.projectId,
    });
    expect(result.ok).toBe(true);
    expect(result.val).toMatchObject([analysisHistory]);
  });

  it("getAnalysisHistoriesで分析履歴が存在しない場合は空配列", async () => {
    const result = await usecase.getAnalysisHistories({
      projectId: defaultProject.projectId,
    });
    expect(result.ok).toBe(true);
    expect(result.val).toMatchObject([]);
  });
});
