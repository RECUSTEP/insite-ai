import { createFactory } from "hono/factory";
import { testClient } from "hono/testing";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createAdminSessionFactory, createInitApp, initDb } from "../../../test/utils";
import { ADMIN_SESSION_COOKIE } from "../../libs/cookie";
import { type Env, initApp } from "./_factory";

describe("prompts", () => {
  let client: Awaited<ReturnType<typeof initDb>>[0];
  let db: Awaited<ReturnType<typeof initDb>>[1];
  let app: typeof import("./prompts").route;
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
    const { route } = await import("./prompts");
    app = route;
    createAdminSession = createAdminSessionFactory(db);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.resetAllMocks();
    vi.resetModules();
    client.close();
  });

  const prompts = {
    market: {
      user: "market user prompt",
      system: "market system prompt",
    },
    competitor: {
      user: "competitor user prompt",
      system: "competitor system prompt",
    },
  };

  describe("PUT /", () => {
    it("プロンプトが保存できる", async () => {
      const session = await createAdminSession();
      const res = await testClient(app).index.$put(
        {
          json: prompts,
        },
        {
          headers: {
            cookie: `${ADMIN_SESSION_COOKIE}=${session.id}`,
          },
        },
      );
      expect(res.status).toBe(200);
      expect(await res.json()).toMatchObject(prompts);
    });

    it("プロンプトが更新できる", async () => {
      const session = await createAdminSession();
      await testClient(app).index.$put(
        {
          json: prompts,
        },
        {
          headers: {
            cookie: `${ADMIN_SESSION_COOKIE}=${session.id}`,
          },
        },
      );
      const updated = {
        market: {
          user: "updated market user prompt",
          system: "updated market system prompt",
        },
        competitor: {
          user: "updated competitor user prompt",
          system: "updated competitor system prompt",
        },
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
    it("プロンプトが取得できる", async () => {
      const session = await createAdminSession();
      await testClient(app).index.$put(
        {
          json: prompts,
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
      expect(await res.json()).toMatchObject(prompts);
    });
  });
});
