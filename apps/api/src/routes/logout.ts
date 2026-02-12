import { sessionCookie } from "../libs/cookie";
import { projectGuard } from "./_factory";

export const logoutHandler = projectGuard.createHandlers(async (c) => {
  const { session } = c.var;
  const result = await c.var.sessionUseCase.deleteSession({ id: session.id });
  if (!result.ok) {
    return c.json({ error: result.val }, 500);
  }
  sessionCookie.delete(c);
  return c.json({ ok: true });
});

export const route = projectGuard.createApp().post("/", ...logoutHandler);
