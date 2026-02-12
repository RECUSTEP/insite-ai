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

describe("session", () => {
  let client: Awaited<ReturnType<typeof initDb>>[0];
  let db: Awaited<ReturnType<typeof initDb>>[1];
  let app: typeof import("./session").route;
  let createProject: ReturnType<typeof createProjectFactory>;
  let createSession: ReturnType<typeof createSessionFactory>;

  beforeEach(async () => {
    vi.useFakeTimers();
    [client, db] = await initDb();
    vi.doMock("./_factory", () => ({
      projectGuard: createFactory<Env>({
        initApp(app) {
          createInitApp(db)(app);
          initApp(app);
        },
      }),
    }));
    const { route } = await import("./session");
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
      expect(res.status).toBe(200);
    });

    it("セッションが期限切れの場合、アクセスできない", async () => {
      await createProject();
      const session = await createSession({ expiresAt: Date.now() - 1000 });
      const res = await testClient(app).index.$get(
        {},
        {
          headers: {
            cookie: `${SESSION_COOKIE}=${session.id}`,
          },
        },
      );
      expect(res.status).toBe(401);
    });

    it("セッションの期限が延長される", async () => {
      await createProject();
      const session = await createSession({ expiresAt: Date.now() + 1500 });
      vi.advanceTimersByTime(1000);
      const res = await testClient(app).index.$get(
        {},
        {
          headers: {
            cookie: `${SESSION_COOKIE}=${session.id}`,
          },
        },
      );
      expect(res.status).toBe(200);
      const newSession = await db.query.sessions.findFirst({
        where: (tb, { eq }) => eq(tb.id, session.id),
      });
      expect(newSession?.expiresAt).toBeGreaterThan(session.expiresAt);
    });
  });
});
