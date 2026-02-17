import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { adminGuard } from "./_factory";

export const announceSchema = z.object({
  id: z.number().optional(),
  title: z.string().min(1),
  content: z.string().min(1),
  createdAt: z.number().optional(),
  updatedAt: z.number().optional(),
});

export const announcesSchema = z.array(announceSchema);

const getAllHandler = adminGuard.createHandlers(async (c) => {
  const result = await c.var.announceUsecase.getAll();
  if (!result.ok) {
    return c.json({ error: result.val }, 500);
  }
  return c.json(result.val);
});

const createHandler = adminGuard.createHandlers(
  zValidator("json", announceSchema),
  async (c) => {
    const data = c.req.valid("json");
    const result = await c.var.announceUsecase.create(data);
    if (!result.ok) {
      return c.json({ error: result.val }, 500);
    }
    return c.json(result.val);
  },
);

const updateHandler = adminGuard.createHandlers(
  zValidator("json", announceSchema),
  async (c) => {
    const data = c.req.valid("json");
    if (!data.id) {
      return c.json({ error: "ID is required" }, 400);
    }
    const result = await c.var.announceUsecase.update(data.id, data);
    if (!result.ok) {
      return c.json({ error: result.val }, 500);
    }
    return c.json(result.val);
  },
);

const deleteHandler = adminGuard.createHandlers(async (c) => {
  const id = Number(c.req.param("id"));
  if (Number.isNaN(id)) {
    return c.json({ error: "Invalid ID" }, 400);
  }
  const result = await c.var.announceUsecase.delete(id);
  if (!result.ok) {
    return c.json({ error: result.val }, 500);
  }
  return c.json({ success: true });
});

export const route = adminGuard
  .createApp()
  .get("/", ...getAllHandler)
  .post("/", ...createHandler)
  .put("/", ...updateHandler)
  .delete("/:id", ...deleteHandler);
