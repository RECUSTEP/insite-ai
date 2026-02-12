import { adminGuard } from "./_factory";

const sessionHandler = adminGuard.createHandlers((c) => {
  return c.json(c.var.session);
});

export const route = adminGuard.createApp().get("/", ...sessionHandler);
