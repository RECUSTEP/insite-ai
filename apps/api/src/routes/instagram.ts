import { Hono } from "hono";
import type { Env } from "../env";
import { factory } from "../libs/hono";
import { projectGuard } from "./_factory";

const INSTAGRAM_API_VERSION = "v21.0";
const INSTAGRAM_GRAPH_URL = `https://graph.instagram.com/${INSTAGRAM_API_VERSION}`;
const INSTAGRAM_LOGIN_SOURCE = "instagram_login";

const SCOPES = [
  "instagram_business_basic",
  "instagram_business_manage_insights",
  "instagram_business_manage_comments",
  "instagram_business_manage_messages",
  "instagram_business_content_publish",
].join(",");

type InstagramTokenResponse = {
  access_token?: string;
  user_id?: number;
  expires_in?: number;
  error_message?: string;
  error_type?: string;
  code?: number;
};

type InstagramProfileResponse = {
  id?: string;
  user_id?: string;
  username?: string;
  error?: { message: string; type?: string; code?: number; error_subcode?: number };
};

type InstagramTokenResolveResult =
  | { ok: true; accessToken: string; expiresIn: number | null }
  | { ok: false; errorDetail: string };

type InstagramProfileResolveResult =
  | { ok: true; instagramUserId: string; instagramUsername: string | null }
  | { ok: false; errorDetail: string };

function formatErrorSuffix(items: Array<number | string | null | undefined>) {
  const values = items.filter(Boolean);
  return values.length ? ` (${values.join(", ")})` : "";
}

function buildGraphErrorDetail(prefix: string, data: InstagramProfileResponse) {
  if (!data.error?.message) {
    return null;
  }

  return `${prefix}: ${data.error.message}${formatErrorSuffix([
    data.error.type,
    data.error.code ? `code:${data.error.code}` : null,
    data.error.error_subcode ? `subcode:${data.error.error_subcode}` : null,
  ])}`;
}

function buildTokenErrorDetail(prefix: string, data: InstagramTokenResponse) {
  if (!data.error_message) {
    return null;
  }

  return `${prefix}: ${data.error_message}${formatErrorSuffix([
    data.error_type,
    data.code ? `code:${data.code}` : null,
  ])}`;
}

function buildErrorDetail(prefix: string, data: InstagramTokenResponse | InstagramProfileResponse) {
  return (
    ("error" in data ? buildGraphErrorDetail(prefix, data) : null) ??
    ("error_message" in data ? buildTokenErrorDetail(prefix, data) : null) ??
    prefix
  );
}

function parseProjectIdFromState(stateParam: string) {
  try {
    const state = JSON.parse(atob(stateParam));
    return typeof state.projectId === "string" ? state.projectId : null;
  } catch {
    return null;
  }
}

function getInstagramConfig(env: Env["Bindings"]) {
  const appId = env.INSTAGRAM_APP_ID;
  const appSecret = env.INSTAGRAM_APP_SECRET;
  const redirectUri = env.INSTAGRAM_REDIRECT_URI;

  if (!appId || !appSecret || !redirectUri) {
    return null;
  }

  return { appId, appSecret, redirectUri };
}

async function resolveLongLivedToken(
  config: { appId: string; appSecret: string; redirectUri: string },
  code: string,
): Promise<InstagramTokenResolveResult> {
  const shortTokenData = await exchangeCodeForShortToken(
    config.appId,
    config.appSecret,
    config.redirectUri,
    code,
  );
  if (!shortTokenData.access_token) {
    console.error("Instagram token exchange failed:", shortTokenData);
    return {
      ok: false,
      errorDetail: buildErrorDetail("アクセストークンの取得に失敗しました", shortTokenData),
    };
  }

  const longTokenData = await exchangeForLongLivedToken(
    config.appSecret,
    shortTokenData.access_token,
  );
  if (!longTokenData.access_token) {
    console.error("Instagram long-lived token exchange failed:", longTokenData);
    return {
      ok: false,
      errorDetail: buildErrorDetail("長期トークンの取得に失敗しました", longTokenData),
    };
  }

  return {
    ok: true,
    accessToken: longTokenData.access_token,
    expiresIn: longTokenData.expires_in ?? null,
  };
}

async function resolveInstagramProfile(
  accessToken: string,
): Promise<InstagramProfileResolveResult> {
  const profileData = await fetchInstagramProfile(accessToken);
  const instagramUserId = profileData.user_id ?? profileData.id;
  if (!instagramUserId) {
    console.error("Instagram profile fetch failed:", profileData);
    return {
      ok: false,
      errorDetail: buildErrorDetail("Instagram アカウント情報の取得に失敗しました", profileData),
    };
  }

  return {
    ok: true,
    instagramUserId: String(instagramUserId),
    instagramUsername: profileData.username ?? null,
  };
}

