import * as schemas from "@repo/db/schema";
import { eq } from "drizzle-orm";
import { Err, Ok, type Result } from "ts-results";
import type { z } from "zod";
import { UseCase } from "../core/usecase";
import { CommonUseCaseError, ProjectInfoUseCaseError } from "../error";
import {
  type ProjectInfoSelect,
  projectInfoInsertSchema,
  projectInfoSelectSchema,
} from "../schema";

export const saveProjectInfoSchema = projectInfoInsertSchema.omit({ id: true });
export type SaveProjectInfoInput = z.infer<typeof saveProjectInfoSchema>;

export const getProjectInfoSchema = projectInfoSelectSchema.pick({ projectId: true });
export type GetProjectInfoInput = z.infer<typeof getProjectInfoSchema>;

export class ProjectInfoUseCase<T extends "d1" | "libsql"> extends UseCase<T> {
  async saveProjectInfo(input: SaveProjectInfoInput): Promise<Result<ProjectInfoSelect, string>> {
    const parseResult = await saveProjectInfoSchema.safeParseAsync(input);
    if (!parseResult.success) {
      return Err(CommonUseCaseError.InvalidInput);
    }
    const projectInfo = parseResult.data;
    try {
      const [exists] = await this.db
        .select()
        .from(schemas.projects)
        .where(eq(schemas.projects.projectId, projectInfo.projectId))
        .limit(1);
      if (!exists) {
        return Err(ProjectInfoUseCaseError.ProjectNotFound);
      }
      const { projectId, ...updateData } = projectInfo;
      const [existing] = await this.db
        .select()
        .from(schemas.projectInfo)
        .where(eq(schemas.projectInfo.projectId, projectId))
        .limit(1);
      if (existing) {
        await this.db
          .update(schemas.projectInfo)
          .set(updateData)
          .where(eq(schemas.projectInfo.projectId, projectId));
        const [updated] = await this.db
          .select()
          .from(schemas.projectInfo)
          .where(eq(schemas.projectInfo.projectId, projectId))
          .limit(1);
        return Ok(updated ?? { ...existing, ...updateData });
      }
      const [insertResult] = await this.db
        .insert(schemas.projectInfo)
        .values(projectInfo)
        .returning();
      if (!insertResult) {
        return Err(CommonUseCaseError.UnknownError);
      }
      return Ok(insertResult);
    } catch {
      return Err(CommonUseCaseError.UnknownError);
    }
  }

  async getProjectInfo(input: GetProjectInfoInput): Promise<Result<ProjectInfoSelect, string>> {
    const parseResult = await getProjectInfoSchema.safeParseAsync(input);
    if (!parseResult.success) {
      return Err(CommonUseCaseError.InvalidInput);
    }
    const projectInfo = parseResult.data;
    try {
      const [result] = await this.db
        .select()
        .from(schemas.projectInfo)
        .where(eq(schemas.projectInfo.projectId, projectInfo.projectId))
        .limit(1);
      if (!result) {
        return Err(ProjectInfoUseCaseError.ProjectInfoNotFound);
      }
      return Ok(result);
    } catch {
      return Err(CommonUseCaseError.UnknownError);
    }
  }
}
