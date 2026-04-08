import { projectGuard } from "./_factory";

const META_API_VERSION = "v21.0";
const META_GRAPH_URL = `https://graph.facebook.com/${META_API_VERSION}`;

// OAuth に必要なパーミッション
const SCOPES = [
  "instagram_basic",
  "instagram_manage_insights",
  "pages_show_list",
  "pages_read_engagement",
].join(",");

type TokenResponse = {
  access_token?: string;
  expires_in?: number;
  error?: { message: string };
};

type PagesResponse = {
  data?: Array<{ id: string; name: string; access_token: string }>;
  error?: { message: string };
};

type IgAccountResponse = {
  instagram_business_account?: { id: string };
  error?: { message: string };
};

type IgUserResponse = {
  username?: string;
  error?: { message: string };
};

// ============================================================
// GET /meta/auth — Facebook OAuth 認可 URL を返す
// ============================================================
const authHandler = projectGuard.createHandlers(async (c) => {
  const { projectId } = c.var.session;
  if (!projectId) {
    return c.json({ error: "プロジェクトが選択されていません" }, 400);
  }

  const appId = c.env.META_APP_ID;
  const redirectUri = c.env.META_REDIRECT_URI;

  if (!appId || !redirectUri) {
    return c.json({ error: "Meta API の設定が不完全です" }, 500);
  }

  const configId = c.env.META_CONFIG_ID;
  const state = btoa(JSON.stringify({ projectId }));

  const params = new URLSearchParams({
    client_id: appId,
    redirect_uri: redirectUri,
    response_type: "code",
    state,
  });
  // ビジネス向けFacebookログインの場合は config_id を使用
  if (configId) {
    params.set("config_id", configId);
  } else {
    params.set("scope", SCOPES);
  }
  const authUrl = `https://www.facebook.com/${META_API_VERSION}/dialog/oauth?${params.toString()}`;

  return c.json({ authUrl });
});

// ============================================================
// helpers
// ============================================================
async function exchangeCodeForToken(
  appId: string,
  appSecret: string,
  redirectUri: string,
  code: string,
): Promise<TokenResponse> {
  const res = await fetch(
    `${META_GRAPH_URL}/oauth/access_token?${new URLSearchParams({
      client_id: appId,
      client_secret: appSecret,
      redirect_uri: redirectUri,
      code,
    })}`,
  );
  return (await res.json()) as TokenResponse;
}

async function exchangeForLongLivedToken(
  appId: string,
  appSecret: string,
  shortToken: string,
): Promise<TokenResponse> {
  const res = await fetch(
    `${META_GRAPH_URL}/oauth/access_token?${new URLSearchParams({
      grant_type: "fb_exchange_token",
      client_id: appId,
      client_secret: appSecret,
      fb_exchange_token: shortToken,
    })}`,
  );
  return (await res.json()) as TokenResponse;
}

async function findInstagramAccount(pages: PagesResponse["data"]) {
  if (!pages) return null;

  for (const page of pages) {
    const igRes = await fetch(
      `${META_GRAPH_URL}/${page.id}?fields=instagram_business_account&access_token=${page.access_token}`,
    );
    const igData = (await igRes.json()) as IgAccountResponse;

    if (igData.instagram_business_account) {
      const userRes = await fetch(
        `${META_GRAPH_URL}/${igData.instagram_business_account.id}?fields=username&access_token=${page.access_token}`,
      );
      const userData = (await userRes.json()) as IgUserResponse;

      return {
        instagramUserId: igData.instagram_business_account.id,
        instagramUsername: userData.username ?? null,
        facebookPageId: page.id,
        pageAccessToken: page.access_token,
      };
    }
  }
  return null;
}

