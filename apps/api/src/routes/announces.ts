import { Hono } from "hono";
import type { Env } from "../env";

export const route = new Hono<Env>().get("/", async (c) => {
  const result = await c.var.announceUsecase.getAll();
  if (!result.ok) {
    return c.json({ error: result.val }, 500);
  }
  return c.json(result.val);
});
