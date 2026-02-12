import { AnalysisHistoryUseCase } from "@repo/module/service";
import { createFactory } from "hono/factory";
import { testClient } from "hono/testing";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  createInitApp,
  createProjectFactory,
  createSessionFactory,
  initDb,
} from "../../test/utils";
import { SESSION_COOKIE } from "../libs/cookie";
import { type Env, initApp } from "./_factory";

describe("history", () => {
  let client: Awaited<ReturnType<typeof initDb>>[0];
  let db: Awaited<ReturnType<typeof initDb>>[1];
  let app: typeof import("./history").route;
  let analysisHistoryUseCase: AnalysisHistoryUseCase<"libsql">;
  let createProject: ReturnType<typeof createProjectFactory>;
  let createSession: ReturnType<typeof createSessionFactory>;

  beforeEach(async () => {
    [client, db] = await initDb();
    vi.doMock("./_factory", () => ({
      projectGuard: createFactory<Env>({
        initApp(app) {
          createInitApp(db)(app);
          initApp(app);
        },
      }),
    }));
    const { route } = await import("./history");
    app = route;
    analysisHistoryUseCase = new AnalysisHistoryUseCase(db);
    createProject = createProjectFactory(db);
    createSession = createSessionFactory(db);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.resetAllMocks();
    vi.resetModules();
    client.close();
  });

  const analysisHistory = {
    projectId: "test",
    aiType: "market",
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
  };

  describe("[GET] /", () => {
    it("ログインしていないとアクセスできない", async () => {
      const res = await testClient(app).index.$get();
      expect(res.status).toBe(401);
    });

    it("ログインしているとアクセスできる", async () => {
      await createProject();
      const session = await createSession();
      await analysisHistoryUseCase.createAnalysisHistory(analysisHistory);
      const res = await testClient(app).index.$get(
        {},
        {
          headers: {
            cookie: `${SESSION_COOKIE}=${session.id}`,
          },
        },
      );
      expect(res.status).toBe(200);
      expect(await res.json()).toMatchObject([analysisHistory]);
    });

    it("他のプロジェクトの履歴は取得できない", async () => {
      await createProject();
      const session = await createSession();
      await analysisHistoryUseCase.createAnalysisHistory(analysisHistory);
      await createProject({ projectId: "other" });
      await analysisHistoryUseCase.createAnalysisHistory({
        ...analysisHistory,
        projectId: "other",
      });
      const res = await testClient(app).index.$get(
        {},
        {
          headers: {
            cookie: `${SESSION_COOKIE}=${session.id}`,
          },
        },
      );
      expect(res.status).toBe(200);
      expect(await res.json()).toMatchObject([analysisHistory]);
    });
  });

  describe("[GET] /:id", () => {
    it("ログインしていないとアクセスできない", async () => {
      const res = await testClient(app)[":id"].$get({
        param: {
          id: "1",
        },
      });
      expect(res.status).toBe(401);
    });

    it("ログインしているとアクセスできる", async () => {
      await createProject();
      const session = await createSession();
      const created = await analysisHistoryUseCase.createAnalysisHistory(analysisHistory);
      const res = await testClient(app)[":id"].$get(
        {
          param: {
            id: created.unwrap().id,
          },
        },
        {
          headers: {
            cookie: `${SESSION_COOKIE}=${session.id}`,
          },
        },
      );
      expect(res.status).toBe(200);
      expect(await res.json()).toMatchObject(analysisHistory);
    });

    it("他のプロジェクトの履歴は取得できない", async () => {
      await createProject();
      const session = await createSession();
      await analysisHistoryUseCase.createAnalysisHistory(analysisHistory);
      await createProject({ projectId: "other" });
      const created = await analysisHistoryUseCase.createAnalysisHistory({
        ...analysisHistory,
        projectId: "other",
      });
      const res = await testClient(app)[":id"].$get(
        {
          param: {
            id: created.unwrap().id,
          },
        },
        {
          headers: {
            cookie: `${SESSION_COOKIE}=${session.id}`,
          },
        },
      );
      expect(res.status).toBe(404);
    });
  });
});
