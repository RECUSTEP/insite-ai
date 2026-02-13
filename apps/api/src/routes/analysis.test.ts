import { AnalysisHistoryUseCase, ApiUsageUseCase } from "@repo/module/service";
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

function splitPromise(): [Promise<void>, () => void, () => void] {
  let resolve: () => void;
  let reject: () => void;
  const promise = new Promise<void>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  // @ts-ignore
  return [promise, resolve, reject];
}

async function waitReadableStream(stream: ReadableStream): Promise<void> {
  const reader = stream.getReader();
  while (true) {
    const { done } = await reader.read();
    if (done) {
      break;
    }
  }
}

describe("analysis", () => {
  let client: Awaited<ReturnType<typeof initDb>>[0];
  let db: Awaited<ReturnType<typeof initDb>>[1];
  let app: typeof import("./analysis").route;
  let apiUsageUseCase: ApiUsageUseCase<"libsql">;
  let analysisHistoryUseCase: AnalysisHistoryUseCase<"libsql">;
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
    vi.doMock("../libs/chatgpt", () => ({
      getPrompt: () => async () => ({ system: "test", user: "test" }),
      chatgpt: async () =>
        function* () {
          yield "test";
        },
    }));
    const { route } = await import("./analysis");
    app = route;
    apiUsageUseCase = new ApiUsageUseCase(db);
    analysisHistoryUseCase = new AnalysisHistoryUseCase(db);
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
      const res = await testClient(app).index.$post({
        query: { type: "market" },
        form: { instruction: "", images: [] },
      });
      expect(res.status).toBe(401);
    });
  });

  it("ログインしているとアクセスできる", async () => {
    await createProject();
    const session = await createSession();
    const res = await testClient(
      app,
      {
        BUCKET: {
          put: async () => undefined,
        },
      },
      {
        waitUntil: () => undefined,
        passThroughOnException: () => undefined,
      },
    ).index.$post(
      {
        query: { type: "market" },
        form: {
          instruction: "",
          images: [new File(["test"], "test.png", { type: "image/png" })],
        },
      },
      {
        headers: {
          cookie: `${SESSION_COOKIE}=${session.id}`,
        },
      },
    );
    expect(res.status).toBe(200);
  });

  it("API使用数が増える", async () => {
    await createProject();
    const session = await createSession();
    const [wait, resolve, reject] = splitPromise();
    const res = await testClient(
      app,
      {
        BUCKET: {
          put: async () => undefined,
        },
      },
      {
        waitUntil: (p) => p.then(resolve).catch(reject),
        passThroughOnException: () => undefined,
      },
    ).index.$post(
      {
        query: { type: "market" },
        form: {
          instruction: "",
          images: [new File(["test"], "test.png", { type: "image/png" })],
        },
      },
      {
        headers: {
          cookie: `${SESSION_COOKIE}=${session.id}`,
        },
      },
    );
    expect(res.status).toBe(200);
    await wait;
    const usage = await apiUsageUseCase.getMonthlyApiUsageCount({
      projectId: session.projectId ?? "test",
    });
    expect(usage.val).toBe(1);
  });

  it("API使用数が上限を超えるとエラー", async () => {
    await createProject();
    const session = await createSession();
    await apiUsageUseCase.createApiUsage({ projectId: session.projectId ?? "test" });
    const res = await testClient(
      app,
      {
        BUCKET: {
          put: async () => undefined,
        },
      },
      {
        waitUntil: () => undefined,
        passThroughOnException: () => undefined,
      },
    ).index.$post(
      {
        query: { type: "market" },
        form: {
          instruction: "",
          images: [new File(["test"], "test.png", { type: "image/png" })],
        },
      },
      {
        headers: {
          cookie: `${SESSION_COOKIE}=${session.id}`,
        },
      },
    );
    expect(res.status).toBe(403);
  });

  it("履歴が保存される", async () => {
    await createProject();
    const session = await createSession();
    const [wait, resolve, reject] = splitPromise();
    const res = await testClient(
      app,
      {
        BUCKET: {
          put: async () => undefined,
        },
      },
      {
        waitUntil: (p) => p.then(resolve).catch(reject),
        passThroughOnException: () => undefined,
      },
    ).index.$post(
      {
        query: { type: "market" },
        form: {
          instruction: "",
          images: [new File(["test"], "test.png", { type: "image/png" })],
        },
      },
      {
        headers: {
          cookie: `${SESSION_COOKIE}=${session.id}`,
        },
      },
    );
    expect(res.status).toBe(200);
    await wait;
    await waitReadableStream(res.body as ReadableStream);
    const history = await analysisHistoryUseCase.getAnalysisHistories({
      projectId: session.projectId ?? "test",
    });
    expect(history.ok).toBe(true);
    expect(history.val).toHaveLength(1);
  });
});
