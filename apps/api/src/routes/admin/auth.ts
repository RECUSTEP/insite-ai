import { zValidator } from "@hono/zod-validator";
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
    console.error(`[GET /admin/auth/${authId}] error:`, result.val);
    return c.json({ error: result.val }, 400);
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
      const errVal = !result.ok ? result.val : count.val;
      console.error("[GET /admin/auth] error:", errVal);
      return c.json({ error: errVal }, 400);
    }
    const hasNext = count.val > offset + limit;
    return c.json({ auth: result.val, hasNext });
  },
);

const getAuthWithProjectsSchema = z.object({
  offset: z.coerce.number().int().nonnegative().default(0),
  limit: z.coerce.number().int().nonnegative().default(20),
  searchText: z.string().optional(),
});
const getAuthWithProjectsHandler = adminGuard.createHandlers(
  zValidator("query", getAuthWithProjectsSchema),
  async (c) => {
    const { offset, limit, searchText } = c.req.valid("query");
    const result = await c.var.authUseCase.getAuthWithProjects({ offset, limit, searchText });
    if (!result.ok) {
      console.error("[GET /admin/auth/with-projects] error:", result.val);
      return c.json({ error: result.val }, 400);
    }
    const authWithProjects = result.val;
    const hasNext = authWithProjects.length === limit;
    return c.json({ authWithProjects, hasNext });
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
  .get("/with-projects", ...getAuthWithProjectsHandler)
  .get("/:authId", ...getAuthHandler)
  .patch("/:authId", ...updateAuthHandler)
  .get("/", ...getAuthListHandler)
  .delete("/:id", ...deleteAuthHandler);
