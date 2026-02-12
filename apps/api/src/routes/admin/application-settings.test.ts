import { createFactory } from "hono/factory";
import { testClient } from "hono/testing";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createAdminSessionFactory, createInitApp, initDb } from "../../../test/utils";
import { ADMIN_SESSION_COOKIE } from "../../libs/cookie";
import { type Env, initApp } from "./_factory";

describe("helps", () => {
  let client: Awaited<ReturnType<typeof initDb>>[0];
  let db: Awaited<ReturnType<typeof initDb>>[1];
  let app: typeof import("./application-settings").route;
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
    const { route } = await import("./application-settings");
    app = route;
    createAdminSession = createAdminSessionFactory(db);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.resetAllMocks();
    vi.resetModules();
    client.close();
  });

  const settings = {
    openAiApiKey: "test",
    chatGptModel: "test",
  };

  describe("PUT /", () => {
    it("アプリケーション設定が保存できる", async () => {
      const session = await createAdminSession();
      const res = await testClient(app).index.$put(
        {
          json: settings,
        },
        {
          headers: {
            cookie: `${ADMIN_SESSION_COOKIE}=${session.id}`,
          },
        },
      );
      expect(res.status).toBe(200);
      expect(await res.json()).toMatchObject(settings);
    });

    it("アプリケーション設定が更新できる", async () => {
      const session = await createAdminSession();
      await testClient(app).index.$put(
        {
          json: settings,
        },
        {
          headers: {
            cookie: `${ADMIN_SESSION_COOKIE}=${session.id}`,
          },
        },
      );
      const updated = {
        openAiApiKey: "updated",
        chatGptModel: "updated",
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

    describe("GET /", () => {
      it("アプリケーション設定が取得できる", async () => {
        await createAdminSession();
        await testClient(app).index.$put(
          {
            json: settings,
          },
          {
            headers: {
              cookie: `${ADMIN_SESSION_COOKIE}=test`,
            },
          },
        );
        const res = await testClient(app).index.$get(
          {},
          {
            headers: {
              cookie: `${ADMIN_SESSION_COOKIE}=test`,
            },
          },
        );
        expect(res.status).toBe(200);
        expect(await res.json()).toMatchObject(settings);
      });
    });
  });
});
