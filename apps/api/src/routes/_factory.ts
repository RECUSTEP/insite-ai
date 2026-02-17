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
      projectId: string | undefined;
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
    let projectId: string | undefined;
    if (res.ok && res.val[0]) {
      projectId = res.val[0].projectId;
      const updatedSession = { ...session, projectId };
      c.set("session", updatedSession);
      await c.var.sessionUseCase.updateSession(updatedSession);
    } else {
      c.set("session", { ...session, projectId: undefined });
    }
    await next();
  });
}

export const projectGuard = createFactory<Env>({
  initApp(app) {
    baseInitApp(app);
    initApp(app);
  },
});
