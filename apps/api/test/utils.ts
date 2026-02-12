import { createClient } from "@libsql/client";
import * as schema from "@repo/db/schema";
import type { AdminSessionInsert, ProjectInsert, SessionInsert } from "@repo/module/schema";
import {
  AdminSessionUseCase,
  AnalysisHistoryUseCase,
  ApiUsageUseCase,
  ApplicationSettingUseCase,
  HelpUseCase,
  ProjectInfoUseCase,
  ProjectUseCase,
  PromptUseCase,
  SessionUseCase,
} from "@repo/module/service";
import type { LibSQLDatabase } from "drizzle-orm/libsql";
import { drizzle } from "drizzle-orm/libsql";
import { migrate } from "drizzle-orm/libsql/migrator";
import type { Hono } from "hono";
import { createMiddleware } from "hono/factory";
import type { Env } from "../src/env";

export async function initDb() {
  const client = createClient({
    url: ":memory:",
  });
  const db = drizzle(client, { schema });
  await migrate(db, {
    migrationsFolder: "./migrations",
  });
  return [client, db] as const;
}

export function mockUseCase(db: LibSQLDatabase<typeof schema>) {
  return createMiddleware(async (c, next) => {
    c.set("projectUseCase", new ProjectUseCase(db));
    c.set("apiUsageUseCase", new ApiUsageUseCase(db));
    c.set("analysisHistoryUseCase", new AnalysisHistoryUseCase(db));
    c.set("projectInfoUseCase", new ProjectInfoUseCase(db));
    c.set("adminSessionUseCase", new AdminSessionUseCase(db, { sessionDuration: 1000 * 60 * 60 }));
    c.set("sessionUseCase", new SessionUseCase(db, { sessionDuration: 1000 * 60 * 60 }));
    c.set("helpUseCase", new HelpUseCase(db));
    c.set("promptUseCase", new PromptUseCase(db));
    c.set("applicationSettingUseCase", new ApplicationSettingUseCase(db));
    await next();
  });
}

export function createInitApp(db: LibSQLDatabase<typeof schema>) {
  return <E extends Env>(app: Hono<E>) => {
    app.use(mockUseCase(db));
  };
}

export function createAdminSessionFactory(db: Awaited<ReturnType<typeof initDb>>[1]) {
  return async (value: Partial<AdminSessionInsert> = {}) => {
    const [session] = await db
      .insert(schema.adminSessions)
      .values({
        id: "test",
        expiresAt: Date.now() + 1000,
        ...value,
      })
      .returning();
    if (!session) {
      throw new Error("Failed to create admin session");
    }
    return session;
  };
}

export function createProjectFactory(db: Awaited<ReturnType<typeof initDb>>[1]) {
  return async (value: Partial<ProjectInsert> = {}) => {
    const [project] = await db
      .insert(schema.projects)
      .values({
        name: "test",
        managerName: "test",
        ownerName: "test",
        projectId: "test",
        projectPass: "test",
        apiUsageLimit: 1,
        ...value,
      })
      .returning();
    if (!project) {
      throw new Error("Failed to create project");
    }
    return project;
  };
}

export function createSessionFactory(db: Awaited<ReturnType<typeof initDb>>[1]) {
  return async (value: Partial<SessionInsert> = {}) => {
    const [session] = await db
      .insert(schema.sessions)
      .values({
        id: "test",
        projectId: "test",
        expiresAt: Date.now() + 1000,
        ...value,
      })
      .returning();
    if (!session) {
      throw new Error("Failed to create session");
    }
    return session;
  };
}
