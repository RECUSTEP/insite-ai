import { zValidator } from "@hono/zod-validator";
import { AuthUseCaseError } from "@repo/module/error";
import { timingSafeEqual } from "hono/utils/buffer";
import { z } from "zod";
import { sessionCookie } from "../libs/cookie";
import { factory } from "../libs/hono";

export const ErrorMessages = {
  UsernameRequired: "IDを入力してください",
  PasswordRequired: "パスワードを入力してください",
  InvalidCredentials: "IDまたはパスワードが違います",
};

export const loginSchema = z.object({
  id: z
    .string({ required_error: ErrorMessages.UsernameRequired })
    .min(1, ErrorMessages.UsernameRequired),
  password: z
    .string({ required_error: ErrorMessages.PasswordRequired })
    .min(1, ErrorMessages.PasswordRequired),
});

const loginHandler = factory.createHandlers(zValidator("json", loginSchema), async (c) => {
  const { id, password } = c.req.valid("json");
  try {
    const result = await c.var.authUseCase.getAuth(id);
    if (!result.ok) {
      console.error(result);
      if (result.val === AuthUseCaseError.AuthNotFound) {
        return c.json({ error: ErrorMessages.InvalidCredentials }, 401);
      } else {
        return c.json({ error: result.val }, 500);
      }
    }
    const auth = result.val;
    if (!(await timingSafeEqual(password, auth.password))) {
      return c.json({ error: ErrorMessages.InvalidCredentials }, 401);
    }
    const sessionResult = await c.var.sessionUseCase.createSession({ authId: id });
    if (!sessionResult.ok) {
      return c.json({ error: "Failed to create session" }, 500);
    }
    const session = sessionResult.val;
    sessionCookie.set(c, session.id, {
      expires: new Date(session.expiresAt),
    });
    return c.json({ ok: true });
  } catch (e) {
    console.error(e);
    return c.json({ error: e }, 500);
  }
});

export const route = factory.createApp().post("/", ...loginHandler);
