import { zValidator } from "@hono/zod-validator";
import { CommonUseCaseError } from "@repo/module/error";
import { adminGuard } from "./_factory";
import { z } from "zod";
import { authSchema, updateAuthSchema } from "@repo/module/service";

const getAuthSchema = z.object({
  authId: z.string(),
});
const getAuthHandler = adminGuard.createHandlers(zValidator("param", getAuthSchema), async (c) => {
  const { authId } = c.req.valid("param");
  const result = await c.var.authUseCase.getAuth(authId);
  if (!result.ok) {
    return c.json({ error: CommonUseCaseError.UnknownError }, 400);
  }
  return c.json({ auth: result.val });
});

const getAuthListSchema = z.object({
  offset: z.coerce.number().int().nonnegative(),
  limit: z.coerce.number().int().nonnegative(),
});
const getAuthListHandler = adminGuard.createHandlers(
  zValidator("query", getAuthListSchema),
  async (c) => {
    const { offset, limit } = c.req.valid("query");
    const result = await c.var.authUseCase.getAuthList({ offset, limit });
    const count = await c.var.authUseCase.count();
    if (!result.ok || !count.ok) {
      return c.json({ error: CommonUseCaseError.UnknownError }, 400);
    }
    const hasNext = count.val > offset + limit;
    return c.json({ auth: result.val, hasNext });
  },
);

const updateAuthHandler = adminGuard.createHandlers(
  zValidator("json", updateAuthSchema),
  async (c) => {
    const result = await c.var.authUseCase.update({
      ...c.req.valid("json"),
    });
    if (!result.ok) {
      return c.json({ error: result.val }, 400);
    }
    return c.json(result.val);
  },
);

const createAuthHandler = adminGuard.createHandlers(zValidator("json", authSchema), async (c) => {
  const result = await c.var.authUseCase.create(c.req.valid("json"));
  if (!result.ok) {
    return c.json({ error: result.val }, 400);
  }
  return c.json(result.val);
});

export const deleteAuthSchema = authSchema.pick({ id: true });
const deleteAuthHandler = adminGuard.createHandlers(
  zValidator("param", deleteAuthSchema),
  async (c) => {
    const result = await c.var.authUseCase.delete(c.req.valid("param"));
    if (!result.ok) {
      return c.json({ error: result.val }, 400);
    }
    return c.json(result.val);
  },
);

export const route = adminGuard
  .createApp()
  .post("/", ...createAuthHandler)
  .get("/:authId", ...getAuthHandler)
  .patch("/:authId", ...updateAuthHandler)
  .get("/", ...getAuthListHandler)
  .delete("/:id", ...deleteAuthHandler);
