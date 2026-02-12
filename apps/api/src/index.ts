import { Hono } from "hono";
import { showRoutes } from "hono/dev";
import { logger } from "hono/logger";
import type { Env } from "./env";
import { route } from "./routes";

const app = new Hono<Env>().use(logger()).route("/", route);

showRoutes(app, {
  verbose: true,
});

export default app;
export type AppType = typeof app;
