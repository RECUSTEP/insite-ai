import { projectGuard } from "./_factory";

const META_API_VERSION = "v21.0";
const META_GRAPH_URL = `https://graph.facebook.com/${META_API_VERSION}`;
const INSTAGRAM_GRAPH_URL = `https://graph.instagram.com/${META_API_VERSION}`;
const INSTAGRAM_LOGIN_SOURCE = "instagram_login";

type MetaApiError = {
  error?: { message: string; type: string; code: number };
};

type InsightResponse = {
  data?: Array<{
    name: string;
    period: string;
    values: Array<{ value: number }>;
  }>;
};

async function metaGet<T>(
  path: string,
  accessToken: string,
  baseUrl = META_GRAPH_URL,
): Promise<T & MetaApiError> {
  const separator = path.includes("?") ? "&" : "?";
  const res = await fetch(`${baseUrl}${path}${separator}access_token=${accessToken}`);
  return (await res.json()) as T & MetaApiError;
}

function getGraphBaseUrl(facebookPageId?: string | null) {
  return facebookPageId === INSTAGRAM_LOGIN_SOURCE ? INSTAGRAM_GRAPH_URL : META_GRAPH_URL;
}

async function fetchMediaInsights(
  mediaId: string,
  accessToken: string,
  graphBaseUrl: string,
  metrics: string[],
): Promise<InsightResponse & MetaApiError> {
  const batch = await metaGet<InsightResponse>(
    `/${mediaId}/insights?metric=${metrics.join(",")}`,
    accessToken,
    graphBaseUrl,
  );
  if (!batch.error) {
    return batch;
  }

  const data: NonNullable<InsightResponse["data"]> = [];
  for (const metric of metrics) {
    const single = await metaGet<InsightResponse>(
      `/${mediaId}/insights?metric=${metric}`,
      accessToken,
      graphBaseUrl,
    );
    if (single.error) {
      console.warn("Media insight metric skipped:", metric, single.error);
      continue;
    }
    data.push(...(single.data ?? []));
  }

  return data.length ? { data } : batch;
}

// ============================================================
// GET /meta-insights/profile — プロフィール情報 + フォロワー数
// ============================================================
const profileHandler = projectGuard.createHandlers(async (c) => {
  const { projectId } = c.var.session;
  if (!projectId) {
    return c.json({ error: "プロジェクトが選択されていません" }, 400);
  }

  const account = await c.var.instagramAccountUseCase.getByProjectId(projectId);
  if (!account.ok || !account.val) {
    return c.json({ error: "Instagram アカウントが連携されていません" }, 400);
  }

  const { instagramUserId, accessToken, facebookPageId } = account.val;
  const graphBaseUrl = getGraphBaseUrl(facebookPageId);

  const data = await metaGet<{
    id?: string;
    user_id?: string;
    username?: string;
    name?: string;
    biography?: string;
    followers_count?: number;
    follows_count?: number;
    media_count?: number;
    profile_picture_url?: string;
  }>(
    `/${facebookPageId === INSTAGRAM_LOGIN_SOURCE ? "me" : instagramUserId}?fields=id,user_id,username,name,biography,followers_count,follows_count,media_count,profile_picture_url`,
    accessToken,
    graphBaseUrl,
  );

  if (data.error) {
    console.error("Profile fetch error:", data.error);
    return c.json({ error: `Meta API エラー: ${data.error.message}` }, 400);
  }

  return c.json({
    username: data.username,
    name: data.name,
    biography: data.biography,
    followersCount: data.followers_count,
    followsCount: data.follows_count,
    mediaCount: data.media_count,
    profilePictureUrl: data.profile_picture_url,
  });
});

// ============================================================
// GET /meta-insights/profile-insights — プロフィールインサイト
// period: day(デフォルト), week, days_28
// ============================================================
const profileInsightsHandler = projectGuard.createHandlers(async (c) => {
  const { projectId } = c.var.session;
  if (!projectId) {
    return c.json({ error: "プロジェクトが選択されていません" }, 400);
  }

  const account = await c.var.instagramAccountUseCase.getByProjectId(projectId);
  if (!account.ok || !account.val) {
    return c.json({ error: "Instagram アカウントが連携されていません" }, 400);
  }

  const { instagramUserId, accessToken, facebookPageId } = account.val;
  const graphBaseUrl = getGraphBaseUrl(facebookPageId);
  const period = c.req.query("period") || "day";
  const since = c.req.query("since");
  const until = c.req.query("until");

  const metrics =
    facebookPageId === INSTAGRAM_LOGIN_SOURCE
      ? ["views", "reach", "profile_views"].join(",")
      : ["impressions", "reach", "profile_views"].join(",");
  const params = new URLSearchParams({
    metric: metrics,
    period,
  });
  if (since) {
    params.set("since", since);
  }
  if (until) {
    params.set("until", until);
  }

  const data = await metaGet<{
    data?: Array<{
      name: string;
      period: string;
      values: Array<{ value: number; end_time: string }>;
    }>;
  }>(
    `/${facebookPageId === INSTAGRAM_LOGIN_SOURCE ? "me" : instagramUserId}/insights?${params.toString()}`,
    accessToken,
    graphBaseUrl,
  );

  if (data.error) {
    console.error("Profile insights error:", data.error);
    return c.json({ error: `Meta API エラー: ${data.error.message}` }, 400);
  }

  return c.json({
    insights:
      data.data?.map((metric) => ({
        ...metric,
        values: metric.values.map((value) => ({
          value: value.value,
          endTime: value.end_time,
        })),
      })) ?? [],
  });
});

