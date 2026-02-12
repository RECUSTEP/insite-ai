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

describe("project", () => {
  let client: Awaited<ReturnType<typeof initDb>>[0];
  let db: Awaited<ReturnType<typeof initDb>>[1];
  let app: typeof import("./project").route;
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
    const { route } = await import("./project");
    app = route;
    createProject = createProjectFactory(db);
    createSession = createSessionFactory(db);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.resetAllMocks();
    vi.resetModules();
    client.close();
  });

  describe("[GET] /", () => {
    it("ログインしていないとアクセスできない", async () => {
      const res = await testClient(app).index.$get();
      expect(res.status).toBe(401);
    });

    it("ログインしているとアクセスできる", async () => {
      const project = await createProject();
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
      expect(await res.json()).toMatchObject({
        projectId: project.projectId,
        name: project.name,
        apiUsageLimit: project.apiUsageLimit,
        apiUsageCount: 0,
      });
    });
  });
});
