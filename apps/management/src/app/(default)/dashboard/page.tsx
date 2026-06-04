import { Text } from "@/components/ui/text";
import { createClient } from "@/lib/api";
import { BarChart3, Folder, Users, Zap } from "lucide-react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Box, Container, Grid, HStack, VStack } from "styled-system/jsx";
import { ActiveAccountsCard } from "./_components/active-accounts-card";
import { DashboardChart } from "./_components/dashboard-chart";
import { DashboardSideNav } from "./_components/dashboard-side-nav";
import { MonthlyUsageChart } from "./_components/monthly-usage-chart";
import { StatCard } from "./_components/stat-card";
import { UsageByAccountTable } from "./_components/usage-by-account-table";
import { UsageByFeatureChart } from "./_components/usage-by-feature-chart";

type UsageByAccountRow = {
  authId: string;
  companyName: string | null;
  totalCount: number;
  projectCount: number;
  apiUsageLimitTotal: number;
};

export default async function DashboardPage() {
  let data: {
    dailyUsage?: unknown[];
    totalProjects?: number;
    totalAuth?: number;
    activeAuth?: number;
    loginUsageRate?: number;
    monthlyUsage?: number;
    last30DaysUsage?: number;
    monthlyUsageStats?: unknown[];
    usageByFeature?: unknown[];
    usageByAccount?: unknown[];
  } | null = null;

  try {
    const client = createClient();
    const response = await client.admin["dashboard-stats"].$get(
      {},
      {
        headers: {
          cookie: cookies().toString(),
        },
      },
    );

    if (response.status === 401) {
      redirect("/login");
    }

    if (!response.ok) {
      const errText = await response.text();
      console.error("[Dashboard] API error:", response.status, errText);
    } else {
      data = await response.json();
    }
  } catch (e) {
    if (e instanceof Error && "digest" in e && e.message === "NEXT_REDIRECT") {
      throw e;
    }
    console.error("[Dashboard] fetch error:", e);
  }

  if (!data) {
    return (
      <Container py={6} w="full" maxW="full">
        <VStack gap={4} alignItems="stretch">
          <Text as="h1" size="xl">
            ダッシュボード
          </Text>
          <div
            style={{
              padding: "1.5rem",
              background: "#fef2f2",
              border: "1px solid #fecaca",
              borderRadius: "0.5rem",
              color: "#991b1b",
            }}
          >
            <p style={{ fontWeight: 600, marginBottom: "0.5rem" }}>データの取得に失敗しました</p>
            <p style={{ fontSize: "0.875rem" }}>
              ページを再読み込みするか、しばらく経ってから再度お試しください。
            </p>
          </div>
        </VStack>
      </Container>
    );
  }

  const dailyUsage = (Array.isArray(data.dailyUsage) ? data.dailyUsage : []) as {
    date: string;
    count: number;
  }[];
  const totalProjects = Number(data.totalProjects) || 0;
  const totalAuth = Number(data.totalAuth) || 0;
  const activeAuth = Number(data.activeAuth) || 0;
  const loginUsageRate = Number(data.loginUsageRate) || 0;
  const monthlyUsage = Number(data.monthlyUsage) || 0;
  const last30DaysUsage = Number(data.last30DaysUsage) || 0;
  const usageByFeature = (Array.isArray(data.usageByFeature) ? data.usageByFeature : []) as {
    feature: string;
    count: number;
  }[];
  const usageByAccount = (
    Array.isArray(data.usageByAccount) ? data.usageByAccount : []
  ) as UsageByAccountRow[];
  const monthlyUsageStats = (
    Array.isArray(data.monthlyUsageStats) ? data.monthlyUsageStats : []
  ) as { month: string; count: number }[];

  const now = new Date();
  const monthLabel = `${now.getFullYear()}年${now.getMonth() + 1}月`;
  const avgUsagePerActive = activeAuth > 0 ? Math.round(monthlyUsage / activeAuth) : 0;

  return (
    <Container py={6} w="full" maxW="full">
      <Grid columns={{ base: 1, lg: 12 }} gap={6} w="full" alignItems="start">
        {/* 左サイドバー: サマリーカード + セクション内ナビ */}
        <Box
          gridColumn={{ base: "auto", lg: "span 4", xl: "span 3" }}
          position={{ base: "static", lg: "sticky" }}
          top={{ base: "auto", lg: "6" }}
        >
          <VStack gap={4} alignItems="stretch">
            <VStack gap={1} alignItems="flex-start">
              <Text as="h1" size="xl">
                ダッシュボード
              </Text>
              <span style={{ fontSize: "0.75rem", color: "#71717A" }}>集計対象: {monthLabel}</span>
            </VStack>

            <StatCard
              label="直近30日のAPI使用量"
              value={last30DaysUsage}
              tone="blue"
              sub="全アカウント合計"
              icon={<Zap size={18} />}
            />
            <StatCard
              label="全体の使用率"
              value={`${loginUsageRate}%`}
              tone="emerald"
              sub={`ログイン中 ${activeAuth.toLocaleString()} / 全 ${totalAuth.toLocaleString()} アカウント`}
              icon={<Users size={18} />}
            />
            <StatCard
              label="総プロジェクト数"
              value={totalProjects}
              tone="violet"
              sub="登録済みプロジェクト"
              icon={<Folder size={18} />}
            />
            <StatCard
              label="アクティブ平均使用量"
              value={avgUsagePerActive}
              tone="amber"
              sub="稼働中アカウントあたり"
              icon={<BarChart3 size={18} />}
            />

            <DashboardSideNav
              items={[
                { href: "#trend", label: "30日間の推移" },
                { href: "#monthly", label: "月別推移（折れ線＋棒）" },
                { href: "#active", label: "全体の使用率" },
                { href: "#by-account", label: "アカウント別使用量" },
                { href: "#by-feature", label: "機能別使用量" },
              ]}
            />
          </VStack>
        </Box>

        {/* 右メインカラム: チャート・テーブル */}
        <Box gridColumn={{ base: "auto", lg: "span 8", xl: "span 9" }} minW={0}>
          <VStack gap={6} alignItems="stretch">
            <Section id="trend" title="直近30日間のAPI使用量" subtitle="日別の推移">
              <DashboardChart data={dailyUsage} />
            </Section>

            <Section
              id="monthly"
              title="月別API使用量（折れ線＋棒）"
              subtitle="直近12ヶ月の推移をパターン比較"
            >
              <MonthlyUsageChart data={monthlyUsageStats} />
            </Section>

            <Section id="active" title="全体の使用率" subtitle="ログイン中セッション基準">
              <ActiveAccountsCard activeAuth={activeAuth} totalAuth={totalAuth} />
            </Section>

            <Section
              id="by-account"
              title="アカウント別 API 使用量"
              subtitle={`${monthLabel} の利用状況（プロジェクト横断で集約）`}
            >
              <UsageByAccountTable data={usageByAccount} />
            </Section>

            <Section id="by-feature" title="今月の機能別API使用量" subtitle="機能ごとの利用回数">
              <UsageByFeatureChart data={usageByFeature ?? []} />
            </Section>
          </VStack>
        </Box>
      </Grid>
    </Container>
  );
}

function Section({
  id,
  title,
  subtitle,
  children,
}: {
  id: string;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <VStack gap={2} alignItems="stretch" id={id} scrollMarginTop="80px">
      <HStack justify="space-between" alignItems="baseline">
        <VStack gap={0.5} alignItems="flex-start">
          <Text as="h2" size="lg">
            {title}
          </Text>
          {subtitle ? (
            <span style={{ fontSize: "0.75rem", color: "#71717A" }}>{subtitle}</span>
          ) : null}
        </VStack>
      </HStack>
      {children}
    </VStack>
  );
}
