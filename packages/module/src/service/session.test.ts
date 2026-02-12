import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { initDb } from "../../test/utils";
import { CommonUseCaseError, SessionUseCaseError } from "../error";
import { ProjectUseCase } from "./project";
import { AdminSessionUseCase, SessionUseCase } from "./session";

describe("AdminSessionUseCase", () => {
  let client: Awaited<ReturnType<typeof initDb>>[0];
  let db: Awaited<ReturnType<typeof initDb>>[1];
  let usecase: AdminSessionUseCase<"libsql">;

  beforeEach(async () => {
    vi.useFakeTimers();
    [client, db] = await initDb();
    usecase = new AdminSessionUseCase(db, { sessionDuration: 1000 * 60 * 60 });
  });

  afterEach(() => {
    vi.useRealTimers();
    client.close();
  });

  it("createSessionでセッションが作成できる", async () => {
    const session = await usecase.createSession({});
    expect(session.ok).toBe(true);
    expect(session.unwrap().id).toBeDefined();
    expect(session.unwrap().expiresAt).toBeGreaterThan(Date.now());
  });

  it("validateSessionでセッションが検証できる", async () => {
    const session = await usecase.createSession({});
    const result = await usecase.validateSession({ id: session.unwrap().id });
    expect(result.ok).toBe(true);
    expect(result.val).toMatchObject(session.unwrap());
  });

  it("validateSessionでセッションの期限が延長される", async () => {
    const session = await usecase.createSession({});
    vi.advanceTimersByTime(1000 * 60 * 60);
    const result = await usecase.validateSession({ id: session.unwrap().id });
    expect(result.ok).toBe(true);
    // @ts-ignore
    expect(result.val.expiresAt).toBeGreaterThan(session.unwrap().expiresAt);
  });

  it("validateSessionでセッションが存在しない場合はnull", async () => {
    const result = await usecase.validateSession({ id: "invalid" });
    expect(result.ok).toBe(true);
    expect(result.val).toBeNull();
  });

  it("validateSessionでセッションが期限切れの場合はnull", async () => {
    const session = await usecase.createSession({});
    vi.advanceTimersByTime(1000 * 60 * 60 + 1);
    const result = await usecase.validateSession({ id: session.unwrap().id });
    expect(result.ok).toBe(true);
    expect(result.unwrap()).toBeNull();
    const deleted = await usecase.deleteSession({ id: session.unwrap().id });
    expect(deleted.ok).toBe(false);
    expect(deleted.val).toBe(SessionUseCaseError.SessionDeletionFailed);
  });

  it("deleteSessionでセッションが削除できる", async () => {
    const session = await usecase.createSession({});
    const result = await usecase.deleteSession({ id: session.unwrap().id });
    expect(result.ok).toBe(true);
    const validate = await usecase.validateSession({ id: session.unwrap().id });
    expect(validate.ok).toBe(true);
    expect(validate.val).toBeNull();
  });

  it("deleteSessionで存在しないセッションを削除するとエラー", async () => {
    const result = await usecase.deleteSession({ id: "invalid" });
    expect(result.ok).toBe(false);
    expect(result.val).toBe(SessionUseCaseError.SessionDeletionFailed);
  });
});

describe("SessionUseCase", () => {
  let client: Awaited<ReturnType<typeof initDb>>[0];
  let db: Awaited<ReturnType<typeof initDb>>[1];
  let usecase: SessionUseCase<"libsql">;
  let projectUseCase: ProjectUseCase<"libsql">;

  beforeEach(async () => {
    vi.useFakeTimers();
    [client, db] = await initDb();
    usecase = new SessionUseCase(db, { sessionDuration: 1000 * 60 * 60 });
    projectUseCase = new ProjectUseCase(db);
    await projectUseCase.createProject({
      name: "test",
      managerName: "test",
      ownerName: "test",
      projectId: "test",
      projectPass: "test",
      apiUsageLimit: 100,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    client.close();
  });

  it("createSessionでセッションが作成できる", async () => {
    const session = await usecase.createSession({ projectId: "test" });
    expect(session.ok).toBe(true);
    expect(session.unwrap().id).toBeDefined();
    expect(session.unwrap().expiresAt).toBeGreaterThan(Date.now());
  });

  it("存在しないプロジェクトIDでcreateSessionするとエラー", async () => {
    const session = await usecase.createSession({ projectId: "invalid" });
    expect(session.ok).toBe(false);
    expect(session.val).toBe(CommonUseCaseError.UnknownError);
  });

  it("validateSessionでセッションが検証できる", async () => {
    const session = await usecase.createSession({ projectId: "test" });
    const result = await usecase.validateSession({ id: session.unwrap().id });
    expect(result.ok).toBe(true);
    expect(result.val).toMatchObject(session.unwrap());
  });

  it("validateSessionでセッションの期限が延長される", async () => {
    const session = await usecase.createSession({ projectId: "test" });
    vi.advanceTimersByTime(1000 * 60 * 60);
    const result = await usecase.validateSession({ id: session.unwrap().id });
    expect(result.ok).toBe(true);
    // @ts-ignore
    expect(result.val.expiresAt).toBeGreaterThan(session.unwrap().expiresAt);
  });

  it("validateSessionでセッションが存在しない場合はnull", async () => {
    const result = await usecase.validateSession({ id: "invalid" });
    expect(result.ok).toBe(true);
    expect(result.val).toBeNull();
  });

  it("validateSessionでセッションが期限切れの場合はnull", async () => {
    const session = await usecase.createSession({ projectId: "test" });
    vi.advanceTimersByTime(1000 * 60 * 60 + 1);
    const result = await usecase.validateSession({ id: session.unwrap().id });
    expect(result.ok).toBe(true);
    expect(result.unwrap()).toBeNull();
    const deleted = await usecase.deleteSession({ id: session.unwrap().id });
    expect(deleted.ok).toBe(false);
    expect(deleted.val).toBe(SessionUseCaseError.SessionDeletionFailed);
  });

  it("セッション中にプロジェクトを削除するとセッションが削除される", async () => {
    const session = await usecase.createSession({ projectId: "test" });
    await projectUseCase.deleteProject({ projectId: "test" });
    const result = await usecase.validateSession({ id: session.unwrap().id });
    expect(result.ok).toBe(true);
    expect(result.unwrap()).toBeNull();
  });

  it("deleteSessionでセッションが削除できる", async () => {
    const session = await usecase.createSession({ projectId: "test" });
    const result = await usecase.deleteSession({ id: session.unwrap().id });
    expect(result.ok).toBe(true);
    const validate = await usecase.validateSession({ id: session.unwrap().id });
    expect(validate.ok).toBe(true);
    expect(validate.val).toBeNull();
  });

  it("deleteSessionで存在しないセッションを削除するとエラー", async () => {
    const result = await usecase.deleteSession({ id: "invalid" });
    expect(result.ok).toBe(false);
    expect(result.val).toBe(SessionUseCaseError.SessionDeletionFailed);
  });
});
