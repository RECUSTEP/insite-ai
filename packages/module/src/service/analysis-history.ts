import * as schemas from "@repo/db/schema";
import { count, desc, eq } from "drizzle-orm";
import { Err, Ok, type Result } from "ts-results";
import { z } from "zod";
import type { Database } from "../core/db";
import { UseCase } from "../core/usecase";
import { AnalysisHistoryUseCaseError, CommonUseCaseError } from "../error";
import {
  type AnalysisHistorySelect,
  analysisHistoryInsertSchema,
  analysisHistorySelectSchema,
} from "../schema";

export const createAnalysisHistorySchema = analysisHistoryInsertSchema.omit({ id: true }).partial({
  createdAt: true,
});
export type CreateAnalysisHistoryInput = z.infer<typeof createAnalysisHistorySchema>;

export const getAnalysisHistorySchema = analysisHistorySelectSchema.pick({ id: true });
type GetAnalysisHistoryInput = z.infer<typeof getAnalysisHistorySchema>;

export const getAnalysisHistoriesSchema = analysisHistorySelectSchema.pick({ projectId: true });
export type GetAnalysisHistoriesInput = z.infer<typeof getAnalysisHistoriesSchema>;

export const countAnalysisHistoriesSchema = analysisHistorySelectSchema.pick({ projectId: true });
export type CountAnalysisHistoriesInput = z.infer<typeof countAnalysisHistoriesSchema>;

export const analysisHistoryInputSchema = z.object({
  image: z.string().optional(),
  instruction: z.string().optional(),
});

export const analysisHistoryOutputSchema = z.object({
  output: z.string(),
});

export class AnalysisHistoryUseCase<T extends "d1" | "libsql"> extends UseCase<T> {
  async createAnalysisHistory(
    input: CreateAnalysisHistoryInput,
  ): Promise<Result<AnalysisHistorySelect, string>> {
    const parseResult = await createAnalysisHistorySchema.safeParseAsync(input);
    if (!parseResult.success) {
      return Err(CommonUseCaseError.InvalidInput);
    }
    const analysisHistory = parseResult.data;
    const [inputParseResult, outputParseResult] = await Promise.all([
      analysisHistoryInputSchema.safeParseAsync(analysisHistory.input),
      analysisHistoryOutputSchema.safeParseAsync(analysisHistory.output),
    ]);
    if (!inputParseResult.success || !outputParseResult.success) {
      return Err(CommonUseCaseError.InvalidInput);
    }
    try {
      const project = await this.db.query.projects.findFirst({
        where: eq(schemas.projects.projectId, analysisHistory.projectId),
      });
      if (!project) {
        return Err(AnalysisHistoryUseCaseError.ProjectNotFound);
      }
      const [result] = await this.db
        .insert(schemas.analysisHistory)
        .values({
          projectId: analysisHistory.projectId,
          aiType: analysisHistory.aiType,
          revisionParentId: analysisHistory.revisionParentId ?? null,
          version: analysisHistory.version ?? 1,
          input: inputParseResult.data,
          output: outputParseResult.data,
          createdAt: analysisHistory.createdAt ?? Date.now(),
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

  async getAnalysisHistory(
    input: GetAnalysisHistoryInput,
  ): Promise<Result<AnalysisHistorySelect, string>> {
    const parseResult = await getAnalysisHistorySchema.safeParseAsync(input);
    if (!parseResult.success) {
      return Err(CommonUseCaseError.InvalidInput);
    }
    const { id } = parseResult.data;
    try {
      const result = await this.db.query.analysisHistory.findFirst({
        where: eq(schemas.analysisHistory.id, id),
      });
      if (!result) {
        return Err(AnalysisHistoryUseCaseError.AnalysisHistoryNotFound);
      }
      return Ok(result);
    } catch {
      return Err(CommonUseCaseError.UnknownError);
    }
  }

  async getAnalysisHistories(
    input: GetAnalysisHistoriesInput,
  ): Promise<Result<AnalysisHistorySelect[], string>> {
    const parseResult = await getAnalysisHistoriesSchema.safeParseAsync(input);
    if (!parseResult.success) {
      return Err(CommonUseCaseError.InvalidInput);
    }
    const { projectId } = parseResult.data;
    try {
      const result = await this.db.query.analysisHistory.findMany({
        where: eq(schemas.analysisHistory.projectId, projectId),
        orderBy: [desc(schemas.analysisHistory.createdAt)],
      });
      return Ok(result);
    } catch {
      return Err(CommonUseCaseError.UnknownError);
    }
  }

  async countAnalysisHistories(
    input: CountAnalysisHistoriesInput,
  ): Promise<Result<number, string>> {
    try {
      const db = this.db as Database<"d1">;
      const [result] = await db
        .select({ count: count(schemas.analysisHistory.id) })
        .from(schemas.analysisHistory)
        .where(eq(schemas.analysisHistory.projectId, input.projectId));
      if (!result) {
        return Err(CommonUseCaseError.UnknownError);
      }
      return Ok(result.count);
    } catch {
      return Err(CommonUseCaseError.UnknownError);
    }
  }
}
