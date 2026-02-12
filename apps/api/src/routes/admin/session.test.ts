import { adminSessions } from "@repo/db/schema";
import { eq } from "drizzle-orm";
import { createFactory } from "hono/factory";
import { testClient } from "hono/testing";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createAdminSessionFactory, createInitApp, initDb } from "../../../test/utils";
import { ADMIN_SESSION_COOKIE } from "../../libs/cookie";
import { type Env, initApp } from "./_factory";

describe("session", () => {
  let client: Awaited<ReturnType<typeof initDb>>[0];
  let db: Awaited<ReturnType<typeof initDb>>[1];
  let app: typeof import("./session").route;
  let createAdminSession: ReturnType<typeof createAdminSessionFactory>;

  beforeEach(async () => {
    vi.useFakeTimers();
    [client, db] = await initDb();
    vi.doMock("./_factory", () => ({
      adminGuard: createFactory<Env>({
        initApp(app) {
          createInitApp(db)(app);
          initApp(app);
        },
      }),
    }));
    const { route } = await import("./session");
    app = route;
    createAdminSession = createAdminSessionFactory(db);
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
      const session = await createAdminSession();
      const res = await testClient(app).index.$get(
        {},
        {
          headers: {
            cookie: `${ADMIN_SESSION_COOKIE}=${session.id}`,
          },
        },
      );
      expect(res.status).toBe(200);
    });

    it("セッションが期限切れの場合、アクセスできない", async () => {
      const session = await createAdminSession({ expiresAt: Date.now() - 1000 });
      const res = await testClient(app).index.$get(
        {},
        {
          headers: {
            cookie: `${ADMIN_SESSION_COOKIE}=${session?.id}`,
          },
        },
      );
      expect(res.status).toBe(401);
    });

    it("セッションの期限が延長される", async () => {
      const session = await createAdminSession({ expiresAt: Date.now() + 1500 });
      vi.advanceTimersByTime(1000);
      const res = await testClient(app).index.$get(
        {},
        {
          headers: {
            cookie: `${ADMIN_SESSION_COOKIE}=${session?.id}`,
          },
        },
      );
      expect(res.status).toBe(200);
      const [updated] = await db
        .select()
        .from(adminSessions)
        .where(eq(adminSessions.id, session?.id ?? ""));
      expect(updated?.expiresAt).toBeGreaterThan(session?.expiresAt ?? Number.MAX_SAFE_INTEGER);
    });
  });
});
