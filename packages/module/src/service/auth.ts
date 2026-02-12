import * as schemas from "@repo/db/schema";
import type { Database } from "../core/db";
import { UseCase } from "../core/usecase";
import { count, eq } from "drizzle-orm";
import { Err, Ok, Result } from "ts-results";
import { AuthUseCaseError, CommonUseCaseError } from "../error";
import { z } from "zod";
import { AuthSelect, authInsertSchema, authSelectSchema } from "../schema";

export const authSchema = z.object({
  id: z.string().min(1),
  password: z.string().min(1),
});
export type Auth = z.infer<typeof authSchema>;

export const getAuthListSchema = z.object({
  limit: z.number().int().nonnegative(),
  offset: z.number().int().nonnegative(),
});

export type GetAuthListInput = z.infer<typeof getAuthListSchema>;

export const updateAuthSchema = authSchema.partial().required({
  id: true,
});
export type UpdateAuthInput = z.infer<typeof updateAuthSchema>;

export const createAuthSchema = authInsertSchema;
export type CreateAuthInput = z.infer<typeof createAuthSchema>;

export const deleteAuthSchema = authSelectSchema.pick({ id: true });
export type DeleteAuthInput = z.infer<typeof deleteAuthSchema>;

export class AuthUseCase<T extends "d1" | "libsql"> extends UseCase<T> {
  async getAuth(id: ReturnType<typeof schemas.auth.id.getSQLType>): Promise<Result<Auth, string>> {
    try {
      const result = await this.db.query.auth.findFirst({
        where: eq(schemas.auth.id, id),
      });
      if (!result) {
        return Err(AuthUseCaseError.AuthNotFound);
      }
      return Ok(result);
    } catch {
      return Err(CommonUseCaseError.UnknownError);
    }
  }

  async getAuthList(input: GetAuthListInput): Promise<Result<Auth[], string>> {
    const parseResult = getAuthListSchema.safeParse(input);
    if (!parseResult.success) {
      return Err(CommonUseCaseError.InvalidInput);
    }
    const { limit, offset } = parseResult.data;
    try {
      const result = await this.db.query.auth.findMany({
        limit,
        offset,
      });
      return Ok(result);
    } catch {
      return Err(CommonUseCaseError.UnknownError);
    }
  }

  async update(input: UpdateAuthInput): Promise<Result<AuthSelect, string>> {
    const parseResult = updateAuthSchema.safeParse(input);
    if (!parseResult.success) {
      return Err(CommonUseCaseError.InvalidInput);
    }
    const auth = parseResult.data;
    try {
      const [result] = await this.db
        .update(schemas.auth)
        .set(input)
        .where(eq(schemas.auth.id, auth.id))
        .returning();
      if (!result) {
        return Err(AuthUseCaseError.AuthNotFound);
      }
      return Ok(result);
    } catch {
      return Err(CommonUseCaseError.UnknownError);
    }
  }

  async create(input: CreateAuthInput): Promise<Result<AuthSelect, string>> {
    const parseResult = createAuthSchema.safeParse(input);
    if (!parseResult.success) {
      return Err(CommonUseCaseError.InvalidInput);
    }
    const auth = parseResult.data;
    try {
      const exists = await this.getAuth(auth.id);
      if (exists.ok) {
        return Err(AuthUseCaseError.AuthAlreadyExists);
      }
      if (exists.val !== AuthUseCaseError.AuthNotFound) {
        return Err(AuthUseCaseError.AuthCreationFailed);
      }
      const [result] = await this.db.insert(schemas.auth).values(auth).returning();
      if (!result) {
        return Err(AuthUseCaseError.AuthCreationFailed);
      }
      return Ok(result);
    } catch {
      return Err(CommonUseCaseError.UnknownError);
    }
  }

  async count() {
    try {
      const db = this.db as Database<"d1">;
      const [result] = await db.select({ count: count(schemas.auth.id) }).from(schemas.auth);
      if (!result) {
        return Err(AuthUseCaseError.AuthCountFailed);
      }
      return Ok(result.count);
    } catch {
      return Err(CommonUseCaseError.UnknownError);
    }
  }

  async delete(input: DeleteAuthInput) {
    const parseResult = deleteAuthSchema.safeParse(input);
    if (!parseResult.success) {
      return Err(CommonUseCaseError.InvalidInput);
    }
    const { id } = parseResult.data;
    try {
      const [result] = await this.db
        .delete(schemas.auth)
        .where(eq(schemas.auth.id, id))
        .returning();
      if (!result) {
        return Err(AuthUseCaseError.AuthNotFound);
      }
      return Ok(null);
    } catch {
      return Err(CommonUseCaseError.UnknownError);
    }
  }
}
