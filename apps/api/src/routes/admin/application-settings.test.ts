import { ApplicationSettingUseCase, type SaveApplicationSettingInput } from "@repo/module/service";
import { createFactory } from "hono/factory";
import { testClient } from "hono/testing";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ADMIN_SESSION_COOKIE } from "../../libs/cookie";
import type { Env } from "./_factory";

describe("application-settings", () => {
  let app: typeof import("./application-settings").route;
  let retrieveModel: ReturnType<typeof vi.fn>;
  let usedApiKeys: string[];
  let settingsStore: Map<string, string>;

  beforeEach(async () => {
    retrieveModel = vi.fn();
    usedApiKeys = [];
    settingsStore = new Map();
    const applicationSettingUseCase = Object.assign(
      Object.create(ApplicationSettingUseCase.prototype),
      {
        saveApplicationSetting: vi.fn(async (input: SaveApplicationSettingInput) => {
          for (const setting of input) {
            settingsStore.set(setting.key, setting.value);
          }
          return {
            ok: true,
            val: input.map((setting, index) => ({
              id: index + 1,
              ...setting,
            })),
          };
        }),
        getApplicationSetting: vi.fn(async () => ({
          ok: true,
          val: [...settingsStore].map(([key, value], index) => ({
            id: index + 1,
            key,
            value,
          })),
        })),
      },
    ) as ApplicationSettingUseCase<"d1">;
    vi.doMock("openai", () => ({
      default: class OpenAiMock {
        models = { retrieve: retrieveModel };

        constructor({ apiKey }: { apiKey: string }) {
          usedApiKeys.push(apiKey);
        }
      },
    }));
    vi.doMock("./_factory", () => ({
      adminGuard: createFactory<Env>({
        initApp(app) {
          app.use(async (c, next) => {
            c.set("applicationSettingUseCase", applicationSettingUseCase);
            await next();
          });
        },
      }),
    }));
    const { route } = await import("./application-settings");
    app = route;
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.resetAllMocks();
    vi.resetModules();
  });

  const settings = {
    openAiApiKey: "client-api-key",
    chatGptModel: "gpt-4o-mini" as const,
    metaInsightEnabled: "false" as const,
    metaSocialChatEnabled: "false" as const,
    metaAccountLinkEnabled: "false" as const,
  };
  const headers = { cookie: `${ADMIN_SESSION_COOKIE}=test` };

  describe("PUT /", () => {
    it("アプリケーション設定が保存できる", async () => {
      const res = await testClient(app).index.$put({ json: settings }, { headers });

      expect(res.status).toBe(200);
      expect(await res.json()).toMatchObject({ ...settings, openAiApiKey: "" });
    });

    it("アプリケーション設定が更新できる", async () => {
      await testClient(app).index.$put({ json: settings }, { headers });
      const updated = {
        openAiApiKey: "updated",
        chatGptModel: "gpt-5.6-terra" as const,
        metaInsightEnabled: "true" as const,
        metaSocialChatEnabled: "true" as const,
        metaAccountLinkEnabled: "false" as const,
      };
      const res = await testClient(app).index.$put({ json: updated }, { headers });

      expect(res.status).toBe(200);
      expect(await res.json()).toMatchObject({ ...updated, openAiApiKey: "" });
    });
  });

  describe("GET /", () => {
    it("APIキーを隠してアプリケーション設定が取得できる", async () => {
      await testClient(app).index.$put({ json: settings }, { headers });
      const res = await testClient(app).index.$get({}, { headers });

      expect(res.status).toBe(200);
      expect(await res.json()).toMatchObject({ ...settings, openAiApiKey: "" });
    });
  });

  describe("POST /test-openai", () => {
    it("保存済みAPIキーで選択モデルへの接続を確認できる", async () => {
      await testClient(app).index.$put({ json: settings }, { headers });
      retrieveModel.mockResolvedValue({ id: settings.chatGptModel });

      const res = await testClient(app)["test-openai"].$post(
        {
          json: {
            openAiApiKey: "",
            chatGptModel: settings.chatGptModel,
          },
        },
        { headers },
      );

      expect(res.status).toBe(200);
      expect(await res.json()).toEqual({ ok: true, model: settings.chatGptModel });
      expect(usedApiKeys).toEqual([settings.openAiApiKey]);
      expect(retrieveModel).toHaveBeenCalledWith(settings.chatGptModel);
    });

    it("空欄保存では既存APIキーを上書きしない", async () => {
      await testClient(app).index.$put({ json: settings }, { headers });
      await testClient(app).index.$put(
        {
          json: {
            ...settings,
            openAiApiKey: "",
            chatGptModel: "gpt-5.6-luna",
          },
        },
        { headers },
      );
      retrieveModel.mockResolvedValue({ id: "gpt-5.6-luna" });

      const res = await testClient(app)["test-openai"].$post(
        {
          json: { openAiApiKey: "", chatGptModel: "gpt-5.6-luna" },
        },
        { headers },
      );

      expect(res.status).toBe(200);
      expect(usedApiKeys).toEqual([settings.openAiApiKey]);
    });

    it("認証失敗時にOpenAIのエラー詳細を返さない", async () => {
      await testClient(app).index.$put({ json: settings }, { headers });
      retrieveModel.mockRejectedValue({
        status: 401,
        code: "invalid_api_key",
        message: "client-api-key must not be returned",
      });

      const res = await testClient(app)["test-openai"].$post(
        {
          json: { openAiApiKey: "", chatGptModel: settings.chatGptModel },
        },
        { headers },
      );
      const body = await res.json();

      expect(res.status).toBe(422);
      expect(body).toEqual({
        ok: false,
        error: "OpenAI APIキーを認証できませんでした。キーを確認してください。",
      });
      expect(JSON.stringify(body)).not.toContain(settings.openAiApiKey);
    });
  });
});
