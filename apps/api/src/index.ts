import { Hono } from "hono";
import { showRoutes } from "hono/dev";
import { logger } from "hono/logger";
import type { Env } from "./env";
import { route } from "./routes";

const app = new Hono<Env>()
  .use(logger())
  .onError((err, c) => {
    const method = c.req.method;
    const path = c.req.path;
    const message = err instanceof Error ? err.message : String(err);
    const stack = err instanceof Error ? err.stack ?? "" : "";
    console.error(`[API ERROR] ${method} ${path} — ${message}`);
    if (stack) console.error(stack);
    return c.json(
      {
        error: "InternalServerError",
        message,
        path,
        method,
      },
      500,
    );
  })
  .route("/", route);

showRoutes(app, {
  verbose: true,
});

export default app;
export type AppType = typeof app;
