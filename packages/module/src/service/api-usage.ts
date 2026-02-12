import * as schemas from "@repo/db/schema";
import { and, between, count, eq } from "drizzle-orm";
import { Err, Ok, type Result } from "ts-results";
import type { z } from "zod";
import type { Database } from "../core/db";
import { UseCase } from "../core/usecase";
import { ApiUsageUseCaseError, CommonUseCaseError } from "../error";
import { type ApiUsageSelect, apiUsageInsertSchema, apiUsageSelectSchema } from "../schema";

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
}
