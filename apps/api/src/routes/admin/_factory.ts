import type { Hono } from "hono";
import { createFactory } from "hono/factory";
import type { Bindings, Variables } from "../../env";
import { adminSessionCookie } from "../../libs/cookie";
import { initApp as baseInitApp } from "../../libs/hono";

export type Env = {
  Bindings: Bindings;
  Variables: Variables & {
    session: {
      id: string;
      expiresAt: number;
    };
  };
};

export function initApp(app: Hono<Env>) {
  app.use(async (c, next) => {
    const sessionId = adminSessionCookie.get(c);
    if (!sessionId) {
      return c.json({ error: "Unauthorized" }, 401);
    }
    const result = await c.var.adminSessionUseCase.validateSession({ id: sessionId });
    if (!result.ok || result.val === null) {
      adminSessionCookie.delete(c);
      return c.json({ error: "Unauthorized" }, 401);
    }
    const session = result.val;
    adminSessionCookie.set(c, session.id, {
      expires: new Date(session.expiresAt),
    });
    c.set("session", session);
    await next();
  });
}

export const adminGuard = createFactory<Env>({
  initApp(app) {
    baseInitApp(app);
    initApp(app);
  },
});
