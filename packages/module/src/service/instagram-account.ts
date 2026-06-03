import * as schemas from "@repo/db/schema";
import { eq } from "drizzle-orm";
import { Err, Ok, type Result } from "ts-results";
import { UseCase } from "../core/usecase";
import { CommonUseCaseError } from "../error";
import type { InstagramAccountSelect } from "../schema";

export class InstagramAccountUseCase<T extends "d1" | "libsql"> extends UseCase<T> {
  async getByProjectId(projectId: string): Promise<Result<InstagramAccountSelect | null, string>> {
    try {
      const result = await this.db.query.instagramAccounts.findFirst({
        where: eq(schemas.instagramAccounts.projectId, projectId),
      });
      return Ok(result ?? null);
    } catch {
      return Err(CommonUseCaseError.UnknownError);
    }
  }

  async upsert(input: {
    projectId: string;
    instagramUserId: string;
    instagramUsername: string | null;
    facebookPageId: string;
    accessToken: string;
    tokenExpiresAt: number | null;
  }): Promise<Result<InstagramAccountSelect, string>> {
    try {
      const now = Date.now();
      const result = await this.db
        .insert(schemas.instagramAccounts)
        .values({
          ...input,
          connectedAt: now,
          updatedAt: now,
        })
        .onConflictDoUpdate({
          target: schemas.instagramAccounts.projectId,
          set: {
            instagramUserId: input.instagramUserId,
            instagramUsername: input.instagramUsername,
            facebookPageId: input.facebookPageId,
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
        .delete(schemas.instagramAccounts)
        .where(eq(schemas.instagramAccounts.projectId, projectId));
      return Ok(undefined);
    } catch {
      return Err(CommonUseCaseError.UnknownError);
    }
  }
}