async function exchangeCodeForShortToken(
  appId: string,
  appSecret: string,
  redirectUri: string,
  code: string,
): Promise<InstagramTokenResponse> {
  const body = new URLSearchParams({
    client_id: appId,
    client_secret: appSecret,
    grant_type: "authorization_code",
    redirect_uri: redirectUri,
    code,
  });

  const res = await fetch("https://api.instagram.com/oauth/access_token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body,
  });

  return (await res.json()) as InstagramTokenResponse;
}

async function exchangeForLongLivedToken(
  appSecret: string,
  shortToken: string,
): Promise<InstagramTokenResponse> {
  const res = await fetch(
    `https://graph.instagram.com/access_token?${new URLSearchParams({
      grant_type: "ig_exchange_token",
      client_secret: appSecret,
      access_token: shortToken,
    })}`,
  );

  return (await res.json()) as InstagramTokenResponse;
}

async function fetchInstagramProfile(accessToken: string): Promise<InstagramProfileResponse> {
  const res = await fetch(
    `${INSTAGRAM_GRAPH_URL}/me?${new URLSearchParams({
      fields: "id,user_id,username",
      access_token: accessToken,
    })}`,
  );

  return (await res.json()) as InstagramProfileResponse;
}

// GET /instagram/auth - Instagram Login OAuth 認可 URL を返す
const authHandler = projectGuard.createHandlers((c) => {
  const { projectId } = c.var.session;
  if (!projectId) {
    return c.json({ error: "プロジェクトが選択されていません" }, 400);
  }

  const appId = c.env.INSTAGRAM_APP_ID;
  const redirectUri = c.env.INSTAGRAM_REDIRECT_URI;

  if (!appId || !redirectUri) {
    return c.json({ error: "Instagram API の設定が不完全です" }, 500);
  }

  const state = btoa(JSON.stringify({ projectId }));
  const params = new URLSearchParams({
    client_id: appId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: SCOPES,
    state,
    enable_fb_login: "0",
    force_authentication: "1",
  });

  return c.json({ authUrl: `https://www.instagram.com/oauth/authorize?${params.toString()}` });
});

// GET /instagram/callback - Instagram Login OAuth コールバック処理
const callbackHandler = factory.createHandlers(async (c) => {
  const frontendUrl = c.env.INSTAGRAM_CALLBACK_FRONTEND_URL || c.env.META_CALLBACK_FRONTEND_URL;
  const redirectTo = (params: string) =>
    frontendUrl
      ? c.redirect(`${frontendUrl}/competitor-analysis?${params}`)
      : c.json({ error: params }, 400);

  const code = c.req.query("code");
  const stateParam = c.req.query("state");
  const errorParam = c.req.query("error");

  if (errorParam) {
    const msg = c.req.query("error_description") || errorParam;
    return redirectTo(`instagram_error=${encodeURIComponent(msg)}`);
  }

  if (!code || !stateParam) {
    return redirectTo(`instagram_error=${encodeURIComponent("code または state がありません")}`);
  }

  const projectId = parseProjectIdFromState(stateParam);
  if (!projectId) {
    return redirectTo(`instagram_error=${encodeURIComponent("不正な state パラメータです")}`);
  }

  const config = getInstagramConfig(c.env);
  if (!config) {
    return redirectTo(`instagram_error=${encodeURIComponent("Instagram API の設定が不完全です")}`);
  }

  try {
    const tokenData = await resolveLongLivedToken(config, code);
    if (!tokenData.ok) {
      return redirectTo(`instagram_error=${encodeURIComponent(tokenData.errorDetail)}`);
    }

    const profileData = await resolveInstagramProfile(tokenData.accessToken);
    if (!profileData.ok) {
      return redirectTo(`instagram_error=${encodeURIComponent(profileData.errorDetail)}`);
    }

    const tokenExpiresAt = tokenData.expiresIn ? Date.now() + tokenData.expiresIn * 1000 : null;

    const result = await c.var.instagramAccountUseCase.upsert({
      projectId,
      instagramUserId: profileData.instagramUserId,
      instagramUsername: profileData.instagramUsername,
      facebookPageId: INSTAGRAM_LOGIN_SOURCE,
      accessToken: tokenData.accessToken,
      tokenExpiresAt,
    });

    if (!result.ok) {
      return redirectTo(
        `instagram_error=${encodeURIComponent("アカウント情報の保存に失敗しました")}`,
      );
    }

    return frontendUrl
      ? c.redirect(`${frontendUrl}/competitor-analysis?instagram_connected=true`)
      : c.json({
          ok: true,
          account: {
            instagramUserId: profileData.instagramUserId,
            instagramUsername: profileData.instagramUsername,
          },
        });
  } catch (e) {
    console.error("Instagram OAuth error:", e);
    return redirectTo(
      `instagram_error=${encodeURIComponent("OAuth 処理中にエラーが発生しました")}`,
    );
  }
});

const publicRoute = factory.createApp().get("/callback", ...callbackHandler);
const guardedRoute = projectGuard.createApp().get("/auth", ...authHandler);

export const route = new Hono<Env>().route("/", publicRoute).route("/", guardedRoute);