// ============================================================
// GET /meta/callback — OAuth コールバック処理
// ============================================================
const callbackHandler = projectGuard.createHandlers(async (c) => {
  const code = c.req.query("code");
  const stateParam = c.req.query("state");
  const errorParam = c.req.query("error");

  if (errorParam) {
    return c.json(
      { error: `OAuth エラー: ${c.req.query("error_description") || errorParam}` },
      400,
    );
  }

  if (!code || !stateParam) {
    return c.json({ error: "code または state パラメータがありません" }, 400);
  }

  let projectId: string;
  try {
    const state = JSON.parse(atob(stateParam));
    projectId = state.projectId;
  } catch {
    return c.json({ error: "不正な state パラメータです" }, 400);
  }

  const appId = c.env.META_APP_ID;
  const appSecret = c.env.META_APP_SECRET;
  const redirectUri = c.env.META_REDIRECT_URI;

  try {
    // Step 1: code → 短期アクセストークン
    const tokenData = await exchangeCodeForToken(appId, appSecret, redirectUri, code);
    if (!tokenData.access_token) {
      console.error("Token exchange failed:", tokenData);
      return c.json({ error: "アクセストークンの取得に失敗しました" }, 400);
    }

    // Step 2: 短期 → 長期アクセストークン
    const longTokenData = await exchangeForLongLivedToken(appId, appSecret, tokenData.access_token);
    if (!longTokenData.access_token) {
      console.error("Long-lived token exchange failed:", longTokenData);
      return c.json({ error: "長期トークンの取得に失敗しました" }, 400);
    }

    const accessToken = longTokenData.access_token;
    const tokenExpiresAt = longTokenData.expires_in
      ? Date.now() + longTokenData.expires_in * 1000
      : null;

    // Step 3: Facebook ページ一覧を取得
    const pagesRes = await fetch(`${META_GRAPH_URL}/me/accounts?access_token=${accessToken}`);
    const pagesData = (await pagesRes.json()) as PagesResponse;

    if (!pagesData.data || pagesData.data.length === 0) {
      return c.json(
        { error: "Facebook ページが見つかりません。ビジネスアカウントに紐づくページが必要です" },
        400,
      );
    }

    // Step 4: Instagram ビジネスアカウントを探す
    const igAccount = await findInstagramAccount(pagesData.data);
    if (!igAccount) {
      return c.json(
        {
          error:
            "Instagram ビジネスアカウントが見つかりません。Facebook ページに Instagram ビジネスアカウントを紐づけてください",
        },
        400,
      );
    }

    // Step 5: DB に保存
    const result = await c.var.instagramAccountUseCase.upsert({
      projectId,
      instagramUserId: igAccount.instagramUserId,
      instagramUsername: igAccount.instagramUsername,
      facebookPageId: igAccount.facebookPageId,
      accessToken: igAccount.pageAccessToken,
      tokenExpiresAt,
    });

    if (!result.ok) {
      return c.json({ error: "アカウント情報の保存に失敗しました" }, 500);
    }

    return c.json({
      ok: true,
      account: {
        instagramUserId: igAccount.instagramUserId,
        instagramUsername: igAccount.instagramUsername,
        facebookPageId: igAccount.facebookPageId,
      },
    });
  } catch (e) {
    console.error("Meta OAuth error:", e);
    return c.json({ error: "OAuth 処理中にエラーが発生しました" }, 500);
  }
});

// ============================================================
// GET /meta/account — 接続済みアカウント情報を返す
// ============================================================
const getAccountHandler = projectGuard.createHandlers(async (c) => {
  const { projectId } = c.var.session;
  if (!projectId) {
    return c.json({ error: "プロジェクトが選択されていません" }, 400);
  }

  const result = await c.var.instagramAccountUseCase.getByProjectId(projectId);
  if (!result.ok) {
    return c.json({ error: result.val }, 500);
  }

  if (!result.val) {
    return c.json({ connected: false });
  }

  return c.json({
    connected: true,
    account: {
      instagramUserId: result.val.instagramUserId,
      instagramUsername: result.val.instagramUsername,
      connectedAt: result.val.connectedAt,
    },
  });
});

// ============================================================
// DELETE /meta/account — アカウント連携を解除
// ============================================================
const deleteAccountHandler = projectGuard.createHandlers(async (c) => {
  const { projectId } = c.var.session;
  if (!projectId) {
    return c.json({ error: "プロジェクトが選択されていません" }, 400);
  }

  const result = await c.var.instagramAccountUseCase.deleteByProjectId(projectId);
  if (!result.ok) {
    return c.json({ error: result.val }, 500);
  }

  return c.json({ ok: true });
});

// ============================================================
// ルート定義
// ============================================================
export const route = projectGuard
  .createApp()
  .get("/auth", ...authHandler)
  .get("/callback", ...callbackHandler)
  .get("/account", ...getAccountHandler)
  .delete("/account", ...deleteAccountHandler);
