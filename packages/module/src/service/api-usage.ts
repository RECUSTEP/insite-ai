import * as schemas from "@repo/db/schema";
import { and, between, count, eq, gte, lte, sql } from "drizzle-orm";
import { Err, Ok, type Result } from "ts-results";
import type { z } from "zod";
import type { Database } from "../core/db";
import { UseCase } from "../core/usecase";
import { ApiUsageUseCaseError, CommonUseCaseError } from "../error";
import { type ApiUsageSelect, apiUsageInsertSchema, apiUsageSelectSchema } from "../schema";

export type DailyUsageItem = { date: string; count: number };

export const createApiUsageSchema = apiUsageInsertSchema.omit({ id: true }).partial({
  usedAt: true,
});
export type CreateApiUsageInput = z.infer<typeof createApiUsageSchema>;

export const getApiUsageSchema = apiUsageSelectSchema.pick({ projectId: true });
export type GetApiUsageInput = z.infer<typeof getApiUsageSchema>;

export class ApiUsageUseCase<T extends "d1" | "libsql"> extends UseCase<T> {
  async createApiUsage(input: CreateApiUsageInput): Promise<Result<ApiUsageSelect, string>> {
    const parseResult = await createApiUsageSchema.safeParseAsync(input);
    if (!parseResult.success) {
      return Err(CommonUseCaseError.InvalidInput);
    }
    const apiUsage = parseResult.data;
    try {
      const project = await this.db.query.projects.findFirst({
        where: eq(schemas.projects.projectId, apiUsage.projectId),
      });
      if (!project) {
        return Err(ApiUsageUseCaseError.ProjectNotFound);
      }
      const [result] = await this.db
        .insert(schemas.apiUsage)
        .values({
          projectId: apiUsage.projectId,
          usedAt: apiUsage.usedAt ?? Date.now(),
        })
        .returning();
      if (!result) {
        return Err(CommonUseCaseError.UnknownError);
      }
      return Ok(result);
    } catch {
      return Err(CommonUseCaseError.UnknownError);
    }
  }

  async getMonthlyApiUsageCount(input: GetApiUsageInput): Promise<Result<number, string>> {
    const parseResult = await getApiUsageSchema.safeParseAsync(input);
    if (!parseResult.success) {
      return Err(CommonUseCaseError.InvalidInput);
    }
    const { projectId } = parseResult.data;
    try {
      const tz = 9 * 60 * 60 * 1000;
      const now = new Date(Date.now() + tz);
      const startOfMonth = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0, 0) - tz;
      const endOfMonth =
        Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0, 23, 59, 59, 999) - tz;
      const db = this.db as Database<"d1">;
      const [result] = await db
        .select({ count: count() })
        .from(schemas.apiUsage)
        .where(
          and(
            eq(schemas.apiUsage.projectId, projectId),
            between(schemas.apiUsage.usedAt, startOfMonth, endOfMonth),
          ),
        );
      if (!result) {
        return Err(CommonUseCaseError.UnknownError);
      }
      return Ok(result.count);
    } catch {
      return Err(CommonUseCaseError.UnknownError);
    }
  }

  /** 指定日数分の日別API使用回数を取得（JST）。ダッシュボード用 */
  async getDailyUsageStats(days: number = 30): Promise<Result<DailyUsageItem[], string>> {
    if (days < 1 || days > 365) {
      return Err(CommonUseCaseError.InvalidInput);
    }
    try {
      const tz = 9 * 60 * 60 * 1000;
      const now = new Date(Date.now() + tz);
      const startDate = new Date(now);
      startDate.setUTCDate(startDate.getUTCDate() - days);
      const startOfRange = Date.UTC(
        startDate.getUTCFullYear(),
        startDate.getUTCMonth(),
        startDate.getUTCDate(),
        0,
        0,
        0,
        0,
      ) - tz;
      const endOfRange = Date.now();

      const db = this.db as Database<"d1">;
      const rows = await db
        .select({
          date: sql<string>`date(${schemas.apiUsage.usedAt}/1000, 'unixepoch', '+9 hours')`.as(
            "date",
          ),
          count: count(schemas.apiUsage.id).as("count"),
        })
        .from(schemas.apiUsage)
        .where(and(gte(schemas.apiUsage.usedAt, startOfRange), lte(schemas.apiUsage.usedAt, endOfRange)))
        .groupBy(sql`date(${schemas.apiUsage.usedAt}/1000, 'unixepoch', '+9 hours')`)
        .orderBy(sql`date(${schemas.apiUsage.usedAt}/1000, 'unixepoch', '+9 hours')`);

      const countByDate = new Map<string, number>();
      for (let i = 0; i < days; i++) {
        const d = new Date(now);
        d.setUTCDate(d.getUTCDate() - (days - 1 - i));
        const dateStr = d.toISOString().slice(0, 10);
        countByDate.set(dateStr, 0);
      }
      for (const row of rows) {
        if (row.date) {
          countByDate.set(row.date, Number(row.count) ?? 0);
        }
      }

      const result: DailyUsageItem[] = Array.from(countByDate.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, count]) => ({ date, count }));

      return Ok(result);
    } catch (e) {
      console.error("[ApiUsageUseCase.getDailyUsageStats]", e);
      return Err(CommonUseCaseError.UnknownError);
    }
  }

  /** 全体のAPI使用回数（指定期間） */
  async getTotalUsageCount(startAt: number, endAt: number): Promise<Result<number, string>> {
    try {
      const db = this.db as Database<"d1">;
      const [result] = await db
        .select({ count: count() })
        .from(schemas.apiUsage)
        .where(and(gte(schemas.apiUsage.usedAt, startAt), lte(schemas.apiUsage.usedAt, endAt)));
      return Ok(result?.count ?? 0);
    } catch {
      return Err(CommonUseCaseError.UnknownError);
    }
  }
}
