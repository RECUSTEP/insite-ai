import * as schemas from "@repo/db/schema";
import { desc, eq } from "drizzle-orm";
import { Err, Ok, type Result } from "ts-results";
import { z } from "zod";
import { UseCase } from "../core/usecase";
import { ChatSessionUseCaseError, CommonUseCaseError } from "../error";
import {
  type ChatSessionSelect,
  chatSessionInsertSchema,
  chatSessionSelectSchema,
} from "../schema";

export const chatMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string(),
  hasImage: z.boolean().optional(),
  timestamp: z.number(),
});

export type ChatMessage = z.infer<typeof chatMessageSchema>;

export const createChatSessionSchema = chatSessionInsertSchema
  .omit({ id: true })
  .partial({ createdAt: true, updatedAt: true });
export type CreateChatSessionInput = z.infer<typeof createChatSessionSchema>;

export const updateChatSessionSchema = chatSessionSelectSchema
  .pick({ id: true })
  .extend({ messages: z.array(chatMessageSchema) });
export type UpdateChatSessionInput = z.infer<typeof updateChatSessionSchema>;

export const getChatSessionSchema = chatSessionSelectSchema.pick({ id: true });
export const getChatSessionsSchema = chatSessionSelectSchema.pick({ projectId: true });

export class ChatSessionUseCase<T extends "d1" | "libsql"> extends UseCase<T> {
  async createChatSession(
    input: CreateChatSessionInput,
  ): Promise<Result<ChatSessionSelect, string>> {
    const parseResult = createChatSessionSchema.safeParse(input);
    if (!parseResult.success) {
      return Err(CommonUseCaseError.InvalidInput);
    }
    const now = Date.now();
    try {
      const project = await this.db.query.projects.findFirst({
        where: eq(schemas.projects.projectId, parseResult.data.projectId),
      });
      if (!project) {
        return Err(ChatSessionUseCaseError.ProjectNotFound);
      }
      const [result] = await this.db
        .insert(schemas.chatSessions)
        .values({
          projectId: parseResult.data.projectId,
          title: parseResult.data.title,
          messages: parseResult.data.messages,
          createdAt: parseResult.data.createdAt ?? now,
          updatedAt: parseResult.data.updatedAt ?? now,
        })
        .returning();
      if (!result) {
        return Err(CommonUseCaseError.UnknownError);
      }
      return Ok(result);
    } catch {
      return Err(CommonUseCaseError.UnknownError);
    }
  }

  async updateChatSession(
    input: UpdateChatSessionInput,
  ): Promise<Result<ChatSessionSelect, string>> {
    const parseResult = updateChatSessionSchema.safeParse(input);
    if (!parseResult.success) {
      return Err(CommonUseCaseError.InvalidInput);
    }
    try {
      const [result] = await this.db
        .update(schemas.chatSessions)
        .set({
          messages: parseResult.data.messages,
          updatedAt: Date.now(),
        })
        .where(eq(schemas.chatSessions.id, parseResult.data.id))
        .returning();
      if (!result) {
        return Err(ChatSessionUseCaseError.ChatSessionNotFound);
      }
      return Ok(result);
    } catch {
      return Err(CommonUseCaseError.UnknownError);
    }
  }

  async getChatSession(
    input: z.infer<typeof getChatSessionSchema>,
  ): Promise<Result<ChatSessionSelect, string>> {
    try {
      const result = await this.db.query.chatSessions.findFirst({
        where: eq(schemas.chatSessions.id, input.id),
      });
      if (!result) {
        return Err(ChatSessionUseCaseError.ChatSessionNotFound);
      }
      return Ok(result);
    } catch {
      return Err(CommonUseCaseError.UnknownError);
    }
  }

  async getChatSessions(
    input: z.infer<typeof getChatSessionsSchema>,
  ): Promise<Result<ChatSessionSelect[], string>> {
    try {
      const result = await this.db.query.chatSessions.findMany({
        where: eq(schemas.chatSessions.projectId, input.projectId),
        orderBy: [desc(schemas.chatSessions.updatedAt)],
      });
      return Ok(result);
    } catch {
      return Err(CommonUseCaseError.UnknownError);
    }
  }
}
