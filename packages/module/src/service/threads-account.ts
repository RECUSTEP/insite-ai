import * as schemas from "@repo/db/schema";
import { eq } from "drizzle-orm";
import { Err, Ok, type Result } from "ts-results";
import { UseCase } from "../core/usecase";
import { CommonUseCaseError } from "../error";
import type { ThreadsAccountSelect } from "../schema";

export class ThreadsAccountUseCase<T extends "d1" | "libsql"> extends UseCase<T> {
  async getByProjectId(projectId: string): Promise<Result<ThreadsAccountSelect | null, string>> {
    try {
      const result = await this.db.query.threadsAccounts.findFirst({
        where: eq(schemas.threadsAccounts.projectId, projectId),
      });
      return Ok(result ?? null);
    } catch {
      return Err(CommonUseCaseError.UnknownError);
    }
  }

  async upsert(input: {
    projectId: string;
    threadsUserId: string;
    threadsUsername: string | null;
    accessToken: string;
    tokenExpiresAt: number | null;
  }): Promise<Result<ThreadsAccountSelect, string>> {
    try {
      const now = Date.now();
      const result = await this.db
        .insert(schemas.threadsAccounts)
        .values({
          ...input,
          connectedAt: now,
          updatedAt: now,
        })
        .onConflictDoUpdate({
          target: schemas.threadsAccounts.projectId,
          set: {
            threadsUserId: input.threadsUserId,
            threadsUsername: input.threadsUsername,
            accessToken: input.accessToken,
            tokenExpiresAt: input.tokenExpiresAt,
            updatedAt: now,
          },
        })
        .returning();
      const row = result[0];
      if (!row) {
        return Err(CommonUseCaseError.UnknownError);
      }
      return Ok(row);
    } catch {
      return Err(CommonUseCaseError.UnknownError);
    }
  }

  async deleteByProjectId(projectId: string): Promise<Result<void, string>> {
    try {
      await this.db
        .delete(schemas.threadsAccounts)
        .where(eq(schemas.threadsAccounts.projectId, projectId));
      return Ok(undefined);
    } catch {
      return Err(CommonUseCaseError.UnknownError);
    }
  }
}
