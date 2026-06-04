import { adminGuard } from "./_factory";

const getDashboardStatsHandler = adminGuard.createHandlers(async (c) => {
  const tz = 9 * 60 * 60 * 1000;
  const now = new Date(Date.now() + tz);
  const startOfMonth = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0, 0) - tz;
  const endOfMonth = Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0, 23, 59, 59, 999) - tz;
  const startOfLast30Days = Date.now() - 30 * 24 * 60 * 60 * 1000;

  const [
    dailyResult,
    projectsResult,
    authResult,
    monthlyResult,
    last30DaysResult,
    usageByFeatureResult,
    usageByAccountResult,
    activeAuthResult,
    monthlyStatsResult,
  ] = await Promise.all([
    c.var.apiUsageUseCase.getDailyUsageStats(30),
    c.var.projectUseCase.countProjects({}),
    c.var.authUseCase.count(),
    c.var.apiUsageUseCase.getTotalUsageCount(startOfMonth, endOfMonth),
    c.var.apiUsageUseCase.getTotalUsageCount(startOfLast30Days, Date.now()),
    c.var.apiUsageUseCase.getUsageByFeature(startOfMonth, endOfMonth),
    c.var.apiUsageUseCase.getUsageByAccount(startOfMonth, endOfMonth),
    c.var.authUseCase.countActive(Date.now()),
    c.var.apiUsageUseCase.getMonthlyUsageStats(12),
  ]);

  if (
    !dailyResult.ok ||
    !projectsResult.ok ||
    !authResult.ok ||
    !monthlyResult.ok ||
    !last30DaysResult.ok
  ) {
    const err = !dailyResult.ok
      ? dailyResult.val
      : !projectsResult.ok
        ? projectsResult.val
        : !authResult.ok
          ? authResult.val
          : !monthlyResult.ok
            ? monthlyResult.val
            : last30DaysResult.val;
    console.error("[GET /admin/dashboard-stats] error:", err);
    return c.json({ error: err }, 400);
  }

  // 失敗してもダッシュボード全体は表示できるようにフォールバック
  const usageByFeature = usageByFeatureResult.ok ? usageByFeatureResult.val : [];
  if (!usageByFeatureResult.ok) {
    console.warn("[GET /admin/dashboard-stats] usageByFeature failed:", usageByFeatureResult.val);
  }
  const usageByAccount = usageByAccountResult.ok ? usageByAccountResult.val : [];
  if (!usageByAccountResult.ok) {
    console.warn("[GET /admin/dashboard-stats] usageByAccount failed:", usageByAccountResult.val);
  }
  const activeAuth = activeAuthResult.ok ? activeAuthResult.val : 0;
  if (!activeAuthResult.ok) {
    console.warn("[GET /admin/dashboard-stats] activeAuth failed:", activeAuthResult.val);
  }
  const monthlyUsageStats = monthlyStatsResult.ok ? monthlyStatsResult.val : [];
  if (!monthlyStatsResult.ok) {
    console.warn("[GET /admin/dashboard-stats] monthlyUsageStats failed:", monthlyStatsResult.val);
  }

  return c.json({
    dailyUsage: dailyResult.val,
    totalProjects: projectsResult.val,
    totalAuth: authResult.val,
    activeAuth,
    loginUsageRate: authResult.val > 0 ? Math.round((activeAuth / authResult.val) * 1000) / 10 : 0,
    monthlyUsage: monthlyResult.val,
    last30DaysUsage: last30DaysResult.val,
    monthlyUsageStats,
    usageByFeature,
    usageByAccount,
  });
});

export const route = adminGuard.createApp().get("/", ...getDashboardStatsHandler);
