import { ProjectInfoUseCase } from "@repo/module/service";
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

describe("project-info", () => {
  let client: Awaited<ReturnType<typeof initDb>>[0];
  let db: Awaited<ReturnType<typeof initDb>>[1];
  let app: typeof import("./project-info").route;
  let usecase: ProjectInfoUseCase<"libsql">;
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
    const { route } = await import("./project-info");
    app = route;
    usecase = new ProjectInfoUseCase(db);
    createProject = createProjectFactory(db);
    createSession = createSessionFactory(db);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.resetAllMocks();
    vi.resetModules();
    client.close();
  });

  const projectInfo = {
    projectId: "test",
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

  describe("[GET] /", () => {
    it("ログインしていないとアクセスできない", async () => {
      const res = await testClient(app).index.$get();
      expect(res.status).toBe(401);
    });

    it("プロジェクト情報が存在しないと404", async () => {
      await createProject();
      const session = await createSession();
      const res = await testClient(app).index.$get(
        {},
        {
          headers: {
            cookie: `${SESSION_COOKIE}=${session.id}`,
          },
        },
      );
      expect(res.status).toBe(404);
    });

    it("プロジェクト情報が存在すると200", async () => {
      await createProject();
      await usecase.saveProjectInfo(projectInfo);
      const session = await createSession();
      const res = await testClient(app).index.$get(
        {},
        {
          headers: {
            cookie: `${SESSION_COOKIE}=${session.id}`,
          },
        },
      );
      expect(res.status).toBe(200);
      expect(await res.json()).toMatchObject(projectInfo);
    });
  });

  describe("[PUT] /", () => {
    it("ログインしていないとアクセスできない", async () => {
      const res = await testClient(app).index.$put({ json: projectInfo });
      expect(res.status).toBe(401);
    });

    it("プロジェクト情報が保存できる", async () => {
      await createProject();
      const session = await createSession();
      const res = await testClient(app).index.$put(
        { json: projectInfo },
        {
          headers: {
            cookie: `${SESSION_COOKIE}=${session.id}`,
          },
        },
      );
      expect(res.status).toBe(200);
      expect(await res.json()).toMatchObject(projectInfo);
    });

    it("プロジェクト情報が更新できる", async () => {
      await createProject();
      await usecase.saveProjectInfo(projectInfo);
      const updatedProjectInfo = {
        ...projectInfo,
        businessType: "updated",
      };
      const session = await createSession();
      const res = await testClient(app).index.$put(
        { json: updatedProjectInfo },
        {
          headers: {
            cookie: `${SESSION_COOKIE}=${session.id}`,
          },
        },
      );
      expect(res.status).toBe(200);
      expect(await res.json()).toMatchObject(updatedProjectInfo);
    });
  });
});
