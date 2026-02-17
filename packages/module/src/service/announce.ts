import * as schemas from "@repo/db/schema";
import { eq } from "drizzle-orm";
import { Err, Ok, type Result } from "ts-results";
import { z } from "zod";
import { UseCase } from "../core/usecase";
import { CommonUseCaseError, AnnounceUseCaseError } from "../error";
import { AnnounceSelect, announceInsertSchema, announceSelectSchema } from "../schema";

export const createAnnounceSchema = announceInsertSchema.omit({ id: true, createdAt: true, updatedAt: true });
export type CreateAnnounceInput = z.infer<typeof createAnnounceSchema>;

export const updateAnnounceSchema = announceInsertSchema.omit({ createdAt: true, updatedAt: true }).required({ id: true });
export type UpdateAnnounceInput = z.infer<typeof updateAnnounceSchema>;

export class AnnounceUseCase<T extends "d1" | "libsql"> extends UseCase<T> {
  async getAll(): Promise<Result<AnnounceSelect[], string>> {
    try {
      const result = await this.db.query.announces.findMany({
        orderBy: (announces, { desc }) => [desc(announces.createdAt)],
      });
      return Ok(result);
    } catch {
      return Err(CommonUseCaseError.UnknownError);
    }
  }

  async create(input: CreateAnnounceInput): Promise<Result<AnnounceSelect, string>> {
    const parseResult = createAnnounceSchema.safeParse(input);
    if (!parseResult.success) {
      return Err(CommonUseCaseError.InvalidInput);
    }
    const now = Date.now();
    try {
      const result = await this.db
        .insert(schemas.announces)
        .values({
          ...parseResult.data,
          createdAt: now,
          updatedAt: now,
        })
        .returning();
      if (!result[0]) {
        return Err(CommonUseCaseError.UnknownError);
      }
      return Ok(result[0]);
    } catch {
      return Err(CommonUseCaseError.UnknownError);
    }
  }

  async update(id: number, input: UpdateAnnounceInput): Promise<Result<AnnounceSelect, string>> {
    const parseResult = updateAnnounceSchema.safeParse({ ...input, id });
    if (!parseResult.success) {
      return Err(CommonUseCaseError.InvalidInput);
    }
    const now = Date.now();
    try {
      const result = await this.db
        .update(schemas.announces)
        .set({
          title: parseResult.data.title,
          content: parseResult.data.content,
          updatedAt: now,
        })
        .where(eq(schemas.announces.id, id))
        .returning();
      if (!result[0]) {
        return Err(AnnounceUseCaseError.AnnounceNotFound);
      }
      return Ok(result[0]);
    } catch {
      return Err(CommonUseCaseError.UnknownError);
    }
  }

  async delete(id: number): Promise<Result<boolean, string>> {
    try {
      await this.db.delete(schemas.announces).where(eq(schemas.announces.id, id));
      return Ok(true);
    } catch {
      return Err(CommonUseCaseError.UnknownError);
    }
  }
}
