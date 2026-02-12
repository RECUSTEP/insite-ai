import type { Context } from "hono";
import { deleteCookie, getCookie, setCookie } from "hono/cookie";
import type { CookieOptions } from "hono/utils/cookie";

export const ADMIN_SESSION_COOKIE = "admin-session";
export const SESSION_COOKIE = "session";

export function cookieHelperFactory(cookieName: string, defaultOptions: CookieOptions = {}) {
  return {
    set(c: Context, value: string, opt: CookieOptions) {
      setCookie(c, cookieName, value, { ...defaultOptions, ...opt });
    },
    get(c: Context) {
      return getCookie(c, cookieName);
    },
    delete(c: Context) {
      deleteCookie(c, cookieName);
    },
  };
}

export const adminSessionCookie = cookieHelperFactory(ADMIN_SESSION_COOKIE, {
  path: "/",
  secure: true,
  httpOnly: true,
  sameSite: "Lax",
});

export const sessionCookie = cookieHelperFactory(SESSION_COOKIE, {
  path: "/",
  secure: true,
  httpOnly: true,
  sameSite: "Lax",
});
