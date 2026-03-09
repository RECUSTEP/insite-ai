import { adminGuard } from "./_factory";

const getDashboardStatsHandler = adminGuard.createHandlers(async (c) => {
  const tz = 9 * 60 * 60 * 1000;
  const now = new Date(Date.now() + tz);
  const startOfMonth =
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0, 0) - tz;
  const endOfMonth =
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0, 23, 59, 59, 999) - tz;

  const [dailyResult, projectsResult, authResult, monthlyResult, usageByFeatureResult] =
    await Promise.all([
      c.var.apiUsageUseCase.getDailyUsageStats(30),
      c.var.projectUseCase.countProjects({}),
      c.var.authUseCase.count(),
      c.var.apiUsageUseCase.getTotalUsageCount(startOfMonth, endOfMonth),
      c.var.apiUsageUseCase.getUsageByFeature(startOfMonth, endOfMonth),
    ]);

  if (
    !dailyResult.ok ||
    !projectsResult.ok ||
    !authResult.ok ||
    !monthlyResult.ok ||
    !usageByFeatureResult.ok
  ) {
    const err =
      !dailyResult.ok
        ? dailyResult.val
        : !projectsResult.ok
          ? projectsResult.val
          : !authResult.ok
            ? authResult.val
            : !monthlyResult.ok
              ? monthlyResult.val
              : usageByFeatureResult.val;
    console.error("[GET /admin/dashboard-stats] error:", err);
    return c.json({ error: err }, 400);
  }

  return c.json({
    dailyUsage: dailyResult.val,
    totalProjects: projectsResult.val,
    totalAuth: authResult.val,
    monthlyUsage: monthlyResult.val,
    usageByFeature: usageByFeatureResult.val,
  });
});

export const route = adminGuard
  .createApp()
  .get("/", ...getDashboardStatsHandler);
