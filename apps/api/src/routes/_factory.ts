import type { Hono } from "hono";
import { createFactory } from "hono/factory";
import type { Bindings, Variables } from "../env";
import { sessionCookie } from "../libs/cookie";
import { initApp as baseInitApp } from "../libs/hono";

export type Env = {
  Bindings: Bindings;
  Variables: Variables & {
    session: {
      id: string;
      authId: string;
      expiresAt: number;
      projectId: string;
    };
  };
};

export function initApp(app: Hono<Env>) {
  app.use(async (c, next) => {
    const sessionId = sessionCookie.get(c);
    if (!sessionId) {
      return c.json({ error: "Unauthorized" }, 401);
    }
    const result = await c.var.sessionUseCase.validateSession({ id: sessionId });
    if (!result.ok || result.val === null) {
      sessionCookie.delete(c);
      return c.json({ error: "Unauthorized" }, 401);
    }
    const session = result.val;
    sessionCookie.set(c, session.id, {
      expires: new Date(session.expiresAt),
    });

    if (typeof session.projectId === "string") {
      c.set("session", { ...session, projectId: session.projectId });
      await next();
      return;
    }

    const res = await c.var.projectUseCase.getByAuthId(session.authId);
    if (!res.ok) {
      await next();
    } else {
      const firstProject = res.val[0];
      if (firstProject) {
        const updatedSession = { ...session, projectId: firstProject.projectId };
        c.set("session", updatedSession);
        await c.var.sessionUseCase.updateSession(updatedSession);
      }
      await next();
    }
  });
}

export const projectGuard = createFactory<Env>({
  initApp(app) {
    baseInitApp(app);
    initApp(app);
  },
});
