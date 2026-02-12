import { zValidator } from "@hono/zod-validator";
import { timingSafeEqual } from "hono/utils/buffer";
import { z } from "zod";
import { adminSessionCookie } from "../../libs/cookie";
import { factory } from "../../libs/hono";

export const ErrorMessages = {
  UsernameRequired: "IDを入力してください",
  PasswordRequired: "パスワードを入力してください",
  InvalidCredentials: "IDまたはパスワードが違います",
};

export const adminLoginSchema = z.object({
  username: z
    .string({ required_error: ErrorMessages.UsernameRequired })
    .min(1, ErrorMessages.UsernameRequired),
  password: z
    .string({ required_error: ErrorMessages.PasswordRequired })
    .min(1, ErrorMessages.PasswordRequired),
});

const loginHandler = factory.createHandlers(zValidator("json", adminLoginSchema), async (c) => {
  const { username, password } = c.req.valid("json");
  const { ADMIN_USERNAME, ADMIN_PASSWORD } = c.env;
  if (username !== ADMIN_USERNAME || !(await timingSafeEqual(password, ADMIN_PASSWORD))) {
    return c.json({ error: ErrorMessages.InvalidCredentials }, 401);
  }
  const result = await c.var.adminSessionUseCase.createSession({});
  if (!result.ok) {
    return c.json({ error: "Failed to create session" }, 500);
  }
  const session = result.val;
  adminSessionCookie.set(c, session.id, {
    expires: new Date(session.expiresAt),
  });
  return c.json({ ok: true });
});

export const route = factory.createApp().post("/", ...loginHandler);
