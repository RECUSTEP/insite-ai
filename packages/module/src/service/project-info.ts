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
      const exists = await this.db.query.projects.findFirst({
        where: eq(schemas.projects.projectId, projectInfo.projectId),
      });
      if (!exists) {
        return Err(ProjectInfoUseCaseError.ProjectNotFound);
      }
      const [result] = await this.db
        .insert(schemas.projectInfo)
        .values(projectInfo)
        .onConflictDoUpdate({ target: schemas.projectInfo.projectId, set: projectInfo })
        .returning();
      if (!result) {
        return Err(CommonUseCaseError.UnknownError);
      }
      return Ok(result);
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
      const result = await this.db.query.projectInfo.findFirst({
        where: eq(schemas.projectInfo.projectId, projectInfo.projectId),
      });
      if (!result) {
        return Err(ProjectInfoUseCaseError.ProjectInfoNotFound);
      }
      return Ok(result);
    } catch {
      return Err(CommonUseCaseError.UnknownError);
    }
  }
}
