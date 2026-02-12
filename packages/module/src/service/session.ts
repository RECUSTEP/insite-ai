import * as schemas from "@repo/db/schema";
import { eq } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { Err, Ok, OkImpl, type Result } from "ts-results";
import type { z } from "zod";
import { generateId } from "../core/auth";
import type { Database } from "../core/db";
import { UseCase } from "../core/usecase";
import { CommonUseCaseError, SessionUseCaseError } from "../error";

export type SessionConfig = {
  sessionDuration: number;
};

class BaseSessionUseCase<
  T extends "d1" | "libsql",
  S extends typeof schemas.sessions | typeof schemas.adminSessions,
> extends UseCase<T> {
  readonly config: SessionConfig;
  private readonly schema: S;
  private readonly createSessionSchema;
  private readonly validateSessionSchema;
  private readonly deleteSessionSchema;
  private readonly updateSessionSchema;

  constructor(db: Database<T>, config: SessionConfig, schema: S) {
    super(db);
    this.config = config;
    this.schema = schema;
    this.createSessionSchema = createInsertSchema(schema).omit({
      id: true,
      expiresAt: true,
    });
    this.validateSessionSchema = createInsertSchema(schema).pick({ id: true });
    this.deleteSessionSchema = createInsertSchema(schema).pick({ id: true });
    this.updateSessionSchema = createInsertSchema(schema);
  }

  async createSession(
    input: z.infer<typeof this.createSessionSchema>,
  ): Promise<Result<S["$inferInsert"], string>> {
    const parseResult = await this.createSessionSchema.safeParseAsync(input);
    if (!parseResult.success) {
      return Err(CommonUseCaseError.InvalidInput);
    }
    const parsedInput = parseResult.data;
    const id = generateId();
    const expiresAt = new Date(Date.now() + this.config.sessionDuration).getTime();
    try {
      const [result] = await this.db
        .insert(this.schema)
        // @ts-ignore
        .values({
          id,
          expiresAt,
          ...parsedInput,
        })
        .returning();
      if (!result) {
        return Err(SessionUseCaseError.SessionCreationFailed);
      }
      return Ok(result);
    } catch {
      return Err(CommonUseCaseError.UnknownError);
    }
  }

  async updateSession(
    input: z.infer<typeof this.updateSessionSchema>,
  ): Promise<Result<null, string>> {
    const parseResult = await this.updateSessionSchema.safeParseAsync(input);
    if (!parseResult.success) {
      return Err(CommonUseCaseError.InvalidInput);
    }
    const parsedInput = parseResult.data;
    try {
      const [result] = await this.db
        .update(this.schema)
        // @ts-ignore
        .set(parsedInput)
        // @ts-ignore
        .where(eq(this.schema.id, parsedInput.id))
        .returning();
      if (!result) {
        return Err(SessionUseCaseError.SessionCreationFailed);
      }
      return Ok(null);
    } catch {
      return Err(CommonUseCaseError.UnknownError);
    }
  }

  async validateSession(
    input: z.infer<typeof this.validateSessionSchema>,
  ): Promise<Result<S["$inferInsert"] | null, string>> {
    const parseResult = await this.validateSessionSchema.safeParseAsync(input);
    if (!parseResult.success) {
      return Err(CommonUseCaseError.InvalidInput);
    }
    const { id } = parseResult.data as { id: string };
    try {
      let [session] = (await this.db
        .select()
        .from(this.schema)
        .where(eq(this.schema.id, id))) as (typeof this.schema.$inferSelect)[];
      if (!session) {
        return Ok(null);
      }
      if (session.expiresAt < Date.now()) {
        // @ts-ignore
        const result = await this.deleteSession({ id });
        if (!result.ok) {
          return result;
        }
        return Ok(null);
      }
      const activeSessionPeriod = session.expiresAt - this.config.sessionDuration / 2;
      if (activeSessionPeriod < Date.now()) {
        const [result] = await this.db
          .update(this.schema)
          // @ts-ignore
          .set({ expiresAt: new Date(Date.now() + this.config.sessionDuration).getTime() })
          .where(eq(this.schema.id, id))
          .returning();
        if (!result) {
          return Err(SessionUseCaseError.SessionValidationFailed);
        }
        session = result;
      }
      return Ok(session);
    } catch {
      return Err(CommonUseCaseError.UnknownError);
    }
  }

  async deleteSession(
    input: z.infer<typeof this.deleteSessionSchema>,
  ): Promise<Result<null, string>> {
    const parseResult = await this.deleteSessionSchema.safeParseAsync(input);
    if (!parseResult.success) {
      return Err(CommonUseCaseError.InvalidInput);
    }
    // @ts-ignore
    const { id } = parseResult.data;
    try {
      const [result] = await this.db.delete(this.schema).where(eq(this.schema.id, id)).returning();
      if (!result) {
        return Err(SessionUseCaseError.SessionDeletionFailed);
      }
      return Ok(null);
    } catch {
      return Err(CommonUseCaseError.UnknownError);
    }
  }
}

export class SessionUseCase<T extends "d1" | "libsql"> extends BaseSessionUseCase<
  T,
  typeof schemas.sessions
> {
  constructor(db: Database<T>, config: SessionConfig) {
    super(db, config, schemas.sessions);
  }
}

export class AdminSessionUseCase<T extends "d1" | "libsql"> extends BaseSessionUseCase<
  T,
  typeof schemas.adminSessions
> {
  constructor(db: Database<T>, config: SessionConfig) {
    super(db, config, schemas.adminSessions);
  }
}
