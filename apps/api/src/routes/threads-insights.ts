import { projectGuard } from "./_factory";

const THREADS_GRAPH_URL = "https://graph.threads.net/v1.0";

type ThreadsApiError = {
  error?: { message: string; type?: string; code?: number; error_subcode?: number };
  error_message?: string;
  error_type?: string;
  code?: number;
};

type InsightResponse = {
  data?: Array<{
    name: string;
    period: string;
    values: Array<{ value: number; end_time?: string }>;
  }>;
};

type ThreadsMediaItem = {
  id: string;
  media_product_type?: string;
  media_type?: string;
  media_url?: string;
  permalink?: string;
  owner?: { id?: string };
  username?: string;
  text?: string;
  timestamp?: string;
  shortcode?: string;
  thumbnail_url?: string;
  children?: { data?: Array<{ id: string }> };
  is_quote_post?: boolean;
};

async function threadsGet<T>(path: string, accessToken: string): Promise<T & ThreadsApiError> {
  const separator = path.includes("?") ? "&" : "?";
  const res = await fetch(`${THREADS_GRAPH_URL}${path}${separator}access_token=${accessToken}`);
  return (await res.json()) as T & ThreadsApiError;
}

function threadsErrorMessage(data: ThreadsApiError) {
  return data.error?.message ?? data.error_message ?? "Threads API の取得に失敗しました";
}

async function fetchMediaInsights(
  mediaId: string,
  accessToken: string,
  metrics: string[],
): Promise<InsightResponse & ThreadsApiError> {
  const batch = await threadsGet<InsightResponse>(
    `/${mediaId}/insights?metric=${metrics.join(",")}`,
    accessToken,
  );
  if (!batch.error && !batch.error_message) {
    return batch;
  }

  const data: NonNullable<InsightResponse["data"]> = [];
  for (const metric of metrics) {
    const single = await threadsGet<InsightResponse>(
      `/${mediaId}/insights?metric=${metric}`,
      accessToken,
    );
    if (single.error || single.error_message) {
      console.warn("Threads media insight metric skipped:", metric, threadsErrorMessage(single));
      continue;
    }
    data.push(...(single.data ?? []));
  }

  return data.length ? { data } : batch;
}

async function getMediaInsights(mediaId: string, accessToken: string) {
  const data = await fetchMediaInsights(mediaId, accessToken, [
    "views",
    "likes",
    "replies",
    "reposts",
    "quotes",
    "shares",
  ]);

  if (data.error || data.error_message) {
    throw new Error(threadsErrorMessage(data));
  }

  const insights: Record<string, number> = {};
  for (const metric of data.data ?? []) {
    insights[metric.name] = metric.values[0]?.value ?? 0;
  }
  return insights;
}

const profileHandler = projectGuard.createHandlers(async (c) => {
  const { projectId } = c.var.session;
  if (!projectId) {
    return c.json({ error: "プロジェクトが選択されていません" }, 400);
  }

  const account = await c.var.threadsAccountUseCase.getByProjectId(projectId);
  if (!account.ok || !account.val) {
    return c.json({ error: "Threads アカウントが連携されていません" }, 400);
  }

  const data = await threadsGet<{
    id?: string;
    username?: string;
    name?: string;
    threads_profile_picture_url?: string;
    threads_biography?: string;
  }>(
    "/me?fields=id,username,name,threads_profile_picture_url,threads_biography",
    account.val.accessToken,
  );

  if (data.error || data.error_message) {
    console.error("Threads profile fetch error:", data);
    return c.json({ error: `Threads API エラー: ${threadsErrorMessage(data)}` }, 400);
  }

  return c.json({
    username: data.username,
    name: data.name,
    biography: data.threads_biography,
    profilePictureUrl: data.threads_profile_picture_url,
  });
});

const profileInsightsHandler = projectGuard.createHandlers(async (c) => {
  const { projectId } = c.var.session;
  if (!projectId) {
    return c.json({ error: "プロジェクトが選択されていません" }, 400);
  }

  const account = await c.var.threadsAccountUseCase.getByProjectId(projectId);
  if (!account.ok || !account.val) {
    return c.json({ error: "Threads アカウントが連携されていません" }, 400);
  }

  const params = new URLSearchParams({ metric: "views" });
  const since = c.req.query("since");
  const until = c.req.query("until");
  if (since) {
    params.set("since", since);
  }
  if (until) {
    params.set("until", until);
  }

  const data = await threadsGet<InsightResponse>(
    `/${account.val.threadsUserId}/threads_insights?${params.toString()}`,
    account.val.accessToken,
  );

  if (data.error || data.error_message) {
    console.error("Threads profile insights error:", data);
    return c.json({ error: `Threads API エラー: ${threadsErrorMessage(data)}` }, 400);
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

const mediaHandler = projectGuard.createHandlers(async (c) => {
  const { projectId } = c.var.session;
  if (!projectId) {
    return c.json({ error: "プロジェクトが選択されていません" }, 400);
  }

  const account = await c.var.threadsAccountUseCase.getByProjectId(projectId);
  if (!account.ok || !account.val) {
    return c.json({ error: "Threads アカウントが連携されていません" }, 400);
  }

  const limit = c.req.query("limit") || "25";
  const includeInsights = c.req.query("includeInsights") === "true";
  const accessToken = account.val.accessToken;
  const fields = [
    "id",
    "media_product_type",
    "media_type",
    "media_url",
    "permalink",
    "owner",
    "username",
    "text",
    "timestamp",
    "shortcode",
    "thumbnail_url",
    "children",
    "is_quote_post",
  ].join(",");
  const data = await threadsGet<{ data?: ThreadsMediaItem[] }>(
    `/${account.val.threadsUserId}/threads?fields=${fields}&limit=${limit}`,
    accessToken,
  );

  if (data.error || data.error_message) {
    console.error("Threads media fetch error:", data);
    return c.json({ error: `Threads API エラー: ${threadsErrorMessage(data)}` }, 400);
  }

  if (!includeInsights) {
    return c.json({ media: data.data ?? [] });
  }

  const mediaWithInsights = await Promise.all(
    (data.data ?? []).map(async (item) => {
      try {
        return {
          ...item,
          insights: await getMediaInsights(item.id, accessToken),
        };
      } catch (e) {
        const message = e instanceof Error ? e.message : "投稿インサイトを取得できませんでした";
        console.warn("Threads media insights skipped:", item.id, message);
        return {
          ...item,
          insights: {},
          insight_error: message,
        };
      }
    }),
  );

  return c.json({ media: mediaWithInsights });
});

const mediaInsightsHandler = projectGuard.createHandlers(async (c) => {
  const { projectId } = c.var.session;
  if (!projectId) {
    return c.json({ error: "プロジェクトが選択されていません" }, 400);
  }

  const account = await c.var.threadsAccountUseCase.getByProjectId(projectId);
  if (!account.ok || !account.val) {
    return c.json({ error: "Threads アカウントが連携されていません" }, 400);
  }

  const mediaId = c.req.param("mediaId");
  try {
    return c.json({
      mediaId,
      insights: await getMediaInsights(mediaId, account.val.accessToken),
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "投稿インサイトを取得できませんでした";
    console.error("Threads media insights error:", message);
    return c.json({ error: `Threads API エラー: ${message}` }, 400);
  }
});

export const route = projectGuard
  .createApp()
  .get("/profile", ...profileHandler)
  .get("/profile-insights", ...profileInsightsHandler)
  .get("/media", ...mediaHandler)
  .get("/media/:mediaId", ...mediaInsightsHandler);
