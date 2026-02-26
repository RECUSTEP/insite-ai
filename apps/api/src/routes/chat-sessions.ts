import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";
import type { Env } from "../env";
import { projectGuard } from "./_factory";

const chatMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string(),
  hasImage: z.boolean().optional(),
  timestamp: z.number(),
});

export const route = new Hono<Env>()
  .get(
    "/",
    ...projectGuard.createHandlers(async (c) => {
      const projectId = c.var.session.projectId;
      if (!projectId) {
        return c.json({ error: "Project not selected" }, 400);
      }
      const result = await c.var.chatSessionUseCase.getChatSessions({ projectId });
      if (!result.ok) {
        return c.json({ error: result.val }, 500);
      }
      return c.json(result.val);
    }),
  )
  .get(
    "/:id",
    ...projectGuard.createHandlers(async (c) => {
      const id = c.req.param("id");
      const result = await c.var.chatSessionUseCase.getChatSession({ id });
      if (!result.ok) {
        return c.json({ error: result.val }, 404);
      }
      return c.json(result.val);
    }),
  )
  .post(
    "/",
    ...projectGuard.createHandlers(
      zValidator(
        "json",
        z.object({
          title: z.string().min(1).max(100),
          messages: z.array(chatMessageSchema),
        }),
      ),
      async (c) => {
        const projectId = c.var.session.projectId;
        if (!projectId) {
          return c.json({ error: "Project not selected" }, 400);
        }
        const { title, messages } = c.req.valid("json");
        const result = await c.var.chatSessionUseCase.createChatSession({
          projectId,
          title,
          messages,
        });
        if (!result.ok) {
          return c.json({ error: result.val }, 500);
        }
        return c.json(result.val, 201);
      },
    ),
  )
  .patch(
    "/:id",
    ...projectGuard.createHandlers(
      zValidator(
        "json",
        z.object({
          messages: z.array(chatMessageSchema),
        }),
      ),
      async (c) => {
        const id = c.req.param("id");
        const { messages } = c.req.valid("json");
        const result = await c.var.chatSessionUseCase.updateChatSession({ id, messages });
        if (!result.ok) {
          return c.json({ error: result.val }, 500);
        }
        return c.json(result.val);
      },
    ),
  );
