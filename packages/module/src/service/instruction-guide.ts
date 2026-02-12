import * as schemas from "@repo/db/schema";
import { sql, inArray } from "drizzle-orm";
import { Err, Ok, type Result } from "ts-results";
import { z } from "zod";
import { UseCase } from "../core/usecase";
import { CommonUseCaseError, InstructionGuideUseCaseError } from "../error";
import {
  InstructionGuideSelect,
  instructionGuideInsertSchema,
  instructionGuideSelectSchema,
} from "../schema";

export const saveInstructionGuideSchema = z.array(instructionGuideInsertSchema.omit({ id: true }));
export type SaveInstructionGuideInput = z.infer<typeof saveInstructionGuideSchema>;

export const getInstructionGuideShema = z.array(instructionGuideSelectSchema.shape.formName);
export type GetInstructionGuideInput = z.infer<typeof getInstructionGuideShema>;

export class InstructionGuideUseCase<T extends "d1" | "libsql"> extends UseCase<T> {
  async save(input: SaveInstructionGuideInput): Promise<Result<InstructionGuideSelect[], string>> {
    const parseResult = await saveInstructionGuideSchema.safeParseAsync(input);
    if (!parseResult.success) {
      return Err(CommonUseCaseError.InvalidInput);
    }
    const instruction = parseResult.data;
    try {
      const result = await this.db
        .insert(schemas.instructionGuide)
        .values(instruction)
        .onConflictDoUpdate({
          target: schemas.instructionGuide.formName,
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

  async getAll(): Promise<Result<InstructionGuideSelect[], string>> {
    try {
      const result = await this.db.query.instructionGuide.findMany();
      return Ok(result);
    } catch {
      return Err(CommonUseCaseError.UnknownError);
    }
  }

  async get(
    formNames: GetInstructionGuideInput,
  ): Promise<Result<InstructionGuideSelect[], string>> {
    const parseResult = getInstructionGuideShema.safeParse(formNames);
    if (!parseResult.success) {
      return Err(CommonUseCaseError.InvalidInput);
    }
    try {
      const result = await this.db.query.instructionGuide.findMany({
        where: inArray(schemas.instructionGuide.formName, formNames),
      });
      if (!result) {
        return Err(InstructionGuideUseCaseError.InstructionGuideNotFound);
      }
      return Ok(result);
    } catch {
      return Err(CommonUseCaseError.UnknownError);
    }
  }
}
