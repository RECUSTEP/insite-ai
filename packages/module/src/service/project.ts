import * as schemas from "@repo/db/schema";
import { count, eq, like } from "drizzle-orm";
import { Err, Ok, type Result } from "ts-results";
import { z } from "zod";
import type { Database } from "../core/db";
import { UseCase } from "../core/usecase";
import { CommonUseCaseError, ProjectUseCaseError } from "../error";
import { type ProjectSelect, projectInsertSchema, projectSelectSchema } from "../schema";

const DUMMY_PASSWORD = "DUMMY_PASSWORD";

export const createProjectSchema = projectInsertSchema.omit({ projectPass: true });
export type CreateProjectInput = z.infer<typeof createProjectSchema>;

export const updateProjectSchema = projectInsertSchema
  .omit({ id: true, projectPass: true, authId: true })
  .partial()
  .required({
    projectId: true,
  });
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;

export const getProjectSchema = projectSelectSchema.pick({ projectId: true });
export type GetProjectInput = z.infer<typeof getProjectSchema>;

export const getProjectsSchema = z.object({
  limit: z.number().int().nonnegative(),
  offset: z.number().int().nonnegative(),
  searchText: z.string().optional(),
  searchColumnName: z.union([z.literal("projectName"), z.literal("ownerName")]).optional(),
});
export type GetProjectsInput = z.infer<typeof getProjectsSchema>;

export const countSchema = z.object({
  searchText: z.string().optional(),
  searchColumnName: z.union([z.literal("projectName"), z.literal("ownerName")]).optional(),
});
export type CountInput = z.infer<typeof countSchema>;

export const deleteProjectSchema = projectSelectSchema.pick({ projectId: true });
export type DeleteProjectInput = z.infer<typeof deleteProjectSchema>;

export class ProjectUseCase<T extends "d1" | "libsql"> extends UseCase<T> {
  async createProject(input: CreateProjectInput): Promise<Result<ProjectSelect, string>> {
    const parseResult = await createProjectSchema.safeParseAsync(input);
    if (!parseResult.success) {
      return Err(CommonUseCaseError.InvalidInput);
    }
    const project = parseResult.data;
    try {
      const exists = await this.getProject({ projectId: project.projectId });
      if (exists.ok) {
        return Err(ProjectUseCaseError.ProjectAlreadyExists);
      }
      if (exists.val !== ProjectUseCaseError.ProjectNotFound) {
        return Err(ProjectUseCaseError.ProjectCreationFailed);
      }

      const authExists = await this.db.query.auth.findFirst({
        where: eq(schemas.auth.id, project.authId),
      });
      if (!authExists) {
        return Err(ProjectUseCaseError.AuthNotFound);
      }

      const [result] = await this.db
        .insert(schemas.projects)
        .values({ ...project, projectPass: DUMMY_PASSWORD })
        .returning();
      if (!result) {
        return Err(ProjectUseCaseError.ProjectCreationFailed);
      }
      return Ok(result);
    } catch {
      return Err(CommonUseCaseError.UnknownError);
    }
  }

  async updateProject(input: UpdateProjectInput): Promise<Result<ProjectSelect, string>> {
    const parseResult = await updateProjectSchema.safeParseAsync(input);
    if (!parseResult.success) {
      return Err(CommonUseCaseError.InvalidInput);
    }
    const project = parseResult.data;
    try {
      const [result] = await this.db
        .update(schemas.projects)
        .set(input)
        .where(eq(schemas.projects.projectId, project.projectId))
        .returning();
      if (!result) {
        return Err(ProjectUseCaseError.ProjectNotFound);
      }
      return Ok(result);
    } catch {
      return Err(CommonUseCaseError.UnknownError);
    }
  }

  async getProject(input: GetProjectInput): Promise<Result<ProjectSelect, string>> {
    const parseResult = await getProjectSchema.safeParseAsync(input);
    if (!parseResult.success) {
      return Err(CommonUseCaseError.InvalidInput);
    }
    const project = parseResult.data;
    try {
      const result = await this.db.query.projects.findFirst({
        where: (projects, { eq }) => eq(projects.projectId, project.projectId),
      });
      if (!result) {
        return Err(ProjectUseCaseError.ProjectNotFound);
      }
      return Ok(result);
    } catch {
      return Err(CommonUseCaseError.UnknownError);
    }
  }

  async getProjects(input: GetProjectsInput): Promise<Result<ProjectSelect[], string>> {
    const parseResult = await getProjectsSchema.safeParseAsync(input);
    if (!parseResult.success) {
      return Err(CommonUseCaseError.InvalidInput);
    }
    const { limit, offset, searchColumnName, searchText } = parseResult.data;

    const searchColumn =
      searchColumnName === "ownerName"
        ? schemas.projects.ownerName
        : searchColumnName === "projectName"
          ? schemas.projects.name
          : null;

    try {
      const result = await this.db.query.projects.findMany({
        limit,
        offset,
        where:
          searchColumn != null && searchText != null && searchText.length !== 0
            ? like(searchColumn, `%${searchText}%`)
            : undefined,
      });
      return Ok(result);
    } catch {
      return Err(CommonUseCaseError.UnknownError);
    }
  }

  async getByAuthId(
    authId: ReturnType<typeof schemas.projects.authId.getSQLType>,
  ): Promise<Result<ProjectSelect[], string>> {
    try {
      const result = await this.db.query.projects.findMany({
        where: eq(schemas.projects.authId, authId),
      });
      return Ok(result);
    } catch {
      return Err(CommonUseCaseError.UnknownError);
    }
  }

  async deleteProject(input: DeleteProjectInput): Promise<Result<null, string>> {
    const parseResult = await deleteProjectSchema.safeParseAsync(input);
    if (!parseResult.success) {
      return Err(CommonUseCaseError.InvalidInput);
    }
    const project = parseResult.data;
    try {
      const [result] = await this.db
        .delete(schemas.projects)
        .where(eq(schemas.projects.projectId, project.projectId))
        .returning();
      if (!result) {
        return Err(ProjectUseCaseError.ProjectNotFound);
      }
      return Ok(null);
    } catch {
      return Err(CommonUseCaseError.UnknownError);
    }
  }

  async countProjects(input: CountInput): Promise<Result<number, string>> {
    try {
      const parseResult = await countSchema.safeParseAsync(input);
      if (!parseResult.success) {
        return Err(CommonUseCaseError.InvalidInput);
      }
      const { searchColumnName, searchText } = parseResult.data;
      const searchColumn =
        searchColumnName === "ownerName"
          ? schemas.projects.ownerName
          : searchColumnName === "projectName"
            ? schemas.projects.name
            : null;

      const db = this.db as Database<"d1">;

      const [result] =
        searchColumn != null && searchText != null && searchText.length !== 0
          ? await db
              .select({ count: count(schemas.projects.id) })
              .from(schemas.projects)
              .where(like(searchColumn, `%${searchText}%`))
          : await db.select({ count: count(schemas.projects.id) }).from(schemas.projects);

      if (!result) {
        return Err(ProjectUseCaseError.ProjectCountFailed);
      }
      return Ok(result.count);
    } catch {
      return Err(CommonUseCaseError.UnknownError);
    }
  }
}
