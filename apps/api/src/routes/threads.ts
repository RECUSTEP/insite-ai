import { Hono } from "hono";
import type { Env } from "../env";
import { factory } from "../libs/hono";
import { projectGuard } from "./_factory";

const THREADS_GRAPH_URL = "https://graph.threads.net/v1.0";
const THREADS_AUTH_URL = "https://www.threads.net/oauth/authorize";

const SCOPES = ["threads_basic", "threads_manage_insights"].join(",");

type ThreadsTokenResponse = {
  access_token?: string;
  token_type?: string;
  user_id?: string | number;
  expires_in?: number;
  error_message?: string;
  error_type?: string;
  code?: number;
  error?: { message?: string; type?: string; code?: number; error_subcode?: number };
};

type ThreadsProfileResponse = {
  id?: string;
  username?: string;
  name?: string;
  error?: { message?: string; type?: string; code?: number; error_subcode?: number };
};

function formatErrorSuffix(items: Array<number | string | null | undefined>) {
  const values = items.filter(Boolean);
  return values.length ? ` (${values.join(", ")})` : "";
}

function buildThreadsErrorDetail(
  prefix: string,
  data: ThreadsTokenResponse | ThreadsProfileResponse,
) {
  if ("error" in data && data.error?.message) {
    return `${prefix}: ${data.error.message}${formatErrorSuffix([
      data.error.type,
      data.error.code ? `code:${data.error.code}` : null,
      data.error.error_subcode ? `subcode:${data.error.error_subcode}` : null,
    ])}`;
  }

  if ("error_message" in data && data.error_message) {
    return `${prefix}: ${data.error_message}${formatErrorSuffix([
      data.error_type,
      data.code ? `code:${data.code}` : null,
    ])}`;
  }

  return prefix;
}

function parseProjectIdFromState(stateParam: string) {
  try {
    const state = JSON.parse(atob(stateParam));
    return typeof state.projectId === "string" ? state.projectId : null;
  } catch {
    return null;
  }
}

function getThreadsConfig(env: Env["Bindings"]) {
  const appId = env.THREADS_APP_ID;
  const appSecret = env.THREADS_APP_SECRET;
  const redirectUri = env.THREADS_REDIRECT_URI;

  if (!appId || !appSecret || !redirectUri) {
    return null;
  }

  return { appId, appSecret, redirectUri };
}

async function exchangeCodeForShortToken(
  config: { appId: string; appSecret: string; redirectUri: string },
  code: string,
): Promise<ThreadsTokenResponse> {
  const params = new URLSearchParams({
    client_id: config.appId,
    client_secret: config.appSecret,
    code,
    grant_type: "authorization_code",
    redirect_uri: config.redirectUri,
  });
  const res = await fetch(`${THREADS_GRAPH_URL}/oauth/access_token?${params.toString()}`, {
    method: "POST",
  });
  return (await res.json()) as ThreadsTokenResponse;
}

async function exchangeForLongLivedToken(
  appSecret: string,
  shortToken: string,
): Promise<ThreadsTokenResponse> {
  const params = new URLSearchParams({
    grant_type: "th_exchange_token",
    client_secret: appSecret,
    access_token: shortToken,
  });
  const res = await fetch(`${THREADS_GRAPH_URL}/access_token?${params.toString()}`);
  return (await res.json()) as ThreadsTokenResponse;
}

async function fetchThreadsProfile(accessToken: string): Promise<ThreadsProfileResponse> {
  const params = new URLSearchParams({
    fields: "id,username,name",
    access_token: accessToken,
  });
  const res = await fetch(`${THREADS_GRAPH_URL}/me?${params.toString()}`);
  return (await res.json()) as ThreadsProfileResponse;
}

const authHandler = projectGuard.createHandlers((c) => {
  const { projectId } = c.var.session;
  if (!projectId) {
    return c.json({ error: "プロジェクトが選択されていません" }, 400);
  }

  const appId = c.env.THREADS_APP_ID;
  const redirectUri = c.env.THREADS_REDIRECT_URI;

  if (!appId || !redirectUri) {
    return c.json({ error: "Threads API の設定が不完全です" }, 500);
  }

  const state = btoa(JSON.stringify({ projectId }));
  const params = new URLSearchParams({
    client_id: appId,
    redirect_uri: redirectUri,
    scope: SCOPES,
    response_type: "code",
    state,
  });

  return c.json({ authUrl: `${THREADS_AUTH_URL}?${params.toString()}` });
});

