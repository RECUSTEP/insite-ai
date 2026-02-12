import * as schemas from "@repo/db/schema";
import { eq, sql } from "drizzle-orm";
import { Err, Ok, type Result } from "ts-results";
import { z } from "zod";
import { UseCase } from "../core/usecase";
import { CommonUseCaseError } from "../error";
import { type PromptSelect, promptInsertSchema } from "../schema";

export const savePromptSchema = z.array(promptInsertSchema.omit({ id: true }));
export type SavePromptInput = z.infer<typeof savePromptSchema>;

export class PromptUseCase<T extends "d1" | "libsql"> extends UseCase<T> {
  async savePrompt(input: SavePromptInput): Promise<Result<PromptSelect[], string>> {
    const parseResult = await savePromptSchema.safeParseAsync(input);
    if (!parseResult.success) {
      return Err(CommonUseCaseError.InvalidInput);
    }
    const prompts = parseResult.data;
    try {
      const result = await this.db
        .insert(schemas.prompts)
        .values(prompts)
        .onConflictDoUpdate({
          target: schemas.prompts.aiType,
          set: {
            system: sql`excluded.system`,
            user: sql`excluded.user`,
          },
        })
        .returning();
      return Ok(result);
    } catch {
      return Err(CommonUseCaseError.UnknownError);
    }
  }

  async getPrompt(): Promise<Result<PromptSelect[], string>> {
    try {
      const result = await this.db.query.prompts.findMany();
      return Ok(result);
    } catch {
      return Err(CommonUseCaseError.UnknownError);
    }
  }

  async getPromptByAiType(aiType: string): Promise<Result<PromptSelect, string>> {
    try {
      const result = await this.db.query.prompts.findFirst({
        where: eq(schemas.prompts.aiType, aiType),
      });
      if (!result) {
        return Err(CommonUseCaseError.NotFound);
      }
      return Ok(result);
    } catch {
      return Err(CommonUseCaseError.UnknownError);
    }
  }
}
