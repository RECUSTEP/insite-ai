import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { projectGuard } from "./_factory";

const sessionHandler = projectGuard.createHandlers((c) => {
  return c.json(c.var.session);
});

const updateSchema = z.object({
  projectId: z.string(),
});

const sessionUpdateHandler = projectGuard.createHandlers(
  zValidator("json", updateSchema),
  async (c) => {
    const newSession = {
      ...c.var.session,
      projectId: c.req.valid("json").projectId,
    };
    await c.var.sessionUseCase.updateSession(newSession);
    c.set("session", newSession);
    return c.json(newSession);
  },
);

export const route = projectGuard
  .createApp()
  .get("/", ...sessionHandler)
  .put("/", ...sessionUpdateHandler);