// ============================================================
// GET /meta-insights/media — 投稿一覧（最新25件）
// ============================================================
const mediaHandler = projectGuard.createHandlers(async (c) => {
  const { projectId } = c.var.session;
  if (!projectId) {
    return c.json({ error: "プロジェクトが選択されていません" }, 400);
  }

  const account = await c.var.instagramAccountUseCase.getByProjectId(projectId);
  if (!account.ok || !account.val) {
    return c.json({ error: "Instagram アカウントが連携されていません" }, 400);
  }

  const { instagramUserId, accessToken, facebookPageId } = account.val;
  const graphBaseUrl = getGraphBaseUrl(facebookPageId);
  const limit = c.req.query("limit") || "25";

  const data = await metaGet<{
    data?: Array<{
      id: string;
      caption?: string;
      media_type: string;
      media_url?: string;
      thumbnail_url?: string;
      timestamp: string;
      like_count?: number;
      comments_count?: number;
      permalink: string;
    }>;
  }>(
    `/${facebookPageId === INSTAGRAM_LOGIN_SOURCE ? "me" : instagramUserId}/media?fields=id,caption,media_type,media_url,thumbnail_url,timestamp,like_count,comments_count,permalink&limit=${limit}`,
    accessToken,
    graphBaseUrl,
  );

  if (data.error) {
    console.error("Media fetch error:", data.error);
    return c.json({ error: `Meta API エラー: ${data.error.message}` }, 400);
  }

  return c.json({ media: data.data ?? [] });
});

// ============================================================
// GET /meta-insights/media/:mediaId — 個別投稿のインサイト
// ============================================================
const mediaInsightsHandler = projectGuard.createHandlers(async (c) => {
  const { projectId } = c.var.session;
  if (!projectId) {
    return c.json({ error: "プロジェクトが選択されていません" }, 400);
  }

  const account = await c.var.instagramAccountUseCase.getByProjectId(projectId);
  if (!account.ok || !account.val) {
    return c.json({ error: "Instagram アカウントが連携されていません" }, 400);
  }

  const { accessToken, facebookPageId } = account.val;
  const graphBaseUrl = getGraphBaseUrl(facebookPageId);
  const mediaId = c.req.param("mediaId");

  // IMAGE/VIDEO/CAROUSEL_ALBUM で取得可能なメトリクスが異なるため、まず media_type を確認
  const mediaInfo = await metaGet<{ media_type?: string }>(
    `/${mediaId}?fields=media_type`,
    accessToken,
    graphBaseUrl,
  );

  if (mediaInfo.error) {
    return c.json({ error: `Meta API エラー: ${mediaInfo.error.message}` }, 400);
  }

  const isReelOrVideo = mediaInfo.media_type === "VIDEO" || mediaInfo.media_type === "REEL";
  const isInstagramLogin = facebookPageId === INSTAGRAM_LOGIN_SOURCE;

  const metrics = isInstagramLogin
    ? isReelOrVideo
      ? ["views", "reach", "saved", "likes", "comments", "shares", "plays", "total_interactions"]
      : ["views", "reach", "saved", "likes", "comments", "shares", "total_interactions"]
    : isReelOrVideo
      ? [
          "impressions",
          "reach",
          "saved",
          "likes",
          "comments",
          "shares",
          "plays",
          "total_interactions",
        ]
      : ["impressions", "reach", "saved", "likes", "comments", "shares", "total_interactions"];

  const data = await fetchMediaInsights(mediaId, accessToken, graphBaseUrl, metrics);

  if (data.error) {
    console.error("Media insights error:", data.error);
    return c.json({ error: `Meta API エラー: ${data.error.message}` }, 400);
  }

  // フラットなオブジェクトに変換
  const insights: Record<string, number> = {};
  for (const metric of data.data ?? []) {
    insights[metric.name] = metric.values[0]?.value ?? 0;
  }

  return c.json({ mediaId, insights });
});

// ============================================================
// ルート定義
// ============================================================
export const route = projectGuard
  .createApp()
  .get("/profile", ...profileHandler)
  .get("/profile-insights", ...profileInsightsHandler)
  .get("/media", ...mediaHandler)
  .get("/media/:mediaId", ...mediaInsightsHandler);
