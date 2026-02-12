import { ProjectUseCaseError } from "@repo/module/error";
import { createFactory } from "hono/factory";
import { testClient } from "hono/testing";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createAdminSessionFactory, createInitApp, initDb } from "../../../test/utils";
import { ADMIN_SESSION_COOKIE } from "../../libs/cookie";
import { type Env, initApp } from "./_factory";

describe("projects", () => {
  let client: Awaited<ReturnType<typeof initDb>>[0];
  let db: Awaited<ReturnType<typeof initDb>>[1];
  let app: typeof import("./projects").route;
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
    const { route } = await import("./projects");
    app = route;
    createAdminSession = createAdminSessionFactory(db);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.resetAllMocks();
    vi.resetModules();
    client.close();
  });

  const defaultProject = {
    name: "test",
    managerName: "test",
    ownerName: "test",
    projectId: "test",
    apiUsageLimit: 100,
    authId: "test",
  } as const;

  describe("[POST] /", () => {
    it("プロジェクトを作成できる", async () => {
      const session = await createAdminSession();
      const res = await testClient(app).index.$post(
        {
          json: defaultProject,
        },
        {
          headers: {
            cookie: `${ADMIN_SESSION_COOKIE}=${session.id}`,
          },
        },
      );
      expect(res.status).toBe(200);
      expect(await res.json()).toMatchObject(defaultProject);
    });

    it("ログインしていないとアクセスできない", async () => {
      const res = await testClient(app).index.$post({
        json: defaultProject,
      });
      expect(res.status).toBe(401);
    });

    it("不正な値でプロジェクトを作成するとエラー", async () => {
      const session = await createAdminSession();
      const res = await testClient(app).index.$post(
        {
          json: {
            ...defaultProject,
            name: "",
          },
        },
        {
          headers: {
            cookie: `${ADMIN_SESSION_COOKIE}=${session.id}`,
          },
        },
      );
      expect(res.status).toBe(400);
    });

    it("重複したプロジェクトIDでプロジェクトを作成するとエラー", async () => {
      const session = await createAdminSession();
      await testClient(app).index.$post(
        {
          json: defaultProject,
        },
        {
          headers: {
            cookie: `${ADMIN_SESSION_COOKIE}=${session.id}`,
          },
        },
      );
      const res = await testClient(app).index.$post(
        {
          json: defaultProject,
        },
        {
          headers: {
            cookie: `${ADMIN_SESSION_COOKIE}=${session.id}`,
          },
        },
      );
      expect(res.status).toBe(400);
      expect(await res.json()).toMatchObject({
        error: ProjectUseCaseError.ProjectAlreadyExists,
      });
    });
  });

  describe("[PATCH] /", () => {
    it("プロジェクトを更新できる", async () => {
      const session = await createAdminSession();
      await testClient(app).index.$post(
        {
          json: defaultProject,
        },
        {
          headers: {
            cookie: `${ADMIN_SESSION_COOKIE}=${session.id}`,
          },
        },
      );
      const res = await testClient(app)[":projectId"].$patch(
        {
          param: {
            projectId: defaultProject.projectId,
          },
          json: {
            ...defaultProject,
            name: "updated",
          },
        },
        {
          headers: {
            cookie: `${ADMIN_SESSION_COOKIE}=${session.id}`,
          },
        },
      );
      expect(res.status).toBe(200);
      expect(await res.json()).toMatchObject({
        ...defaultProject,
        name: "updated",
      });
    });

    it("一部のプロパティのみ更新できる", async () => {
      const session = await createAdminSession();
      await testClient(app).index.$post(
        {
          json: defaultProject,
        },
        {
          headers: {
            cookie: `${ADMIN_SESSION_COOKIE}=${session.id}`,
          },
        },
      );
      const res = await testClient(app)[":projectId"].$patch(
        {
          param: {
            projectId: defaultProject.projectId,
          },
          json: {
            name: "updated",
          },
        },
        {
          headers: {
            cookie: `${ADMIN_SESSION_COOKIE}=${session.id}`,
          },
        },
      );
      expect(res.status).toBe(200);
      expect(await res.json()).toMatchObject({
        ...defaultProject,
        name: "updated",
      });
    });

    it("ログインしていないとアクセスできない", async () => {
      const res = await testClient(app)[":projectId"].$patch({
        param: {
          projectId: defaultProject.projectId,
        },
        json: defaultProject,
      });
      expect(res.status).toBe(401);
    });

    it("不正な値でプロジェクトを更新するとエラー", async () => {
      const session = await createAdminSession();
      await testClient(app).index.$post(
        {
          json: defaultProject,
        },
        {
          headers: {
            cookie: `${ADMIN_SESSION_COOKIE}=${session.id}`,
          },
        },
      );
      const res = await testClient(app)[":projectId"].$patch(
        {
          param: {
            projectId: defaultProject.projectId,
          },
          json: {
            ...defaultProject,
            name: "",
          },
        },
        {
          headers: {
            cookie: `${ADMIN_SESSION_COOKIE}=${session.id}`,
          },
        },
      );
      expect(res.status).toBe(400);
    });

    it("存在しないプロジェクトIDでプロジェクトを更新するとエラー", async () => {
      const session = await createAdminSession();
      const res = await testClient(app)[":projectId"].$patch(
        {
          param: {
            projectId: defaultProject.projectId,
          },
          json: defaultProject,
        },
        {
          headers: {
            cookie: `${ADMIN_SESSION_COOKIE}=${session.id}`,
          },
        },
      );
      expect(res.status).toBe(400);
      expect(await res.json()).toMatchObject({
        error: ProjectUseCaseError.ProjectNotFound,
      });
    });
  });

  describe("[GET] /:projectId", () => {
    it("プロジェクトを取得できる", async () => {
      const session = await createAdminSession();
      await testClient(app).index.$post(
        {
          json: defaultProject,
        },
        {
          headers: {
            cookie: `${ADMIN_SESSION_COOKIE}=${session.id}`,
          },
        },
      );
      const res = await testClient(app)[":projectId"].$get(
        {
          param: {
            projectId: defaultProject.projectId,
          },
        },
        {
          headers: {
            cookie: `${ADMIN_SESSION_COOKIE}=${session.id}`,
          },
        },
      );
      expect(res.status).toBe(200);
      expect(await res.json()).toMatchObject(defaultProject);
    });

    it("ログインしていないとアクセスできない", async () => {
      const res = await testClient(app)[":projectId"].$get({
        param: {
          projectId: defaultProject.projectId,
        },
      });
      expect(res.status).toBe(401);
    });

    it("存在しないプロジェクトIDでプロジェクトを取得するとエラー", async () => {
      const session = await createAdminSession();
      testClient(app)[":projectId"];
      const res = await testClient(app)[":projectId"].$get(
        {
          param: {
            projectId: defaultProject.projectId,
          },
        },
        {
          headers: {
            cookie: `${ADMIN_SESSION_COOKIE}=${session.id}`,
          },
        },
      );
      expect(res.status).toBe(404);
      expect(await res.json()).toMatchObject({
        error: ProjectUseCaseError.ProjectNotFound,
      });
    });

    it("不正な値でプロジェクトを取得するとエラー", async () => {
      const session = await createAdminSession();
      const res = await testClient(app)[":projectId"].$get(
        {
          param: {
            projectId: "",
          },
        },
        {
          headers: {
            cookie: `${ADMIN_SESSION_COOKIE}=${session.id}`,
          },
        },
      );
      expect(res.status).toBe(400);
    });
  });

  describe("[GET] /", () => {
    it("プロジェクト一覧を取得できる", async () => {
      const session = await createAdminSession();
      await testClient(app).index.$post(
        {
          json: defaultProject,
        },
        {
          headers: {
            cookie: `${ADMIN_SESSION_COOKIE}=${session.id}`,
          },
        },
      );
      const res = await testClient(app).index.$get(
        {
          query: {
            offset: "0",
            limit: "10",
          },
        },
        {
          headers: {
            cookie: `${ADMIN_SESSION_COOKIE}=${session.id}`,
          },
        },
      );
      expect(res.status).toBe(200);
      // @ts-ignore
      const { projects, hasNext } = await res.json();
      expect(projects).toMatchObject([defaultProject]);
      expect(hasNext).toBe(false);
    });

    it("limitで取得件数を制限できる", async () => {
      const session = await createAdminSession();
      const projects = Array.from({ length: 10 }, (_, i) => ({
        ...defaultProject,
        projectId: `test${i}`,
      }));
      for (const project of projects) {
        await testClient(app).index.$post(
          {
            json: project,
          },
          {
            headers: {
              cookie: `${ADMIN_SESSION_COOKIE}=${session.id}`,
            },
          },
        );
      }
      const res = await testClient(app).index.$get(
        {
          query: {
            offset: "0",
            limit: "5",
          },
        },
        {
          headers: {
            cookie: `${ADMIN_SESSION_COOKIE}=${session.id}`,
          },
        },
      );
      expect(res.status).toBe(200);
      // @ts-ignore
      const { projects: resProjects, hasNext } = await res.json();
      expect(resProjects).toMatchObject(projects.slice(0, 5));
      expect(hasNext).toBe(true);
    });

    it("offsetで取得開始位置を指定できる", async () => {
      const session = await createAdminSession();
      const projects = Array.from({ length: 10 }, (_, i) => ({
        ...defaultProject,
        projectId: `test${i}`,
      }));
      for (const project of projects) {
        await testClient(app).index.$post(
          {
            json: project,
          },
          {
            headers: {
              cookie: `${ADMIN_SESSION_COOKIE}=${session.id}`,
            },
          },
        );
      }
      const res = await testClient(app).index.$get(
        {
          query: {
            offset: "5",
            limit: "10",
          },
        },
        {
          headers: {
            cookie: `${ADMIN_SESSION_COOKIE}=${session.id}`,
          },
        },
      );
      expect(res.status).toBe(200);
      // @ts-ignore
      const { projects: resProjects, hasNext } = await res.json();
      expect(resProjects).toMatchObject(projects.slice(5, 10));
      expect(hasNext).toBe(false);
    });

    it("ログインしていないとアクセスできない", async () => {
      const res = await testClient(app).index.$get({
        query: {
          offset: "0",
          limit: "10",
        },
      });
      expect(res.status).toBe(401);
    });

    it("不正な値でプロジェクト一覧を取得するとエラー", async () => {
      const session = await createAdminSession();
      const res = await testClient(app).index.$get(
        {
          query: {
            offset: "-1",
            limit: "10",
          },
        },
        {
          headers: {
            cookie: `${ADMIN_SESSION_COOKIE}=${session.id}`,
          },
        },
      );
      expect(res.status).toBe(400);
    });
  });

  describe("[DELETE] /", () => {
    it("プロジェクトを削除できる", async () => {
      const session = await createAdminSession();
      await testClient(app).index.$post(
        {
          json: defaultProject,
        },
        {
          headers: {
            cookie: `${ADMIN_SESSION_COOKIE}=${session.id}`,
          },
        },
      );
      const res = await testClient(app)[":projectId"].$delete(
        {
          param: {
            projectId: defaultProject.projectId,
          },
        },
        {
          headers: {
            cookie: `${ADMIN_SESSION_COOKIE}=${session.id}`,
          },
        },
      );
      expect(res.status).toBe(200);
      expect(await res.json()).toBeNull();
    });

    it("ログインしていないとアクセスできない", async () => {
      const res = await testClient(app)[":projectId"].$delete({
        param: {
          projectId: defaultProject.projectId,
        },
      });
      expect(res.status).toBe(401);
    });

    it("存在しないプロジェクトIDでプロジェクトを削除するとエラー", async () => {
      const session = await createAdminSession();
      const res = await testClient(app)[":projectId"].$delete(
        {
          param: {
            projectId: defaultProject.projectId,
          },
        },
        {
          headers: {
            cookie: `${ADMIN_SESSION_COOKIE}=${session.id}`,
          },
        },
      );
      expect(res.status).toBe(400);
      expect(await res.json()).toMatchObject({
        error: ProjectUseCaseError.ProjectNotFound,
      });
    });
  });
});
