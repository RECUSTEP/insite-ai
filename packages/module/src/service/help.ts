import * as schemas from "@repo/db/schema";
import { sql } from "drizzle-orm";
import { Err, Ok, type Result } from "ts-results";
import { z } from "zod";
import { UseCase } from "../core/usecase";
import { CommonUseCaseError } from "../error";
import { type HelpSelect, helpInsertSchema } from "../schema";

export const saveHelpSchema = z.array(helpInsertSchema.omit({ id: true }));
export type SaveHelpInput = z.infer<typeof saveHelpSchema>;

export class HelpUseCase<T extends "d1" | "libsql"> extends UseCase<T> {
  async saveHelp(input: SaveHelpInput): Promise<Result<HelpSelect[], string>> {
    const parseResult = await saveHelpSchema.safeParseAsync(input);
    if (!parseResult.success) {
      return Err(CommonUseCaseError.InvalidInput);
    }
    const helps = parseResult.data;
    try {
      const result = await this.db
        .insert(schemas.helps)
        .values(helps)
        .onConflictDoUpdate({
          target: schemas.helps.aiType,
          set: {
            text: sql`excluded.text`,
          },
        })
        .returning();
      return Ok(result);
    } catch {
      return Err(CommonUseCaseError.UnknownError);
    }
  }

  async getHelp(): Promise<Result<HelpSelect[], string>> {
    try {
      const result = await this.db.query.helps.findMany();
      return Ok(result);
    } catch {
      return Err(CommonUseCaseError.UnknownError);
    }
  }
}
