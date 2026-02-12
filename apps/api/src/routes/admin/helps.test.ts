import { createFactory } from "hono/factory";
import { testClient } from "hono/testing";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createAdminSessionFactory, createInitApp, initDb } from "../../../test/utils";
import { ADMIN_SESSION_COOKIE } from "../../libs/cookie";
import { type Env, initApp } from "./_factory";

describe("helps", () => {
  let client: Awaited<ReturnType<typeof initDb>>[0];
  let db: Awaited<ReturnType<typeof initDb>>[1];
  let app: typeof import("./helps").route;
  let createAdminSession: ReturnType<typeof createAdminSessionFactory>;

  beforeEach(async () => {
    [client, db] = await initDb();
    vi.doMock("./_factory", () => ({
      adminGuard: createFactory<Env>({
        initApp(app) {
          createInitApp(db)(app);
          initApp(app);
        },
      }),
    }));
    const { route } = await import("./helps");
    app = route;
    createAdminSession = createAdminSessionFactory(db);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.resetAllMocks();
    vi.resetModules();
    client.close();
  });

  const helps = {
    market: "market help",
    competitor: "competitor help",
  };

  describe("PUT /", () => {
    it("ヘルプが保存できる", async () => {
      const session = await createAdminSession();
      const res = await testClient(app).index.$put(
        {
          json: helps,
        },
        {
          headers: {
            cookie: `${ADMIN_SESSION_COOKIE}=${session.id}`,
          },
        },
      );
      expect(res.status).toBe(200);
      expect(await res.json()).toMatchObject(helps);
    });

    it("ヘルプが更新できる", async () => {
      const session = await createAdminSession();
      await testClient(app).index.$put(
        {
          json: helps,
        },
        {
          headers: {
            cookie: `${ADMIN_SESSION_COOKIE}=${session.id}`,
          },
        },
      );
      const updated = {
        market: "updated",
        competitor: "updated",
      };
      const res = await testClient(app).index.$put(
        {
          json: updated,
        },
        {
          headers: {
            cookie: `${ADMIN_SESSION_COOKIE}=${session.id}`,
          },
        },
      );
      expect(res.status).toBe(200);
      expect(await res.json()).toMatchObject(updated);
    });
  });

  describe("GET /", () => {
    it("ヘルプが取得できる", async () => {
      const session = await createAdminSession();
      await testClient(app).index.$put(
        {
          json: helps,
        },
        {
          headers: {
            cookie: `${ADMIN_SESSION_COOKIE}=${session.id}`,
          },
        },
      );
      const res = await testClient(app).index.$get(
        {},
        {
          headers: {
            cookie: `${ADMIN_SESSION_COOKIE}=${session.id}`,
          },
        },
      );
      expect(res.status).toBe(200);
      expect(await res.json()).toMatchObject(helps);
    });
  });
});
