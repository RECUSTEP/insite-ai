import * as schemas from "@repo/db/schema";
import { sql } from "drizzle-orm";
import { Err, Ok, type Result } from "ts-results";
import { z } from "zod";
import { UseCase } from "../core/usecase";
import { CommonUseCaseError } from "../error";
import { type ApplicationSettingSelect, applicationSettingInsertSchema } from "../schema";

export const saveApplicationSettingSchema = z.array(
  applicationSettingInsertSchema.omit({ id: true }),
);
export type SaveApplicationSettingInput = z.infer<typeof saveApplicationSettingSchema>;

export class ApplicationSettingUseCase<T extends "d1" | "libsql"> extends UseCase<T> {
  async saveApplicationSetting(
    input: SaveApplicationSettingInput,
  ): Promise<Result<ApplicationSettingSelect[], string>> {
    const parseResult = await saveApplicationSettingSchema.safeParseAsync(input);
    if (!parseResult.success) {
      return Err(CommonUseCaseError.InvalidInput);
    }
    const applicationSettings = parseResult.data;
    try {
      const result = await this.db
        .insert(schemas.applicationSettings)
        .values(applicationSettings)
        .onConflictDoUpdate({
          target: schemas.applicationSettings.key,
          set: {
            value: sql`excluded.value`,
          },
        })
        .returning();
      return Ok(result);
    } catch {
      return Err(CommonUseCaseError.UnknownError);
    }
  }

  async getApplicationSetting(): Promise<Result<ApplicationSettingSelect[], string>> {
    try {
      const result = await this.db.query.applicationSettings.findMany();
      return Ok(result);
    } catch {
      return Err(CommonUseCaseError.UnknownError);
    }
  }
}
