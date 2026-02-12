import { SessionUseCase } from "@repo/module/service";
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

describe("logout", () => {
  let client: Awaited<ReturnType<typeof initDb>>[0];
  let db: Awaited<ReturnType<typeof initDb>>[1];
  let app: typeof import("./logout").route;
  let sessionUseCase: SessionUseCase<"libsql">;
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
    const { route } = await import("./logout");
    sessionUseCase = new SessionUseCase(db, { sessionDuration: 1000 * 60 * 60 });
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

  describe("[POST] /", () => {
    it("ログインしていないとアクセスできない", async () => {
      const res = await testClient(app).index.$post();
      expect(res.status).toBe(401);
    });
  });

  describe("[POST] /", () => {
    it("ログアウトできる", async () => {
      await createProject();
      const session = await createSession();
      const res = await testClient(app).index.$post(
        {},
        {
          headers: {
            cookie: `${SESSION_COOKIE}=${session.id}`,
          },
        },
      );
      expect(res.status).toBe(200);
      const sessionCookie = res.headers.get("set-cookie");
      const regex = `${SESSION_COOKIE}=(.*);.+; Max-Age=0;.+`;
      expect(sessionCookie).toMatch(new RegExp(regex));
      const validatedSession = await sessionUseCase.validateSession({ id: session.id });
      expect(validatedSession.ok).toBe(true);
      expect(validatedSession.val).toBeNull();
    });
  });
});
