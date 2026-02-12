import { createFactory } from "hono/factory";
import { testClient } from "hono/testing";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createInitApp, createProjectFactory, initDb } from "../../test/utils";
import type { Env } from "../env";
import { SESSION_COOKIE } from "../libs/cookie";

describe("login", () => {
  let client: Awaited<ReturnType<typeof initDb>>[0];
  let db: Awaited<ReturnType<typeof initDb>>[1];
  let app: typeof import("./login").route;
  let createProject: ReturnType<typeof createProjectFactory>;

  beforeEach(async () => {
    [client, db] = await initDb();
    vi.doMock("../libs/hono", () => ({
      factory: createFactory<Env>({
        initApp: createInitApp(db),
      }),
    }));
    const { route } = await import("./login");
    app = route;
    createProject = createProjectFactory(db);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.resetAllMocks();
    vi.resetModules();
    client.close();
  });

  describe("[POST] /", () => {
    it("ログインできる", async () => {
      await createProject();
      const res = await testClient(app).index.$post({
        json: {
          id: "test",
          password: "test",
        },
      });
      expect(res.status).toBe(200);
      const sessionCookie = res.headers.get("set-cookie");
      const regex = `${SESSION_COOKIE}=(.+); Path=\/; Expires=(.+); HttpOnly; Secure; SameSite=Lax`;
      expect(sessionCookie).toMatch(new RegExp(regex));
      // biome-ignore lint:
      const [, sessionId, expiresAt] = sessionCookie?.match(regex)!;
      const session = await db.query.sessions.findFirst({
        where: (tb, { eq }) => eq(tb.id, sessionId ?? ""),
      });
      expect(session).not.toBeNull();
      // biome-ignore lint:
      expect(Math.floor(session?.expiresAt! / 1000) * 1000).toBe(
        new Date(expiresAt ?? 0).getTime(),
      );
    });

    it("ユーザー名が間違っているとログインできない", async () => {
      await createProject();
      const res = await testClient(app).index.$post({
        json: {
          id: "invalid",
          password: "test",
        },
      });
      expect(res.status).toBe(401);
    });

    it("パスワードが間違っているとログインできない", async () => {
      await createProject();
      const res = await testClient(app).index.$post({
        json: {
          id: "test",
          password: "invalid",
        },
      });
      expect(res.status).toBe(401);
    });
  });
});