const callbackHandler = factory.createHandlers(async (c) => {
  const frontendUrl = c.env.THREADS_CALLBACK_FRONTEND_URL || c.env.META_CALLBACK_FRONTEND_URL;
  const redirectTo = (params: string) =>
    frontendUrl
      ? c.redirect(`${frontendUrl}/competitor-analysis?${params}`)
      : c.json({ error: params }, 400);

  const code = c.req.query("code");
  const stateParam = c.req.query("state");
  const errorParam = c.req.query("error");

  if (errorParam) {
    const msg = c.req.query("error_description") || errorParam;
    return redirectTo(`threads_error=${encodeURIComponent(msg)}`);
  }

  if (!code || !stateParam) {
    return redirectTo(`threads_error=${encodeURIComponent("code または state がありません")}`);
  }

  const projectId = parseProjectIdFromState(stateParam);
  if (!projectId) {
    return redirectTo(`threads_error=${encodeURIComponent("不正な state パラメータです")}`);
  }

  const config = getThreadsConfig(c.env);
  if (!config) {
    return redirectTo(`threads_error=${encodeURIComponent("Threads API の設定が不完全です")}`);
  }

  try {
    const shortTokenData = await exchangeCodeForShortToken(config, code);
    if (!shortTokenData.access_token) {
      console.error("Threads token exchange failed:", shortTokenData);
      return redirectTo(
        `threads_error=${encodeURIComponent(
          buildThreadsErrorDetail("アクセストークンの取得に失敗しました", shortTokenData),
        )}`,
      );
    }

    const longTokenData = await exchangeForLongLivedToken(
      config.appSecret,
      shortTokenData.access_token,
    );
    if (!longTokenData.access_token) {
      console.error("Threads long-lived token exchange failed:", longTokenData);
      return redirectTo(
        `threads_error=${encodeURIComponent(
          buildThreadsErrorDetail("長期トークンの取得に失敗しました", longTokenData),
        )}`,
      );
    }

    const profileData = await fetchThreadsProfile(longTokenData.access_token);
    const threadsUserId = profileData.id ?? shortTokenData.user_id ?? longTokenData.user_id;
    if (!threadsUserId) {
      console.error("Threads profile fetch failed:", profileData);
      return redirectTo(
        `threads_error=${encodeURIComponent(
          buildThreadsErrorDetail("Threads アカウント情報の取得に失敗しました", profileData),
        )}`,
      );
    }

    const tokenExpiresAt = longTokenData.expires_in
      ? Date.now() + longTokenData.expires_in * 1000
      : null;
    const result = await c.var.threadsAccountUseCase.upsert({
      projectId,
      threadsUserId: String(threadsUserId),
      threadsUsername: profileData.username ?? null,
      accessToken: longTokenData.access_token,
      tokenExpiresAt,
    });

    if (!result.ok) {
      return redirectTo(
        `threads_error=${encodeURIComponent("アカウント情報の保存に失敗しました")}`,
      );
    }

    return frontendUrl
      ? c.redirect(`${frontendUrl}/competitor-analysis?threads_connected=true`)
      : c.json({
          ok: true,
          account: {
            threadsUserId: String(threadsUserId),
            threadsUsername: profileData.username ?? null,
          },
        });
  } catch (e) {
    console.error("Threads OAuth error:", e);
    return redirectTo(`threads_error=${encodeURIComponent("OAuth 処理中にエラーが発生しました")}`);
  }
});

const getAccountHandler = projectGuard.createHandlers(async (c) => {
  const { projectId } = c.var.session;
  if (!projectId) {
    return c.json({ error: "プロジェクトが選択されていません" }, 400);
  }

  const result = await c.var.threadsAccountUseCase.getByProjectId(projectId);
  if (!result.ok) {
    return c.json({ error: result.val }, 500);
  }

  if (!result.val) {
    return c.json({ connected: false });
  }

  return c.json({
    connected: true,
    account: {
      threadsUserId: result.val.threadsUserId,
      threadsUsername: result.val.threadsUsername,
      connectedAt: result.val.connectedAt,
    },
  });
});

const deleteAccountHandler = projectGuard.createHandlers(async (c) => {
  const { projectId } = c.var.session;
  if (!projectId) {
    return c.json({ error: "プロジェクトが選択されていません" }, 400);
  }

  const result = await c.var.threadsAccountUseCase.deleteByProjectId(projectId);
  if (!result.ok) {
    return c.json({ error: result.val }, 500);
  }

  return c.json({ ok: true });
});

const publicRoute = factory.createApp().get("/callback", ...callbackHandler);

const guardedRoute = projectGuard
  .createApp()
  .get("/auth", ...authHandler)
  .get("/account", ...getAccountHandler)
  .delete("/account", ...deleteAccountHandler);

export const route = new Hono<Env>().route("/", publicRoute).route("/", guardedRoute);
